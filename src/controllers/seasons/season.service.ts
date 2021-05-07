/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import DB from '../../db';
import { Season, SeasonInterface } from './season.model';
// import { incrementCounter } from '../../utils/counter';

/**
 * fetchAll
 */
export function fetchAll(
  query: Record<string, unknown> = {},
  populate: boolean | string = false,
  select: boolean | string = false
) {
  if (populate && select) {
    return DB.Models.Season.find(query)
      .populate(populate)
      .select(select)
      .lean()
      .exec();
  }

  if (populate) {
    return DB.Models.Season.find(query).populate(populate).lean().exec();
  }

  return DB.Models.Season.find(query).lean().exec();
}

/**
 * FetchOneById
 *
 * Fetch a specific season by its id
 * @param id
 */
export function fetchOneById(
  id: string,
  select: boolean | string = false,
  populate = true
) {
  if (select) {
    return DB.Models.Season.findById(id).select(select).lean().exec();
  }

  if (select && populate) {
    return DB.Models.Season.findById(id)
      .populate('Fixtures')
      .select(select)
      .lean()
      .exec();
  }

  return DB.Models.Season.findById(id).populate('Fixtures').lean().exec();
}

/**
 * fetchSeason
 *
 * Fetch a specific season by query
 * @param query
 */
export function fetchSeason(
  query: any,
  select: boolean | string = false,
  populate = true
) {
  if (select && !populate) {
    return DB.Models.Season.findOne(query).select(select).lean().exec();
  }

  if (populate && !select) {
    return DB.Models.Season.findOne(query).populate('Fixtures').lean().exec();
  }

  if (select && populate) {
    return DB.Models.Season.findOne(query)
      .populate('Fixtures')
      .select(select)
      .lean()
      .exec();
  }

  return DB.Models.Season.findOne(query).lean().exec();
}

export function findByIdAndUpdate(id: string, update: any) {
  return DB.Models.Season.findByIdAndUpdate(id, update, { new: true })
    .lean()
    .exec();
}

/**
 *
 * @param data Find one and update
 */
export function findOneAndUpdate(
  query: Record<string, unknown>,
  update: any,
  options: any
): Promise<any> {
  return DB.Models.Season.findOneAndUpdate(query, update, {
    new: true,
    ...options,
  })
    .lean()
    .exec();
}

/**
 * Update many seasons that match a particular query
 * @param query
 * @param update
 * @param options
 */
export function findAndUpdate(query: Record<string, unknown>, update: any) {
  return DB.Models.Season.updateMany(query, update).lean().exec();
}

/**
 * create new season
 */

export function createNew(data: any) {
  const SEASON = new DB.Models.Season(data);

  return SEASON.save();
}

export function deleteById(id: string): Promise<SeasonInterface> {
  return DB.Models.Season.findByIdAndDelete(id).lean().exec();
}
