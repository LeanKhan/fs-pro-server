import express, { Application } from 'express';
import cors from 'cors';
import bodyparser from 'body-parser';
import router from './routers';

const app: Application = express();

import { Server } from 'http';

import DB from './db';

const http = new Server(app);

const port = process.env.PORT || 3000;

import i = require('socket.io');

import * as dotenv from 'dotenv';
dotenv.config();
// const env = process.env.NODE_ENV as string;

const io = i(http);

DB.start();

app.use(cors());

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// MongoDB Database Connection

app.get('/', (req, res) => {
  res
    .status(200)
    .send('<p>Welcome to FS-PRO <i>Server</i></p> enjoy! Thank you Jesus!');
});

app.use('/api', router);

app.listen(port, () => {
  console.log('Game Server running successfully! on port ' + port);
});

io.on('connection', socket => {
  console.log(`${socket.id} connection successful!`);
});

// tslint:disable-next-line: no-var-requires
// require('./controllers/game.controller');
