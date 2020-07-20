// Sockets...

import { Socket } from 'socket.io';
import { Request, Response, NextFunction } from 'express';
import { fetchOneById } from '../fixtures/fixture.service';
import { Fixture } from '../fixtures/fixture.model';
import { setupGame, Game, startGame } from '../game.controller';
import { ClubInterface } from '../clubs/club.model';
import { IPlayerStats } from '../../interfaces/Player';
import { updateFixture, updateStandings } from './functions';
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

let currentFixture: Fixture;

let currentGame: Game;

export function sockets(socket: Socket) {
  socket.on('join-match', ({ user, match }) => {
    console.log('User =>', user);
    console.log('Pending match => ', currentMatch.fixtureCode);

    socket.join(currentMatch.fixtureCode, (err) => {
      if (!err) {
        // do the remaining stuff...
        const index = currentMatch.users.findIndex((u) => u.id === user);

        const userSession = socket.handshake.sessionID as string;

        currentMatch.users[index].connected = true;
        // Set session id too!
        currentMatch.users[index].session = userSession;

        socket.server
          .to(currentMatch.fixtureCode)
          .emit('match-room-joined', currentMatch);

        if (currentMatch.users.every((u) => !u.connected)) {
          socket.emit('starting-match', 'remaining one user');
        }
      }
    });
  });

  socket.on('check-for-games', ({ user, match }) => {
    if (currentMatch.fixture.toString() === match) {
      // same match so check if it has started...

      if (
        currentMatch.status === 'waiting' &&
        currentMatch.users.find((u) => u.id.toString() === user.toString())
      ) {
        console.log('Same match and is waiting');

        // Now check if we are waiting for them...fixture

        if (currentMatch.users.find((u) => u.id === user && u.connected)) {
          // gottem!
          console.log('gottem!');
        }
      }
    }
  });

  // Player is ready to play...  thank you Jesus!
  socket.on('ready', ({ user }) => {
    // same match so check if it has started...

    const u = currentMatch.users.find(
      (u: any) => u.id.toString() === user.toString()
    );

    // check if everyone is ready...

    if (currentMatch.status === 'waiting' && u) {
      console.log(`${u.id} is ready!`);

      // User is here, now set them to ready...user

      u.ready = true;

      // const allReady = currentMatch.users.every(u => u.ready && u.connected);
      // if(allReady) {
      //   // Maybe send the event to start the match ... thank you Jesus
      //   socket.server
      //   .to(currentMatch.fixtureCode)
      //   .emit('start-match', currentMatch);
      // }

      // Tell the others that this user is ready...
      socket.server
        .to(currentMatch.fixtureCode)
        .emit('player-ready', currentMatch);
    }
  });

  // Actually, you do this when both players are ready!
  socket.on('setup-game', async () => {
    // use club ids instead of their club code...

    // Now we are using the fixture id only! to fetch the teams playing...
    // Thank you Jesus!
    const { fixture: fixture_id } = currentMatch;

    let fixture: Fixture;

    try {
      // get fixture and its details...
      fixture = await fetchOneById(fixture_id, false);
      // We also need to get the associated calendar day...
    } catch (error) {
      throw error;
    }

    if (fixture!.Played) {
      // has been played!

      console.log('Match has been played already!');

      return socket.server
        .to(currentMatch.fixtureCode)
        .emit('match-setup-error', 'Match has already been played!');
    }

    let { HomeTeam: home, AwayTeam: away } = fixture;

    home = home as string;
    away = away as string;

    currentGame = (await setupGame([home, away], {
      home,
      away,
    })) as Game;

    socket.server.to(currentMatch.fixtureCode).emit('game-setup', {
      homeSquad: currentGame.getMatch().Home.MatchSquad,
      awaySquad: currentGame.getMatch().Away.MatchSquad,
    });
  });

  socket.on('start-game', async () => {
    await startGame();

    // Match is over...

    // Here we need a loop to send match events every second or s?
    socket.server.to(currentMatch.fixtureCode).emit('game-complete', {
      matchDetails: currentGame.getMatch().Details,
      matchEvents: currentGame.getMatch().Events,
      homeSquad: currentGame.getMatch().Home.MatchSquad,
      awaySquad: currentGame.getMatch().Away.MatchSquad,
    });
  });
}

function endGame() {
  // prepare stuff you need though...
  const homeSquadPlayerStats: IPlayerStats[] = currentGame
    .getMatch()
    .Home.MatchSquad.map((p) => ({ ...p.Stats, id: p._id })) as IPlayerStats[];
}

