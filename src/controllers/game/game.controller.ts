// Sockets...

import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

import { fetchOneById } from '../fixtures/fixture.service';
import { findOne as findDay } from '../days/day.service';
import { Fixture } from '../fixtures/fixture.model';
import { updateFixture, updateStandings } from './functions';
import { changeCurrentDay } from '../calendar/calendar.controller';
import responseHandler from '../../helpers/responseHandler';
import { Match } from '../../classes/Match';
import Ball from '../../classes/Ball';
import FieldPlayer from '../../classes/FieldPlayer';
import App from '../app/App';
import Game from '../Game';
import log from '../../helpers/logger';
import { SeasonInterface } from '../seasons/season.model';
import { fetchSeason } from '../seasons/season.service';
import axios from 'axios';

async function play(fixture_id: string) {
  let CurrentMatch = {};

  // [1]
  if (!fixture_id) {
    // SEND IT BACK!
    throw new Error('No Fixture ID sent! ' + fixture_id);
  }

  // [2]
  let fixture: Fixture;

  // fetch fixture...
  try {
    // get fixture and its details...
    fixture = await fetchOneById(fixture_id, false);
    // We also need to get the associated calendar day...
  } catch (error) {
    throw error;
  }

  if (!fixture) {
    throw new Error('Fixture not found [f =>' + fixture_id + ' ]');
  }

  // UNCOMMENT O => Check if Fixture is played already
  // if (!fixture.Played) {
  //   throw new Error({msg: 'Fixture already played!', data: {
  //     match: fixture_id,
  //     matchErrorResponseCode: 1
  //   }});
  // };

  // [3]
  CurrentMatch.SeasonCode = fixture.SeasonCode;
  CurrentMatch.App = new App();
  const SeasonCode = fixture.SeasonCode;

  let { HomeTeam: home, AwayTeam: away } = fixture;

  home = home.toString();
  away = away.toString();

  try {
    await CurrentMatch.App.setupGame([home, away], {
      home,
      away,
    });
  } catch (error) {
    log(`Error setting up game! (in Rest) => ${error}`);
    throw error;
  }

  // [3.1] Define helper functions
  const updateRelatedData = ({
    match,
    home,
    away,
    season_id,
    HomeSideDetails,
    AwaySideDetails,
  }) => {
    CurrentMatch = {
      ...CurrentMatch,
      match,
      home,
      away,
      season_id,
      HomeSideDetails,
      AwaySideDetails,
    };

    return updateStandings(
      HomeSideDetails,
      AwaySideDetails,
      fixture_id,
      home,
      away,
      season_id
    );
  };

  const afterMatch = async ({ homeTable, awayTable, matches, currentDay }) => {
    // Check if we need to update Calendar day
    const allMatchesPlayed = matches.every((m) => m.Played);

    /** If all matches in the Day have been played, we can change the
     * CurrentDay...
     */
    if (allMatchesPlayed) {
      // We have to get this from the kini...
      // TODO there should be a better way to get these constants...
      const currentYear = CurrentMatch.SeasonCode.split('-')
        .splice(1)
        .join('-');

      try {
        await changeCurrentDay(currentYear, currentDay);
        // App._app.endGame();
      } catch (error) {
        console.log('Error changing current Calendar Day!', error);
        // throw error;
        throw new Error('Error updating current Day ' + error.toString());
      }
    }

    // check the fixture position...
    let season: SeasonInterface;
    let lastMatchOfSeason;

    // season.Competition maybe find the competition and do the needful...

    try {
      const q = {
        _id: CurrentMatch.season_id,
        isStarted: true,
        isFinished: false,
      };
      // get fixture and its details...
      // tho, part of the query should be the year. Year should be the CurrentYear
      season = await fetchSeason(q, 'Fixtures', false);
      // We also need to get the associated calendar day...
      if (season) {
        //  if this fixture's
        lastMatchOfSeason =
          season.Fixtures.findIndex((f) => fixture_id == f) ==
          season.Fixtures.length - 1;
      }

      // THIS SHOULD BE THE LAST THING!

      /**
       * 1. Get current Day with other Matches
       * 2. Check their Played status.
       * 3. Call this same function for all Fixtures which have not been played yet.
       * 4. When you're done, collect the results and send back to client...
       */
      CurrentMatch.App.endGame();
      log('GAME ENDED from App');


      // console.log(`The Match instances ${Match.instances}`);
      // console.log(`The Game instances ${Game.instances}`);
      // console.log(CurrentMatch.App.Game);
      // console.log(`The Ball instances ${Ball.instances}`);
      // console.log(`The FieldPlayer instances ${FieldPlayer.instances}`);

      // check
      return {
        homeTable,
        awayTable,
        match: CurrentMatch.match,
        HomeSideDetails: CurrentMatch.HomeSideDetails,
        AwaySideDetails: CurrentMatch.AwaySideDetails,
        lastMatchOfSeason,
      };
    } catch (error) {
      console.log(`Error at afterMatch -> ` + error.toString());

      console.log(
        'Could not check if Season is over, you should do that manually!'
      );

      throw error;
    }
  };

  // [4] Play Match
  log('Here in startGame!');
  // NOTE: removing static App method. Thank you Jesus!
  return CurrentMatch.App
    .startGame()
    ?.then(async (m) => {
      // throw 'Ending match here :)';
      const homeObj = {
        id: m.Home._id,
        name: m.Home.Name,
        clubCode: m.Home.ClubCode,
        manager: m.Home.Manager,
      };

      const awayObj = {
        id: m.Away._id,
        name: m.Away.Name,
        clubCode: m.Away.ClubCode,
        manager: m.Away.Manager,
      };

      let match: Fixture;
      let HomeSideDetails;
      let AwaySideDetails;

      try {
        const { fixture: matchFixture, HSD, ASD } = await updateFixture(
          m.Details,
          m.Events,
          homeObj,
          awayObj,
          fixture_id
        );


        if (!fixture) {
          throw new Error('Error updating Fixture, Match not found!');
        }

        // console.log(`The Match instances ${Match.instances}`);
        // console.log(`The Game instances ${Game.instances}`);
        // console.log(`The Ball instances ${Ball.instances}`);
        // console.log(CurrentMatch.App.Game.MatchBall);
        // console.log(`The FieldPlayer instances ${FieldPlayer.instances}`);

        CurrentMatch.match = matchFixture;
        CurrentMatch.home = homeObj;
        CurrentMatch.away = awayObj;
        CurrentMatch.HomeSideDetails = HSD;
        CurrentMatch.AwaySideDetails = ASD;

        return {
          home: homeObj,
          away: awayObj,
          match: matchFixture,
          HomeSideDetails: HSD,
          AwaySideDetails: ASD,
          season_id: fixture.Season,
        };
      } catch (error) {
        console.error('Error updating fixture! :( => \n', error);

        throw error;

        //  throw new Error({msg: 'Error updating Fixture ' + error.toString(), data: {
        //       error,
        //       match: fixture_id,
        //       matchErrorResponseCode: 6
        // }});
      }
    })
    .then(updateRelatedData)
    .then(afterMatch);

  // [5] Update standings and shii... do later :)
}

