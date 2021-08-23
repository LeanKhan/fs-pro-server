import { Types } from 'mongoose';
import DB from '../db';
import respond from './responseHandler';
import { Request, Response } from 'express';
/**
 * Round a number to a specified places
 */
export function roundTo(number: number, decimalPlaces: number) {
  if (isNaN(number)) return 0;

  try {
    decimalPlaces -= 1;
  } catch (error) {
    throw new Error('decimalPlaces has to be a number!');
  }

  if (isNaN(decimalPlaces) || decimalPlaces < 0) {
    decimalPlaces = -1;
  }

  const g = 10 * 10 ** decimalPlaces;

  return Math.round((number + Number.EPSILON) * g) / g;
}

/** Capitalize te first letter of the text */
export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function baseFetch(options: BaseFetchInt) {
  return {
    one: () => {
      if (options.select && options.populate) {
        return DB.Models[options.model]
          .findOne(options.query)
          .select(options.select)
          .populate(options.populate)
          .lean()
          .exec();
      }
      return DB.Models[options.model]
        .findOne(options.query)
        .select(options.select)
        .lean()
        .exec();
    },
    many: () => {
      if (options.select && options.populate) {
        return DB.Models[options.model]
          .find(options.query)
          .select(options.select)
          .populate(options.populate)
          .lean()
          .exec();
      }
      return DB.Models[options.model]
        .find(options.query)
        .select(options.select)
        .lean()
        .exec();
    },
  };
}

export interface BaseFetchInt {
  model: string;
  select: string | boolean;
  populate: string | boolean;
  query: any;
}

/**  // DO NOT TOUCH :)
 * 
export function updateAllModels(req: Request, res: Response) {

  const models = [
    {model: 'Competitions', field: 'Country'},
      {model: 'Players', field: 'Nationality'},
     {model: 'Clubs', field: 'Address.Country'},
    {model: 'Managers', field: 'Nationality'},
  ]

// This function updates all players, clubs, competitions and managers to the right country
// Have a list of all countries with their corressponding ID
const arrangeAllCountries = () => {
  const c = DB.Models.Place.find({Type: "country"}).lean().exec().then((cs: any[]) => {
    return cs.flatMap((cty: any) => {
      if (cty.Name == 'Bellean')
        return [{label: cty.Name, new_id: cty._id}, {label: 'bellean', new_id: cty._id}]

      if (cty.Name == 'Pregge')
        return [{label: cty.Name, new_id: cty._id}, {label: 'Stov', new_id: cty._id}]

      if (cty.Name == 'Simeone')
        return [{label: cty.Name, new_id: cty._id}, {label: 'Simeon', new_id: cty._id}]

      if (cty.Name == 'Hunteerland')
        return [{label: cty.Name, new_id: cty._id}, {label: 'Huntaarland', new_id: cty._id}]

      return {label: cty.Name, new_id: cty._id}
    })
  })

  return c
}
// For each country, update all models that need changing with the new IDs...

const updateCollections = (cs: {label: string, new_id: any}[]) => {
  let update: Promise<any>[] = [];
  cs.forEach(c => {
      update = update.concat(models.map(m => {
       return DB.db.collection(m.model).updateMany({ [m.field]: c.label }, {$set: {[m.field]: c.new_id}})
      }))
  })

  // all the updations are ready!
  return Promise.all(update)
}

// arrangeAllCountries()
arrangeAllCountries()
.then(updateCollections)
     .then((result: any) => {
      return respond.success(res, 200, 'Places in Models updated successfully', result);
    })
    .catch((err: any) => {
      console.error(err);
      return respond.fail(res, 400, 'Error updating Places in Models', err);
    });

// arrangeAllCountries()
// .then(updateCollections)
// .then((result: any) => {
//   console.log('All Models updated successfully! Thank you Jesus!', result)
// })

} */
