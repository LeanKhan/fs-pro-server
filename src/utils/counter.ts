/* eslint-disable @typescript-eslint/no-misused-promises */
import respond from '../helpers/responseHandler';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import mongoose from 'mongoose';
import DB from '../db';
import log from '../helpers/logger';

export function incrementCounter(counterName: string) {
  return DB.db.collection('counter').findOneAndUpdate(
    { _id: counterName },
    {
      $inc: { sequence_value: 1 },
    }
  );
}

// TODO: add a validator for all routes!
export const getCurrentCounter: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const counterName = req.query.model + '_counter';
  // TODO: Make this more flexible and robust :))
  mongoose.connection.db
    .collection('counter')
    .findOne({ _id: counterName }, async (err, counter) => {
      if (!err) {
        let number = 1000000 + (await counter.sequence_value) + 1;
        number = number.toString().substring(1);
        const id: string = counter.prefix + number;

        log(`Id => ${id}`);

        let idField;
        switch (req.query.model) {
          case 'player':
            idField = 'PlayerID';
            break;
          case 'competition':
            idField = 'CompetitionID';
            break;
          case 'season':
            idField = 'SeasonID';
            break;
          case 'manager':
            idField = 'Key';
            break;
          default:
            idField = 'PlayerID';
            break;
        }

        req.body.data[idField] = id;

        next();
      } else {
        respond.fail(res, 404, 'Counter not found!');
      }
    });
};

export function getCurrentCounter2(model: string) {
  const counterName = model + '_counter';

  // TODO: Make this more flexible and robust :))
  // TODO: (9/07/21) - Omo, this tin was wasting my time so I made the increment kini random
  return mongoose.connection.db
    .collection('counter')
    .findOne({ _id: counterName })
    .then(async (counter) => {
      let number =
        1000000 +
        (await counter.sequence_value) +
        Math.round(Math.random() * 10);
      number = number.toString().substring(1);
      const id: string = counter.prefix + number;
      console.log('id => ', id);
      return id;
    })
    .catch((c) => {
      throw new Error(`${model} Counter not found!`);
    });
}
