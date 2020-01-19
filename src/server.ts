import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyparser from 'body-parser';
import router from './routers';
import stage from '../environment/environment';

const app: express.Application = express();

import h from 'http';

const http = new h.Server(app);

const port = process.env.PORT || 3000;

import i = require('socket.io');

import * as dotenv from 'dotenv';
dotenv.config();
// const env = process.env.NODE_ENV as string;

const io = i(http);

app.use(cors());

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// MongoDB Database Connection

mongoose
  .connect(stage.dev.MONGO_URL, {
    useNewUrlParser: true,
  })
  .then(client => {
    app.locals.db = client.connection.db;
    console.log(
      `Connection to ${client.connection.db.databaseName} database successful!`
    );
  })

  .catch(err => {
    console.error(`Error in connecting to database: `, err);
  });

mongoose.connection.on('error', () => {
  console.log('Error in connection to database');
});

// mongoose.connection.once('open', () => {
//   console.log('Connection to database successful! :)');
// });

// mongoose
//   .connect(process.env[stage + "_MONGO_URL"], connection_options)
//   .then(client => {
//     app.locals.db = client.connection.db;
//     console.log(
//       `Connection to ${client.connection.db.databaseName} database successful!`
//     );
//   })

//   .catch(err => {
//     console.error(`Error in connecting to database: `, err);
//   });

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// Stuff

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
require('./controllers/game.controller');