export async function restPlayGameNew(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const fixture_id = req.params.fixture;
  const send_other_results = req.query.send_other_results == "true";
  const simulate_rest  = req.query.simulate_rest == "true";
  // Play the 'main' fixture
  play(fixture_id)
    .then(async (d) => {

      const results = {
        main: d,
        others: []
      };

      // for the other matches
      // TODO: THIS IS TEMPORARY.
      // I want to try to put these api stuff in a function and just call it, once.

      if (simulate_rest) {
        // call siumlate sequence...
        const matchDay = await findDay(
          { 'Matches.Fixture': Types.ObjectId(fixture_id) },
          false
        );

        if (!matchDay || matchDay.isFree) {
          return responseHandler.fail(
              res,
              400,
              'Match Day not found!'
            );
        }

        const matches_not_played = matchDay.Matches.filter((m) => !m.Played);
        // Don't play last matches!
        const fixtures_not_played = matches_not_played.map((m) => m.Fixture);

        try {

        // const fixtures_not_played_endpoints = fixtures_not_played
        // .map(f => `http://${req.header('Host')}/api/game/kickoff/${f}`);

        // NOTE: doing this in a foreach would not be synchronous (one by one)
        for (let index = 0; index < fixtures_not_played.length; index++){
          // let r = await axios.get(fixtures_not_played_endpoints[index]);
          let r = await play(fixtures_not_played[index].toString());
          let result;
          if(r.data && r.data.payload) {
            result = r.data.payload;
          } else {
            result = r;
          };
          results.others.push(result);
        }

        // console.log(results);
           // return responseHandler.success(
           //    res,
           //    200,
           //    '[New] Match(es) Played successfully! Thank you Jesus!',
           //    results
           //  );

      } catch (error) {
        console.log(error);
         return responseHandler.fail(
        res,
        400,
        '[New] Error Playing Match(es) and updating Standings! ',
        { msg: error.toString(), error, fixture_id, matchErrorResponseCode: 2 }
      );
      }
      }

      return responseHandler.success(
        res,
        200,
        '[New] Match Played successfully! Thank you Jesus!',
        send_other_results ? results : results.main
      );
    })
    .catch((error) => {
      console.error('Error Playing Match with new endpoint => ', error);
      return responseHandler.fail(
        res,
        400,
        '[New] Error Playing Match and updating Standings! ',
        { msg: error.toString(), error, fixture_id, matchErrorResponseCode: 2 }
      );
    });
}

