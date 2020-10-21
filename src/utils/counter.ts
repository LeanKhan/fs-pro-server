import respond from '../helpers/responseHandler';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import mongoose from 'mongoose';
import DB from '../db';

export function incrementCounter(counterName: string) {
  DB.db.collection('counter').findOneAndUpdate(
    { _id: counterName },
    {
      $inc: { sequence_value: 1 },
    }
  );
}

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
