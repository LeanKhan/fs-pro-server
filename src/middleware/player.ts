import mongoose from 'mongoose';

import {
  Request,
  Response,
  NextFunction,
  response,
  RequestHandler,
} from 'express';
import responseHandler from '../helpers/responseHandler';

export const getCurrentCounter: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const counterName = req.query.model + '_counter';

  mongoose.connection.db
    .collection('counter')
    .findOne({ _id: counterName }, async (err, counter) => {
      if (!err) {
        const id: string =
          counter.prefix + (1000000 + (await counter.sequence_value) + 1);

        req.body.PlayerID = id.slice(0, 1) + id.slice(2);

        next();
      } else {
        responseHandler.fail(res, 404, 'Counter not found!');
      }
    });
};