export async function restPlayGame(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { fixture: fixture_id } = req.params;

  if (!fixture_id) {
    // SEND IT BACK!
    return responseHandler.fail(res, 404, 'No Fixture ID sent!', {
      matchErrorResponseCode: 1,
    });
  }

  let fixture: Fixture;

  try {
    // get fixture and its details...
    fixture = await fetchOneById(fixture_id, false);
    // We also need to get the associated calendar day...
  } catch (error) {
    console.error('Error! Fetching Fixture to play match =>', error);

    return responseHandler.fail(
      res,
      400,
      'Error Playing Match! and fetching Fixture!',
      {
        ...error,
        matchErrorResponseCode: 1,
      }
    );
  }

  // TODO - UNCOMMENT O!
  // if (fixture!.Played) {
  //   // has been played!
  //   return responseHandler.fail(res, 400, 'Match has been played already!', {
  //     matchErrorResponseCode: 2,
  //   });
  // }

  req.body.SeasonCode = fixture.SeasonCode;

  let { HomeTeam: home, AwayTeam: away } = fixture;

  home = home.toString();
  away = away.toString();

  try {
    await App._app.setupGame([home, away], {
      home,
      away,
    });
  } catch (error) {
    log(`Error setting up game! (in Rest) => ${error}`);
    return responseHandler.fail(res, 400, 'Error starting Game!', {
      ...error,
      matchErrorResponseCode: 4,
    });
  }

  log('Here in startGame!');
  App._app
    .startGame()
    ?.then(async (m) => {
      const homeObj = {
        id: m.Home._id,
        name: m.Home.Name,
        clubCode: m.Home.ClubCode,
        manager: m.Home.Manager,
      };

      const awayObj = {
        id: m.Away._id,
        name: m.Away.Name,
        clubCode: m.Away.ClubCode,
        manager: m.Away.Manager,
      };

      let match: Fixture;
      let HomeSideDetails;
      let AwaySideDetails;

      try {
        const { fixture: matchFixture, HSD, ASD } = await updateFixture(
          m.Details,
          m.Events,
          homeObj,
          awayObj,
          fixture_id
        );

        if (!fixture) {
          return responseHandler.fail(
            res,
            400,
            'Error updating fixtures! - Match cannot be found!',
            {
              matchErrorResponseCode: 3,
            }
          );
        }

        req.body.home = homeObj;
        req.body.away = awayObj;
        req.body.match = matchFixture;
        req.body.HomeSideDetails = HSD;
        req.body.AwaySideDetails = ASD;
        req.body.season_id = fixture.Season;

        // console.log(`The Match instances ${Match.instances}`);
        // console.log(`The Ball instances ${Ball.instances}`);
        // console.log(`The FieldPlayer instances ${FieldPlayer.instances}`);
      } catch (error) {
        console.error('Error updating fixture! :( => \n', error);

        return responseHandler.fail(res, 400, 'Error updating fixtures!', {
          matchErrorResponseCode: 6,
        });
      }

      return next();
    })
    .catch((err) => {
      console.log('ERROR PLAYING MATCH!', err);

      console.log(`Error updating fixture...`, err);

      return responseHandler.fail(res, 400, 'Error playing match!', {
        ...err,
        matchErrorResponseCode: 5,
      });
    });
}

