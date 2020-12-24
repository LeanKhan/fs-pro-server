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
    log(`Error! => ${error}`);

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

      try {
        match = await updateFixture(
          m.Details,
          m.Events,
          homeObj,
          awayObj,
          fixture_id
        );

        if (!match) {
          return responseHandler.fail(
            res,
            400,
            'Error updating fixtures! - Match cannot be found!',
            {
              matchErrorResponseCode: 3,
            }
          );
        }
      } catch (error) {
        console.error('Error updating fixture! :( => \n', error);

        return responseHandler.fail(res, 400, 'Error updating fixtures!', {
          matchErrorResponseCode: 6,
        });
      }

      req.body.home = homeObj;
      req.body.away = awayObj;
      req.body.match = match;
      req.body.season_id = fixture.Season;

      log(`The Match instances ${Match.instances}`);
      log(`The Ball instances ${Ball.instances}`);
      log(`The FieldPlayer instances ${FieldPlayer.instances}`);

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
  const { match, home, away, season_id } = req.body;

  updateStandings(
    match.HomeSideDetails,
    match.AwaySideDetails,
    fixture_id,
    home,
    away,
    season_id
  )
    .then(({ homeTable, awayTable, matches, currentDay }) => {
      // Check if we need to update Calendar day
      const allMatchesPlayed = matches.every((m) => m.Played);

      // Now that we have the currentDay, waht can we do with the data?
      // Thank you Jesus.

      if (allMatchesPlayed) {
        // move current Day!
        req.body.homeTable = homeTable;
        req.body.awayTable = awayTable;

        // We have to get this from the kini...
        // TODO there should be a better way to get these constants...
        const currentYear = req.body.SeasonCode.split('-').splice(1).join('-');
        return changeCurrentDay(currentYear, currentDay)
          .then(() => {
            // This marks the end of the match...
            // you should send the results and everything back... Thank you Jesus!
            // We also need to check if the season is over...
            // Maybe send back the updated day...
            console.log('Current Day changed successfully!');
            return responseHandler.success(
              res,
              200,
              'Match Played successfully!',
              {
                homeTable,
                awayTable,
                match,
              }
            );
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

      return responseHandler.success(res, 200, 'Match Played successfully!', {
        homeTable,
        awayTable,
        match,
      });
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
}