export async function initiateGame(req: Request, res: Response) {
  const fixture_id = req.body.fixture;
  const home_id = req.body.home;
  const away_id = req.body.away;
  const day = req.body.day;
  const user = req.body.user;

  // maybe fetch fixture and go from there?
  // populate can be an array...
  const populate = {
    path: 'HomeTeam AwayTeam',
    populate: {
      path: 'Players',
      model: 'Player',
    },
  };
  currentFixture = await fetchOneById(fixture_id, populate);

  if (currentMatch.fixture.toString() === fixture_id) {
    // same match so check if it has started...
    console.log('Same fixture', req.session);

    if (
      currentMatch.status === 'waiting' &&
      currentMatch.users.find((u) => u.id.toString() === user.toString())
    ) {
      console.log('Same match and is waiting');

      // Now check if we are waiting for them...fixture
      // user must be there but disconnected, thank you Jesus!
      if (currentMatch.users.find((u) => u.id === user && !u.connected)) {
        // gottem!
        console.log('gottem! ready to join match! thank you Jesus!');
        return res.send({
          message: 'Match Joined successfully :), thank you Jesus',
          currentFixture,
        });
      }
    }
  }

  /**
   * 1. Initiate game by getting the participants...
   *
   */

  const home_side = currentFixture.HomeTeam as ClubInterface;
  const away_side = currentFixture.AwayTeam as ClubInterface;

  const home_user = home_side.User as string;
  const away_user = away_side.User as string;

  req.body.fixtureObject = currentFixture;
  req.body.home_user_id = home_user.toString();
  req.body.away_user_id = away_user.toString();

  // Then you need to

  console.log('Home User =>', home_user);
  console.log('Away User =>', away_user);

  // tslint:disable-next-line: triple-equals
  // Remember to always convert the mongo _id to string for comparison or use the native .equals() method
  // in ObjectID object to compare two is.
  if (home_user.toString() === away_user.toString()) {
    console.log('Same user!');
    currentMatch.sameUser = true;
    return sameUserFixture(req, res);
  }

  currentMatch.sameUser = false;
  return differentUserFixture(req, res);
}

// function getSide(id: string) {
//   return fetchSingleClubById(id, 'User');
// }

function sameUserFixture(req: Request, res: Response) {
  currentMatch.users = [
    {
      id: req.body.home_user_id,
      session: undefined,
      connected: false,
      ready: false,
    },
  ];

  currentMatch.sameUser = true;

  currentMatch.status = 'waiting';

  currentMatch.fixture = req.body.fixtureObject._id;
  currentMatch.fixtureCode = req.body.fixtureObject.FixtureCode;

  // req.io?.sockets.emit()
  // req.io?.sockets.emit('join-match', req.body.fixtureObject._id);

  // And now emit event telling user that they can send the join room event

  // The user will send the 'join-match' event themselves

  return res.send({
    message: 'Match Created! - {same user}',
    fixture: req.body.fixtureObject,
  });
}

function differentUserFixture(req: Request, res: Response) {
  // add user to users array along with their session ?
  currentMatch.users = [
    {
      id: req.body.home_user_id,
      session: undefined,
      connected: false,
      ready: false,
    },
    {
      id: req.body.away_user_id,
      session: undefined,
      connected: false,
      ready: false,
    },
  ];

  currentMatch.status = 'waiting';

  currentMatch.fixture = req.body.fixtureObject._id;
  currentMatch.fixtureCode = req.body.fixtureObject.FixtureCode;

  // req.io?.sockets.emit()
  // req.io?.sockets.emit('join-match', req.body.fixtureObject._id);

  // And now emit event telling user that they can send the join room event

  // The user will send the 'join-match' event themselves

  return res.send({
    message: 'Match Created! - {diff users}',
    fixture: req.body.fixtureObject,
  });
}

export async function restPlayGame(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { fixture_id } = req.query;

  let fixture: Fixture;

  try {
    // get fixture and its details...
    fixture = await fetchOneById(fixture_id, false);
    // We also need to get the associated calendar day...
  } catch (error) {
    throw error;
  }

  if (fixture!.Played) {
    // has been played!
    return res.send('Match has been played already!');
  }

  let { HomeTeam: home, AwayTeam: away } = fixture;

  home = home.toString() as string;
  away = away.toString() as string;

  currentGame = (await setupGame([home as string, away as string], {
    home,
    away,
  })) as Game;

  await startGame();

  const homeObj = {
    id: currentGame.getMatch().Home._id,
    name: currentGame.getMatch().Home.Name,
    clubCode: currentGame.getMatch().Home.ClubCode,
  };

  const awayObj = {
    id: currentGame.getMatch().Away._id,
    name: currentGame.getMatch().Away.Name,
    clubCode: currentGame.getMatch().Away.ClubCode,
  };

  // After the match is done send the result to...

  try {
    const result = await updateFixture(
      currentGame.getMatch().Details,
      currentGame.getMatch().Events,
      homeObj,
      awayObj,
      fixture_id
    );

    req.body.home = homeObj;
    req.body.away = awayObj;
    req.body.match = result;

    return next();
  } catch (error) {
    console.log('Error updating fixture...');

    return res.status(400).json(error);
  }
}

export function restUpdateStandings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { week, season_id } = req.query;
  const { match, home, away } = req.body;

  const result = updateStandings(
    match.HomeSideDetails,
    match.AwaySideDetails,
    week,
    home,
    away,
    season_id
  );

  return res.json({
    result,
  });
}

// function joinGame(req: Request, res: Response) {
//   // add user to users array along with their session ?
//   currentMatch.users = [
//     {
//       id: req.body.home_user_id,
//       session: undefined,
//       connected: false,
//     },
//     {
//       id: req.body.away_user_id,
//       session: undefined,
//       connected: false,
//     },
//   ];

//   currentMatch.fixture = req.body.fixtureObject._id;
//   currentMatch.fixtureCode = req.body.fixtureObject.FixtureCode;

//   // req.io?.sockets.emit()
//   // req.io?.sockets.emit('join-match', req.body.fixtureObject._id);

//   // And now emit event telling user that they can send the join room event

//   // The user will send the 'join-match' event themselves

//   return res.send({
//     message: 'Match Created!',
//     fixture: req.body.fixtureObject,
//   });
// }