export function restUpdateStandings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Soon we will be getting it from the fixture object...
  // THANK YOU JESUS!

  const { fixture: fixture_id } = req.params;
  const {
    match,
    home,
    away,
    season_id,
    HomeSideDetails,
    AwaySideDetails,
  } = req.body;

  updateStandings(
    HomeSideDetails,
    AwaySideDetails,
    fixture_id,
    home,
    away,
    season_id
  )
    .then(async ({ homeTable, awayTable, matches, currentDay }) => {
      // Check if we need to update Calendar day
      const allMatchesPlayed = matches.every((m) => m.Played);

      // move current Day!
      req.body.homeTable = homeTable;
      req.body.awayTable = awayTable;

      /** If all matches in the Day have been played, we can change the
       * CurrentDay...
       */
      if (allMatchesPlayed) {
        // We have to get this from the kini...
        // TODO there should be a better way to get these constants...
        const currentYear = req.body.SeasonCode.split('-').splice(1).join('-');
        changeCurrentDay(currentYear, currentDay)
          .then(() => {
            console.log('Current Day changed successfully!');
            // App._app.endGame();
            // log('GAME ENDED from App');
          })
          .catch((err) => {
            console.log('Error changing current Calendar Day!', err);
            return responseHandler.fail(
              res,
              400,
              'Error changing current Calendar Day!',
              err
            );
          });
      }

      // check the fixture position...
      let season: SeasonInterface;
      let lastMatchOfSeason;

      // season.Competition maybe find the competition and do the needful...

      try {
        const q = { _id: season_id, isStarted: true, isFinished: false };
        // get fixture and its details...
        // tho, part of the query should be the year. Year should be the CurrentYear
        season = await fetchSeason(q, 'Fixtures', false);
        // We also need to get the associated calendar day...
        if (season) {
          //  if this fixture's
          lastMatchOfSeason =
            season.Fixtures.findIndex((f) => fixture_id == f) ==
            season.Fixtures.length - 1;
        }

        // THIS SHOULD BE THE LAST THING!

        /**
         * 1. Get current Day with other Matches
         * 2. Check their Played status.
         * 3. Call this same function for all Fixtures which have not been played yet.
         * 4. When you're done, collect the results and send back to client...
         */
        App._app.endGame();
        log('GAME ENDED from App');

        // check
        return responseHandler.success(res, 200, 'Match Played successfully!', {
          homeTable,
          awayTable,
          match,
          HomeSideDetails,
          AwaySideDetails,
          lastMatchOfSeason,
        });
      } catch (error) {
        console.log(`Error! => ${error}`);

        console.log(
          'Could not check if Season is over, you should do that manually!'
        );
      }
    })
    .catch((err) => {
      console.log(err);
      responseHandler.fail(
        res,
        400,
        'Error Playing Match and updating Standings!',
        { ...err, matchErrorResponseCode: 2 }
      );
    })
    .finally(() => {
      // Delete CurrentMatch Instance...
      // Why are we ending the game here? We already end it if the match was successful, so no need.
      // If it fails, there's no 'game' to end :p Thank you Jesus!
      App._app.endGame();
      log('GAME ENDED from App');
    });
}
