import * as dotenv from 'dotenv';
dotenv.config();

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

import log from './helpers/logger';

const app: Application = express();

import { Server } from 'http';

import DB, { MONGO_URL as dbstring } from './db';

const http = new Server(app);

const port = process.env.PORT || 3000;

import i = require('socket.io');

import App from './controllers/app/App';

const io = i(http);

const MongoStore = mStore(session);

const store = new MongoStore(
  {
    uri: dbstring,
    collection: 'Sessions',
  },
  (err: any) => {
    if (err) {
      console.error(`Error connecting Store to MongoDB => ${err}`);
    }
  }
);

const cors_whitelist = [
      'http://localhost:8080',
      'http://192.168.208.6:8080',
      // get host from env vars
      'http://' + (process.env.REMOTE_HOST.trim() || 'localhost' ) + ':8080'
      ];

app.use(
  cors({
    origin: cors_whitelist,
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

//  ==== THE GAME CLASS GAN GAN! EVERYTHING ABOUT THE GAME STARTS HERE! THnak you Jesus! == //
//  ==== THE GAME CLASS GAN GAN! EVERYTHING ABOUT THE GAME STARTS HERE! THnak you Jesus! == //
App.create();
//  ==== THE GAME CLASS GAN GAN! EVERYTHING ABOUT THE GAME STARTS HERE! THnak you Jesus! == //
//  ==== THE GAME CLASS GAN GAN! EVERYTHING ABOUT THE GAME STARTS HERE! THnak you Jesus! == //

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
                console.log('Client authenticated successfully!');
              }
              log('Cookie found');
              next();
            } else {
              if (process.env.NODE_ENV!.trim() === 'dev') {
                console.log('Invalid Cookie!');
              }
              log('Invalid cookie');
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
    log('hi there :p');
  }
});

// Socket.io Instance
io.use((socket, next) => {
  Session(socket.request, socket.request.res || {}, next);
});

// app.use('', (req, res) =>{
//   req.io = io;
// })

// Anytime there is a (re)connection save the socketID to the session
// You could actually also save the User id... then map the id to the current socket id.

io.on('connection', (socket: i.Socket) => {
  // let sessionID = socket.handshake.session.id;

  console.log(`Client connected successfully! => ${socket.id}`);

  socket.handshake.session!.onlineStart = new Date();
  socket.handshake.session!.online = true;
  socket.handshake.session!.socketID = socket.id;

  socket.handshake.session!.save((err: Error) => {
    if (err) {
      console.log(`Errror in saving session! => ${err}`);
      console.error(`Error in saving session! => ${err}`);
    } else {
      console.log('Session updated :)');
    }
  });

  socket.on('disconnect', () => {
    socket.handshake.session!.lastOnline = new Date();
    socket.handshake.session!.online = false;

    socket.handshake.session!.save((err: Error) => {
      if (err) {
        console.log(`Error in saving session! => ${err}`);
        console.error(`Error in saving session! => ${err}`);
      }
    });
    console.info(
      `Disconnected client session => ${socket.handshake.session!.id}`
    );
  });

  socket.on('authenticate', () => {
    console.log('yeet');
  });
});

export { store, io };
