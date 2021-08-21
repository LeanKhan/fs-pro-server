import DB from '../../db';
import respond from '../../helpers/responseHandler';
import { Request, Response } from 'express';
import { PlaceInterface } from './places.model';

// TODO: I like the Enums data structure in Python.

/** SERVICES  */
export function fetchAll(
  query: Record<string, unknown> = {}
): Promise<PlaceInterface[]> {
  return DB.Models.Place.find(query).lean().exec();
}

/**
 * FetchOneById
 *
 * Fetch a specific Place by id
 * @param id
 */
export function fetchOneById(
  id: string,
  populate = false
): Promise<PlaceInterface> {
  if (populate) {
    return DB.Models.Place.findById(id).lean().exec();
  }
  return DB.Models.Place.findById(id).lean().exec();
}

/**
 * Fetch one specific Place by a query
 *
 * Fetch a specific Place by id
 * @param query
 */
export function fetchOne(query: any): Promise<PlaceInterface> {
  return DB.Models.Place.findOne(query).lean().exec();
}

/** ROUTER */
export function allCountries(req: Request, res: Response) {
  fetchAll({ Type: 'country' })
    .then((countries) => {
      respond.success(res, 200, 'Countries fetched successfully', countries);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Countries', err);
    });
}