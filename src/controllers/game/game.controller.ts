// Sockets...

import { Socket } from 'socket.io';
import { Request, Response, NextFunction } from 'express';
import { Fixture } from '../fixtures/fixture.model';
import { fetchSingleClubById } from '../clubs/club.service';
import { IUser } from '../user/user.model';
import { fetchOneById } from '../fixtures/fixture.service';
import { Club } from '../clubs/club.model';
const users = [];

interface GameUser {
  id: string;
  session?: string;
  connected: boolean;
}

const currentMatch: {
  users: GameUser[];
  fixture: string;
  fixtureCode: string;
  sameUser: boolean;
} = {
  users: [],
  fixture: '',
  fixtureCode: '',
  sameUser: false,
};

export function sockets(socket: Socket) {
  socket.on('join-match', ({ user, match }) => {
    console.log('User =>', user);
    console.log('Pending match => ', match);

    socket.join(currentMatch.fixtureCode);

    const index = currentMatch.users.findIndex((u) => u.id == user);

    currentMatch.users[index].connected = true;

    socket.emit('match-room-joined', currentMatch);

    /**
     * Who is this match between? Find them and send them alerts...
     */

    if (currentMatch.users.every((u) => !u.connected)) {
      socket.emit('starting-match', 'remaining one user');
    }
  });
}

export async function initiateGame(req: Request, res: Response) {
  const fixture_id = req.body.fixture;
  const home_id = req.body.home;
  const away_id = req.body.away;
  const day = req.body.day;
  const match = req.body.match;

  // maybe fetch fixture and go from there?
  const fixture = await fetchOneById(fixture_id, 'HomeTeam AwayTeam');

  /**
   * 1. Initiate game by getting the participants...
   *
   */

  const home_side = fixture.HomeTeam as Club;
  const away_side = fixture.AwayTeam as Club;

  const home_user = home_side.User as string;
  const away_user = away_side.User as string;

  req.body.fixtureObject = fixture;
  req.body.home_user_id = home_user;
  req.body.away_user_id = away_user;

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
    },
    {
      id: req.body.away_user_id,
      session: undefined,
      connected: false,
    },
  ];

  currentMatch.fixture = req.body.fixtureObject._id;
  currentMatch.fixtureCode = req.body.fixtureObject.FixtureCode;

  // req.io?.sockets.emit()
  // req.io?.sockets.emit('join-match', req.body.fixtureObject._id);

  // And now emit event telling user that they can send the join room event

  // The user will send the 'join-match' event themselves

  return res.send({
    message: 'Match Created!',
    fixture: req.body.fixtureObject,
  });
}
