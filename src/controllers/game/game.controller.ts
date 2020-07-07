// Sockets...

import { Socket } from 'socket.io';
import { Request, Response } from 'express';
import { getUserSession } from '../user/user.service';
import { fetchOneById } from '../fixtures/fixture.service';
import { Club } from '../clubs/club.model';
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

      const u = currentMatch.users.find((u: any) => u.id.toString() === user.toString());

      if (
        currentMatch.status === 'waiting' &&
        u
      ) {

        console.log(`${u.id} is ready!`);

      // User is here, now set them to ready...user

          u.ready = true;

          // Tell the others that this user is ready...
           socket.server
          .to(currentMatch.fixtureCode)
          .emit('player-ready', currentMatch);
      }
    }
  );
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
      model: 'Player'
    }
  }
  const fixture = await fetchOneById(fixture_id, populate);

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
          fixture,
        });
      }
    }
  }

  /**
   * 1. Initiate game by getting the participants...
   *
   */

  const home_side = fixture.HomeTeam as Club;
  const away_side = fixture.AwayTeam as Club;

  const home_user = home_side.User as string;
  const away_user = away_side.User as string;

  req.body.fixtureObject = fixture;
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
  return res.send({ message: 'Same User!', fixture: req.body.fixtureObject });
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
      ready: false
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
    message: 'Match Created not waiting!',
    fixture: req.body.fixtureObject,
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
