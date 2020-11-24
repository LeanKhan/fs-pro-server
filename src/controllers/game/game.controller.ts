// Sockets...

import { Socket } from 'socket.io';
import { Request, Response, NextFunction } from 'express';
import { fetchOneById } from '../fixtures/fixture.service';
import { Fixture } from '../fixtures/fixture.model';
import Game, {
  setupGame,
  startGame,
  endGame as finishGame,
} from '../game.controller';
import { ClubInterface } from '../clubs/club.model';
import { IPlayerStats } from '../../interfaces/Player';
import { updateFixture, updateStandings } from './functions';
import { changeCurrentDay } from '../calendar/calendar.controller';
import responseHandler from '../../helpers/responseHandler';
import { Match } from '../../classes/Match';
import Ball from '../../classes/Ball';
import FieldPlayer from '../../classes/FieldPlayer';
const users = [];

interface GameUser {
  id: string;
  session?: string;
  connected: boolean;
  ready: boolean;
}

const currentMatch: {
  users: GameUser[];
  fixture: string;
  fixtureCode: string;
  sameUser: boolean;
  status: 'waiting' | 'not-initiated' | 'started' | 'closed';
} = {
  users: [],
  fixture: '',
  fixtureCode: '',
  sameUser: false,
  status: 'not-initiated',
};

let currentFixture!: Fixture | undefined;

let currentGame: Game | undefined;

export async function restPlayGame(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { fixture_id } = req.query;

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
    console.log('Error!', error);

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

  currentGame = (await setupGame([home, away], {
    home,
    away,
  })) as Game;

  // eslint-disable-next-line @typescript-eslint/await-thenable
  await startGame();

  const homeObj = {
    id: currentGame.getMatch().Home._id,
    name: currentGame.getMatch().Home.Name,
    clubCode: currentGame.getMatch().Home.ClubCode,
    manager: currentGame.getMatch().Home.Manager,
  };

  const awayObj = {
    id: currentGame.getMatch().Away._id,
    name: currentGame.getMatch().Away.Name,
    clubCode: currentGame.getMatch().Away.ClubCode,
    manager: currentGame.getMatch().Away.Manager,
  };

  console.log('The Match instances', Match.instances);
  console.log('The Ball instances', Ball.instances);
  console.log('The FieldPlayer instances', FieldPlayer.instances);
  console.log('The Game instances', Game.instances);

  // After the match is done send the result to...

  try {
    const result = await updateFixture(
      currentGame.getMatch().Details,
      currentGame.getMatch().Events,
      homeObj,
      awayObj,
      fixture_id
    );

    if (!result) {
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
    req.body.match = result;
    req.body.season_id = fixture.Season;

    // delete currentGame;

    return next();
  } catch (error) {
    console.log('Error updating fixture...', error);

    return responseHandler.fail(res, 400, 'Error updating fixtures!', {
      ...error,
      matchErrorResponseCode: 2,
    });
  }
}

export function restUpdateStandings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Soon we will be getting it from the fixture object...
  // THANK YOU JESUS!

  const { fixture_id } = req.query;
  const { match, home, away, season_id } = req.body;

  updateStandings(
    match.HomeSideDetails,
    match.AwaySideDetails,
    fixture_id,
    home,
    away,
    season_id
  )
    .then(({ homeTable, awayTable, matches }) => {
      // Check if we need to update Calendar day
      const allMatchesPlayed = matches.every((m) => m.Played);

      if (allMatchesPlayed) {
        // move current Day!
        req.body.homeTable = homeTable;
        req.body.awayTable = awayTable;

        // We have to get this from the kini...
        // TODO there should be a better way to get these constants...
        const currentYear = req.body.SeasonCode.split('-').splice(1).join('-');
        return changeCurrentDay(currentYear)
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
            console.log('Error changing current Calendar Day!');
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
    .catch((err) =>
      responseHandler.fail(
        res,
        400,
        'Error Playing Match and updating Standings!',
        { ...err, matchErrorResponseCode: 2 }
      )
    )
    .finally(() => {
      // Delete CurrentMatch Instance...
      console.log('deleted currentGame');
      currentGame = undefined;
      currentFixture = undefined;
      finishGame();
      console.log('CurrentGame after undefined =>', currentGame);
    });
  // Here we should check if we need to update anything else...
}
