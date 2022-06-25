import respond from '../../helpers/responseHandler';
import { NextFunction, Request, Response } from 'express';
import { getPlayerStats, updateById, updatePlayers, createMany } from './player.service';
import { updateManagers } from '../managers/manager.service';
import { newAttributeRatings, generatePlayer } from '../../utils/players';
import { PlayerInterface, IPlayerAttributes } from '../../interfaces/Player';
import { runSpawn } from '../../utils/scripts';
import { titleCase } from '../../helpers/misc';

export function updatePlayersDetails(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // get the year id and year string
  const { id } = req.params;

  const $getPlayerStats = () => {
    return getPlayerStats(id);
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

  const increaseAllPeoplesAge = () => {
    return Promise.all([updatePlayers({}, { $inc: { Age: 1 } }),
     updateManagers({}, { $inc: { Age: 1 } })]);
  }

  const updPlayer = (data: {
    player_id: string;
    attributes: IPlayerAttributes;
    new_rating: number;
    new_value: number;
    old_rating: number;
    old_value: number;
  }) => {
    return updateById(data.player_id, {
      // add new Attributes...
      $set: {
        Attributes: data.attributes,
        Rating: data.new_rating,
        Value: data.new_value,
      },
      $push: {
        RatingsHistory: {
          date: new Date().toString(),
          calendar: id,
          rating: data.new_rating,
          value: data.new_value,
          old_rating: data.old_rating,
          old_value: data.old_value,
        },
      },
    });
  };

  const addAttributes = (
    agg: { points: number; player: PlayerInterface }[]
  ) => {

    console.log('agg', agg.length);
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
          old_rating: p.player.Rating,
          old_value: p.player.Value,
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
    .then(increaseAllPeoplesAge)
    .then((updates) => {
      console.log('Finished updating players! => ', updates);
      return next(); // next, update all clubs
      // return respond.success(res, 200, 'Player details updated successfully');
    })
    .catch((err) => {
      console.log('Error updating Player values and ending year! => ', err);
      return respond.fail(res, 400, 'Error updating Player values', err);
    });
}

/** Generate Players */
export function generatePlayers(req: Request, res: Response, next: NextFunction) {
  const { number, culture, position } = req.query;

  if(!number || !culture || !position) {
    return respond.fail(res, 400, 'Provide the number of names, culture, position to generate Players');
  }

  const generatePlayerObjects = (player_names: string) => {
    const names = player_names.split("\r\n")
      .filter((x, i) => x || null)
      .map(n =>
        n.split('__')
        .map(l => titleCase(l))
        // .join(" ")
      );

      const generated_players = names.map(p => generatePlayer({
        position,
        firstname: p[0],
        lastname: p[1],
        nationality: culture
      }));

      return generated_players;
  }


  // TODO: finish up by then saving to database
  runSpawn('player_names', ['generate', number, 'f_l', culture])
  .then(generatePlayerObjects)
  .then(createMany)
  .then((generated_players: any[]) => {
          return respond.success(res, 200, 'Players generated successfully!', generated_players);
  })
    .catch((err: any) => {
      console.log(err);
      return respond.fail(res, 400, 'Error generating Players', err.toString());
    });

}