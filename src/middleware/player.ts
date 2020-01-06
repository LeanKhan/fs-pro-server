import mongoose from 'mongoose';

import {
  Request,
  Response,
  NextFunction,
  response,
  RequestHandler,
} from 'express';
import responseHandler from '../helpers/responseHandler';
import { toggleSigned } from '../services/player.service';

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

export const updatePlayerSigning: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('In middleware');

  const resp = await toggleSigned(
    req.body.playerId,
    req.query.player_is_signed,
    req.query.club_code
  );

  if (!resp.error) {
    next();
  } else {
    responseHandler.fail(res, 400, 'Error adding player to club');
  }
};
