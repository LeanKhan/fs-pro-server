import {Types} from 'mongoose';

import {
  Request,
  Response,
  NextFunction,
  response,
  RequestHandler,
} from 'express';
import respond from '../helpers/responseHandler';
import { toggleSigned, updatePlayers } from '../controllers/players/player.service';

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
      null,
      null
    );
  } else {
    resp = await toggleSigned(
      req.body.data.playerId,
      req.body.data.isSigned,
      req.body.data.clubCode,
      req.body.data.clubId
    );
  }

  if (!resp.error) {
    next();
  } else {
    respond.fail(res, 400, 'Error adding player to club');
  }
};

export const updateManyPlayerSigning: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let resp;

  const { playerIds, clubId, clubCode } = req.body.data;

  const pIds = playerIds.map(p => Types.ObjectId(p));

  const query = {'_id': { $in:  pIds}};
  const update = {
    $set: { isSigned: true, ClubCode: clubCode, Club: clubId },
  };

    resp = await updatePlayers(
      query,
      update
    );

  if (!resp.error) {
    next();
  } else {
    respond.fail(res, 400, 'Error adding player to club');
  }
};
