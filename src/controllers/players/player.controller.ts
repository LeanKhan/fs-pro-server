import respond from '../../helpers/responseHandler';
import { NextFunction, Request, Response } from 'express';
import { getPlayerStats, updateById } from './player.service';
import { newAttributeRatings } from '../../utils/players';
import { IPlayer, IPlayerAttributes } from '../../interfaces/Player';

// Thank you Jesus!

/**
 * db.getCollection('PlayerMatchDetails').aggregate([
  {
   $lookup: {
      from: 'Fixtures',
      localField: 'Fixture',
      foreignField: '_id',
      as: 'fixture',
    },
  },
  { $unwind: '$fixture' },
  {
    $lookup: {
      from: 'Seasons',
      localField: 'fixture.Season',
      foreignField: '_id',
      as: 'season',
    },
  },
  { $unwind: '$season' },
  { $match: { 'season.Year': 'CUU-2021' } }
])
 */

// ALL TOGETHER NOW //

/**
 * db.getCollection('PlayerMatchDetails').aggregate([
  {
   $lookup: {
      from: 'Fixtures',
      localField: 'Fixture',
      foreignField: '_id',
      as: 'fixture',
    },
  },
  { $unwind: '$fixture' },
  {
    $lookup: {
      from: 'Seasons',
      localField: 'fixture.Season',
      foreignField: '_id',
      as: 'season',
    },
  },
  { $unwind: '$season' },
  { $match: { 'season.Year': 'CUU-2021' } }, // Filter by the Year
  {
    $group: { _id: '$Player', goals: {$sum:'$Goals'},
    saves: {$sum:'$Saves'},
    passes: {$sum:'$Passes'},
    tackles: {$sum:'$Tackles'},
    assists: {$sum:'$Assists'},
    clean_sheets: {$sum: '$CleanSheets'},
    dribbles: {$sum:'$Dribbles'},
    points: {$avg:'$Points'},
    form: {$avg:'$Form'}
}},
 {
    $lookup: {
      from: 'Players',
      localField: '_id',
      foreignField: '_id',
      as: 'player',
    },
  }, // Get the Player's details
  { $unwind: '$player' }
])
 */

export function updatePlayersDetails(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // get the year id and year string
  const { year, id } = req.params;

  const $getPlayerStats = () => {
    return getPlayerStats(year);
  };

  const updPlayers = (ar: any[]) => {
    const pt = ar.map((_) => updPlayer(_));

    // TODO: Mehn, I don't know how we will do this! Sha for now let's do all PromiseAll
    // Promise.all() has a 2 million limit lol. So we have to do this in batches o
    // while (array.length > 0) {
    //   const n = array.splice(0, 100);

    //   const g = n.map((_) => updPlayer(_));

    //   promises.push(Promise.all(g));
    // }

    return Promise.all(pt);
  };

  const updPlayer = (data: {
    player_id: string;
    attributes: IPlayerAttributes;
    new_rating: number;
    new_value: number;
  }) => {
    return updateById(data.player_id, {
      // add new Attributes...
      $set: {
        Attributes: data.attributes,
        Rating: data.new_rating,
        Value: data.new_value,
      },
      $inc: { Age: 1 },
      $push: {
        RatingsHistory: {
          date: new Date().toString(),
          year,
          rating: data.new_rating,
          value: data.new_value,
        },
      },
    });
  };

  const addAttributes = (agg: { points: number; player: IPlayer }[]) => {
    //   test the first 5 players... thank you Jesus!
    const toDo: any[] = [];

    try {
      agg.forEach((p, i) => {
        const { attributes, new_rating, new_value } = newAttributeRatings(
          p.player,
          p.points
        );
        toDo.push({
          attributes,
          new_rating,
          new_value,
          player_id: p.player._id,
        });
      });

      return toDo;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return $getPlayerStats()
    .then(addAttributes)
    .then(updPlayers)
    .then(() => {
      return next(); // next, update all clubs
    })
    .catch((err) => {
      console.log('Error updating Player values => ', err);
      return respond.fail(res, 400, 'Error updating Player values', err);
    });
}
