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
import { findOneAndUpdate } from '../fixtures/fixture.service';
import { response } from 'express';

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
    Winner: MatchDetails.Winner!.id,
    Loser: MatchDetails.Loser!.id,
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
  week: number,
  home: Team,
  away: Team,
  seasonID: string
) {
  // Find out who...
  // HomeSideDetails.Won = MatchDetails.Winner?.id === home.id;
  // AwaySideDetails.Won = MatchDetails.Winner?.id === away.id;
  // Maybe we should only update these one by one...
  // const homePoints = homeDetails.Goals > awayDetails.Goals ? '3' : homeDetails.Goals == awayDetails

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

  // TODO: make Calendar Day a separate collection...
  // THANK YOU JESUS! I LOVE YOU LORD

  return { homeTable, awayTable };
  // Now find the week and update it :)
  //  TO do that we need the Fixture ID, shey?
}
