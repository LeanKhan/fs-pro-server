import express, { Application } from 'express';
import cors from 'cors';
import bodyparser from 'body-parser';
/** ---- sockets stuff -- */
import assert from 'assert';
import session from 'express-session';
import sharedSession from 'express-socket.io-session';
import mStore from 'connect-mongodb-session';
import cookie from 'cookie';
import router from './routers';
import path from 'path';

import { sockets as gameSockets } from './controllers/game/game.controller';

const app: Application = express();

import { Server } from 'http';

import DB, { MONGO_DEV_URL as dbstring } from './db';

const http = new Server(app);

const port = process.env.PORT || 3000;

import i = require('socket.io');

import * as dotenv from 'dotenv';
dotenv.config();
// const env = process.env.NODE_ENV as string;

const io = i(http);

const MongoStore = mStore(session);

const store = new MongoStore(
  {
    uri: dbstring,
    collection: 'Sessions',
  },
  (err: any) => {
    if (err) {
      console.error('Error connecting Store to MongoDB => ', err);
    }
  }
);

app.use(
  cors({
    origin: [
      'http://localhost:8080',
      'http://192.168.43.163:8080',
      'http://192.168.43.33:8080',
      'http://192.168.10.2:8080',
    ],
    credentials: true,
  })
);

const Session = session({
  name: 'fspro.sid',
  secret: 'thisisasecret:)',
  cookie: {
    maxAge: 60000 * 60 * 24 * 30,
    httpOnly: true,
  },
  store,
  saveUninitialized: false,
  resave: false,
});

// Catch errors
store.on('error', (error) => {
  assert.ifError(error);
  assert.ok(false);
});

// Use Sessions o
app.use(Session);

// io.origins(['*wegive.me:*']);

// Share Express session with SocketIO
io.use(sharedSession(Session));

DB.start();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../assets')));

// MongoDB Database Connection

app.get('/', (req, res) => {
  res
    .status(200)
    .send('<p>Welcome to FS-PRO <i>Server</i></p> enjoy! Thank you Jesus!');
});

app.use('/api', router);

// Attach socket
app.use((req, res, next) => {
  req.io = io;
  next();
});

http.listen(port, () => {
  console.log('Game Server running successfully! on port ' + port);
});

io.use((socket: any, next: any) => {
  const sessionID = socket.handshake.sessionID as string;

  if (socket.request.headers.cookie) {
    const cookies = cookie.parse(socket.request.headers.cookie);
    if (cookies['fspro.sid']) {
      store.get(
        sessionID,
        (err: any, sess: Express.SessionData | null | undefined) => {
          if (!err) {
            if (sess) {
              if (process.env.NODE_ENV!.trim() === 'dev') {
                console.log('Client connected!');
                console.log('info', 'Client Connected!');
              }
              console.log('Cookie found');
              next();
            } else {
              if (process.env.NODE_ENV!.trim() === 'dev') {
                console.log('Invalid Cookie!');
              }
              console.log('Invalid cookie');
              next(new Error('Cookie is expired!'));
            }
          } else {
            next(err);
          }
        }
      );
    } else {
      // delete session :)
      store.destroy(sessionID);
      console.log('No cookie sent man, destroying session :)');
      next(new Error('Not authorized man!'));
    }
  } else {
    console.log('hi there :p');
  }
});

// Socket.io Instance
io.use(function (socket, next) {
  Session(socket.request, socket.request.res || {}, next);
});

// app.use('', (req, res) =>{
//   req.io = io;
// })

// Anytime there is a (re)connection save the socketID to the session
// You could actually also save the User id... then map the id to the current socket id.
// TODO: refactor after creating User model

io.on('connection', (socket: i.Socket) => {
  // let sessionID = socket.handshake.session.id;

  console.log('Client connected successfully! =>', socket.id);

  socket.handshake.session!.onlineStart = new Date();
  socket.handshake.session!.online = true;
  socket.handshake.session!.socketID = socket.id;

  socket.handshake.session!.save((err: Error) => {
    if (err) {
      console.log('Errror in saving session! =>', err);
      console.error('Error in saving session! => ', err);
    } else {
      console.log('Session updated :)');
    }
  });

  socket.on('disconnect', () => {
    socket.handshake.session!.lastOnline = new Date();
    socket.handshake.session!.online = false;

    socket.handshake.session!.save((err: Error) => {
      if (err) {
        console.log('Errror in saving session! =>', err);
        console.error('Error in saving session! => ', err);
      }
    });
    console.info(
      `Disconnected client session =>  ${socket.handshake.session!.id}`
    );
  });

  socket.on('authenticate', () => {
    console.log('yeet');
  });
});

// Game Socket connection
io.on('connection', gameSockets);

export { store, io };

// tslint:disable-next-line: no-var-requires
// require('./controllers/game.controller');
