/**
 * Add the ratings of all the players...
 *
 */
// function addPlayerRatings() {

import {
  IMatchDetails,
  IMatchEvent,
  IMatchSideDetails,
  Match,
} from '../../classes/Match';
import { CalendarMatch } from '../calendar/calendar.model';
import { ClubStandings } from '../seasons/season.model';
import { findOneAndUpdate as updateSeason } from '../seasons/season.service';
import { findOneAndUpdate } from '../fixtures/fixture.service';
import { findOne } from '../days/day.service';
import { Types } from 'mongoose';

interface Team {
  id: string;
  name: string;
  clubCode: string;
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
    Winner: MatchDetails.Winner ? MatchDetails.Winner!.id : null,
    Loser: MatchDetails.Loser ? MatchDetails.Loser!.id : null,
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

  //  Find that particular fixture that has not been played of course...
  return findOneAndUpdate(
    { _id: fixture_id, Played: false },
    {
      Played: true,
      PlayedAt: new Date(),
      Details: matchDetails,
      Events,
      HomeSideDetails,
      AwaySideDetails,
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

  // findOneAndUpdate({})

  // Now save this in the Standings array

  // THANK YOU JESUS! I LOVE YOU LORD

  // Thank you Jesus!
  // We can get the season id from fixture or from query params...
  // Better to get it from Fixture object... THANK YOU JESUS!

  // Find the week and the club and update them!
  const query = { 'Matches.Fixture': Types.ObjectId(fixture_id) };

  // TODO: handle cases where there's no match that day
  const getMatchWeek = async () => {
    return findOne(query, false)
      .then((day) => {
        console.log('Day =>', day);

        // Then find the array position...
        const matchIndex = day.Matches.findIndex(
          (m) => m.Fixture.toString() === fixture_id
        );

        return day.Matches[matchIndex].Week;
      })
      .catch((err) => {
        console.log('err =>', err);
        throw new Error(err);
      });
  };

  // const query = { 'Matches.$.Fixture': fixture_id };

  //   findOne(query, false).then(
  //     day => {
  // console.log('Day =>', day)
  //     }
  //   )
  //   .catch(err => {
  //     console.log('err =>',err);
  //   });

  /**
   * { 'Standings.${week -1}.Table.ClubCode...: $set: {} }
   */

  const updateTable = async (week: number) => {
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

    return updateSeason(
      { _id: seasonID.toString() },
      {
        $set: {
          [hw]: homeTable,
          [aw]: awayTable,
        },
      },
      options
    )
      .then((res) => {
        console.log(res);
        return { homeTable, awayTable };
      })
      .catch((err) => {
        console.log(err);
        throw new Error(err);
      });
  };

  return getMatchWeek().then(updateTable);
  // Now find the week and update it :)
  //  TO do that we need the Fixture ID, shey?
}
