import mongoose from 'mongoose';

import {
  Request,
  Response,
  NextFunction,
  response,
  RequestHandler,
} from 'express';
import respond from '../helpers/responseHandler';
import { toggleSigned } from '../controllers/players/player.service';

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
          default:
            idField = 'PlayerID';
            break;
        }

        req.body.data[idField] = id.slice(0, 1) + id.slice(2);

        next();
      } else {
        respond.fail(res, 404, 'Counter not found!');
      }
    });
};

export const updatePlayerSigning: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let resp;
  if (req.query.remove) {
    resp = await toggleSigned(
      req.body.data.playerId,
      req.body.data.isSigned,
      null
    );
  } else {
    resp = await toggleSigned(
      req.body.data.playerId,
      req.body.data.isSigned,
      req.body.data.clubCode
    );
  }

  if (!resp.error) {
    next();
  } else {
    respond.fail(res, 400, 'Error adding player to club');
  }
};
