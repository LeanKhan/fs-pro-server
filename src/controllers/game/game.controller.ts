// Sockets...

import { Request, Response, NextFunction } from 'express';
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
import log from '../../helpers/logger';
import { SeasonInterface } from '../seasons/season.model';
import { fetchSeason } from '../seasons/season.service';

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
        const {
          fixture: matchFixture,
          HSD,
          ASD,
        } = await updateFixture(
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

        log(`The Match instances ${Match.instances}`);
        log(`The Ball instances ${Ball.instances}`);
        log(`The FieldPlayer instances ${FieldPlayer.instances}`);
      } catch (error) {
        console.error('Error updating fixture! :( => \n', error);

        return responseHandler.fail(res, 400, 'Error updating fixtures!', {
          matchErrorResponseCode: 6,
        });
      }

      return next();
    })
    .catch((err) => {
      console.log('ERROR PLAYING MATCH!');

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
            App._app.endGame();
            log('GAME ENDED from App');
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
        App._app.endGame();
        log('GAME ENDED from App');
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

      App._app.endGame();
      log('GAME ENDED from App');
    });
  // Here we should check if we need to update anything else...

  // NEW
  /**
   * Update the Players...
   */
}


export function simulateRest(
  req: Request,
  res: Response,
  next: NextFunction
) {

};