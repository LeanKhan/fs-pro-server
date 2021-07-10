import {
  IMatchDetails,
  IMatchEvent,
  IMatchSideDetails,
} from '../../classes/Match';
import { ClubStandings } from '../seasons/season.model';
import { findOneAndUpdate as updateSeason } from '../seasons/season.service';
import { findOneAndUpdate } from '../fixtures/fixture.service';
import { findOneAndUpdate as updateDay } from '../days/day.service';
import { Types } from 'mongoose';
import { CalendarMatchInterface, DayInterface } from '../days/day.model';
import log from '../../helpers/logger';

interface Team {
  id: string;
  name: string;
  clubCode: string;
  manager: string;
}

// };

/**
 * Maybe we will update a player's rating only at the end of the season...
 */
export function updateFixture(
  MatchDetails: IMatchDetails,
  events: IMatchEvent[],
  home: Team,
  away: Team,
  fixture_id: string
) {
  const matchDetails = {
    ...MatchDetails,
    MOTM: MatchDetails.MOTM.id,
    Winner: MatchDetails.Winner ? MatchDetails.Winner.id : null,
    Loser: MatchDetails.Loser ? MatchDetails.Loser.id : null,
  };
  const Events = events;
  const HomeSideDetails = MatchDetails.HomeTeamDetails;
  const AwaySideDetails = MatchDetails.AwayTeamDetails;

  if (matchDetails.Draw) {
    HomeSideDetails.Won = false;
    AwaySideDetails.Won = false;
    HomeSideDetails.Drew = true;
    AwaySideDetails.Drew = true;
  } else {
    HomeSideDetails.Won = MatchDetails.Winner!.id === home.id;
    AwaySideDetails.Won = MatchDetails.Winner!.id === away.id;
  }

  /**
   * Things we need to update:
   * Played: true,
   * PlayedAt: new Date(),
   * Details: MatchDetails,
   * Events: MatchEvents,
   * HomeSideDetails:,
   * AwaySideDetails:,
   */

  /**
   * We also need to update the CalendarDayMatch for this match to 'Played: true'
   * - We also need to update the Week standings for both clubs...
   * - We need both information from the calendar day and from the Match...
   * - Each CalendarMatch has the week that they belong to though, so we can easily
   * (by God's grace) grab
   * the week from Seasons.Standings and update...
   *
   */

  //  { _id: fixture_id, Played: false }, TODO - Change back to this!
  //  Find that particular fixture that has not been played of course...
  return findOneAndUpdate(
    { _id: fixture_id },
    {
      Played: true,
      PlayedAt: new Date(),
      Details: matchDetails,
      Events,
      HomeSideDetails,
      AwaySideDetails,
      HomeManager: home.manager,
      AwayManager: away.manager,
    }
  );

  // Here we just need to save this data in the database...
}

export function updateStandings(
  homeDetails: IMatchSideDetails,
  awayDetails: IMatchSideDetails,
  fixture_id: string,
  home: Team,
  away: Team,
  seasonID: string
) {
  // Find out who...
  // HomeSideDetails.Won = MatchDetails.Winner?.id === home.id;
  // AwaySideDetails.Won = MatchDetails.Winner?.id === away.id;
  // Maybe we should only update these one by one...
  // const homePoints = homeDetails.Goals > awayDetails.Goals ? '3' : homeDetails.Goals == awayDetails

  // Maybe you should use the fixture code to get the day then the week...

  const homeTable: ClubStandings = {
    ClubCode: home.clubCode,
    ClubID: home.id,
    Points: 0,
    Played: 1,
    Wins: 0,
    Losses: 0,
    Draws: 0,
    GF: homeDetails.Goals,
    GA: awayDetails.Goals,
    GD: homeDetails.Goals - awayDetails.Goals,
  };
  const awayTable: ClubStandings = {
    ClubCode: away.clubCode,
    ClubID: away.id,
    Points: 0,
    Played: 1,
    Wins: 0,
    Losses: 0,
    Draws: 0,
    GF: awayDetails.Goals,
    GA: homeDetails.Goals,
    GD: awayDetails.Goals - homeDetails.Goals,
  };

  if (homeDetails.Goals > awayDetails.Goals) {
    homeTable.Draws = 0;
    homeTable.Points = 3;
    homeTable.Wins = 1;
    homeTable.Losses = 0;

    awayTable.Draws = 0;
    awayTable.Points = 0;
    awayTable.Wins = 0;
    awayTable.Losses = 1;
  } else if (awayDetails.Goals > homeDetails.Goals) {
    awayTable.Draws = 0;
    awayTable.Points = 3;
    awayTable.Wins = 1;
    awayTable.Losses = 0;

    homeTable.Draws = 0;
    homeTable.Points = 0;
    homeTable.Wins = 0;
    homeTable.Losses = 1;
  } else if (homeDetails.Goals === awayDetails.Goals) {
    // A draw...
    homeTable.Draws = 1;
    homeTable.Points = 1;
    homeTable.Wins = 0;
    homeTable.Losses = 0;

    awayTable.Draws = 1;
    awayTable.Points = 1;
    awayTable.Wins = 0;
    awayTable.Losses = 0;
  }

  const query = { 'Matches.Fixture': Types.ObjectId(fixture_id) };

  let currentDay: DayInterface;

  // TODO: handle cases where there's no match that day

  // We need to update the Day Match to Played!
  // Update the array element that matches that query
  /**
   * Updates the Match entry in Day and returns the week of the match
   *
   */
  const getWeekAndUpdateMatch = async () => {
    return updateDay(query, { $set: { 'Matches.$.Played': true } })
      .then((day) => {
        if (!day) {
          throw new Error(`Match Day does not exist!`);
        }

        currentDay = day;

        // Then find the array position...
        const matchIndex = day.Matches.findIndex(
          (m) => m.Fixture.toString() === fixture_id
        );

        return { week: day.Matches[matchIndex].Week, matches: day.Matches };
      })
      .catch((err) => {
        log(`err => ${err}`);
        throw new Error(err);
      });
  };

  /**
   * Update the standings based on the match result :)
   *
   * Thank you Jesus!
   * @param {number} week
   */
  const updateTable = async ({
    week,
    matches,
  }: {
    week: number;
    matches: CalendarMatchInterface[];
  }) => {
    const options = {
      upsert: false,
      arrayFilters: [
        {
          'home.ClubCode': home.clubCode,
        },
        {
          'away.ClubCode': away.clubCode,
        },
      ],
    };

    const hw = `Standings.${week - 1}.Table.$[home]`;
    const aw = `Standings.${week - 1}.Table.$[away]`;

    console.log(week);

    try {
      await updateSeason(
        { _id: seasonID.toString() },
        {
          $set: {
            [hw]: homeTable,
            [aw]: awayTable,
          },
        },
        options
      );

      return { homeTable, awayTable, matches, currentDay };
    } catch (error) {
      console.error('Error updating Season! :(', error);
      throw new Error(error);
    }
  };

  return getWeekAndUpdateMatch().then(updateTable);
}

/** update game and calendar */
// export function updateCalendar() {} TODO: FINISH THIS!
