// router

import DB from '../../db';
import respond from '../../helpers/responseHandler';
import {capitalize} from '../../helpers/misc';
import { Request, Response } from 'express';
import { AwardInterface } from './awards.model';

/** SERVICES  */
export function fetchAll(
  query: Record<string, unknown> = {},
  recipient: string,
  populate: string
): Promise<AwardInterface[]> {
  if (populate == 'club-season') {
    return DB.Models.Award.find(query).populate({path: 'Recipient', model: capitalize(recipient)}).populate('Club').populate('Season').lean().exec();
  }

  if (populate == 'club') {
    return DB.Models.Award.find(query).populate({path: 'Recipient', model: capitalize(recipient)}).populate('Club').lean().exec();
  }

  if (populate == 'recipient') {
    return DB.Models.Award.find(query).populate({path: 'Recipient', model: capitalize(recipient)}).lean().exec();
  }
  return DB.Models.Award.find(query).lean().exec();
}

/**
 * FetchOneById
 *
 * Fetch a specific Award by id
 * @param id
 */
export function fetchOneById(
  id: string,
  populate = false
): Promise<AwardInterface> {
  if (populate) {
    return DB.Models.Award.findById(id).populate('Club').lean().exec();
  }
  return DB.Models.Award.findById(id).lean().exec();
}

/**
 * Fetch one specific Award by a query
 *
 * Fetch a specific Award by id
 * @param query
 */
export function fetchOne(query: any): Promise<AwardInterface> {
  return DB.Models.Award.findOne(query).lean().exec();
}

/** ROUTER */
// export function allAwards(req: Request, res: Response) {
//   fetchAll({})
//     .then((awards) => {
//       respond.success(res, 200, 'Awards fetched successfully', awards);
//     })
//     .catch((err) => {
//       respond.fail(res, 400, 'Error fetching Awards', err);
//     });
// }

/**
 * Create Many Award docs
 */
export function createAwards(awards: any[]) {
  return DB.Models.Award.insertMany(awards, { ordered: true });
}

/**
 * create new Award
 */

export function createNew(data: any) {
  const _ = new DB.Models.Award(data);

  return _.save()
    .then((award) => {
      return { error: false, result: award };
    })
    .catch((error) => ({ error: true, result: error }));
}

// controller

// services

// model :)
// router
