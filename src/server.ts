import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyparser from 'body-parser';

const app: express.Application = express();

import h from 'http';

const http = new h.Server(app);

import i = require('socket.io');

const io = i(http);

app.use(cors());

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// MongoDB Database Connection

mongoose.connect('mongodb://localhost:27017/football-simulator', {
  useNewUrlParser: true,
});

mongoose.connection.on('error', () => {
  console.log('Error in connection to database');
});

mongoose.connection.once('open', () => {
  console.log('Connection to database successful! :)');
});

// Stuff

app.get('/', (req, res) => {
  res.status(200).send('Welcome! To FS-PRO Game Server');
});

// Server

app.listen('3080', () => {
  console.log('Game Server running successfully!');
});

io.on('connection', socket => {
  console.log(`${socket.id} connection successful!`);
});

require('./controllers/game.controller');
