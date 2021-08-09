// a function that awards all the awards for that season/year... thank you Jesus!

import { Request, Response } from 'express';
import { allPlayerStats } from '../players/player.service';
import { Fixture } from '../fixtures/fixture.model';
import { PlayerInterface } from '../players/player.model';
import responseHandler from '../../helpers/responseHandler';
import {capitalize} from '../../helpers/misc';
import { AwardInterface } from './awards.model';
import { createAwards } from '.';
import { fetchOne } from '../managers/manager.service';
import { Types } from 'mongoose';

export async function giveAwards(req: Request, res: Response) {
  const season_id = req.params.id;
  const awards = [
    'most-points',
    'most-goals',
    'most-saves',
    'most-assists',
    'most-tackles',
    'best-eleven',
  ];

  // now for each, get the winner(s) and create the award object.
  // get allPlayerStats
  const allStats = await allPlayerStats(season_id);
  const awardObjects: AwardInterface[] = [];

  try {
    awards.forEach((award) => {
      const [superlative, attribute] = award.split('-');

      if (superlative == 'most') {
        // now find out what kind of most...
        allStats.sort((a, b) => {
          return (
            b[attribute] -
            a[attribute]
          );
        });
      } else {
        return false;
      }

      // now return the first player on this list...
      const p = allStats[0].player as PlayerInterface;
      const fixture = allStats[0].fixture as Fixture;

      // create award object for this student
      awardObjects.push(
        createObject(
          'player',
          award,
          p._id as string,
          season_id,
          'season',
          p.Club as string
        )
      );
    });

    // create object for Winning Manager...

    const winningManager = await fetchOne({
      isEmployed: true,
      Club: Types.ObjectId(req.body.seasonChampions),
    });

    if (winningManager) {
      // poop

      awardObjects.push({
        Name: 'Season Title',
        Type: 'manager', // club/manager/player
        Category: 'winning-title',
        Period: 'season',
        Recipient: winningManager._id as string,
        Club: req.body.seasonChampions, // what club was this manager or player in when this happened?
        Remarks: `${winningManager.FirstName} ${winningManager.LastName} won a title with this club!`,
        Season: season_id,
      });
    }

    // now create those awards...
    createAwards(awardObjects)
      .then((players: any) => {
        responseHandler.success(
          res,
          200,
          'Season ended successfully! Thank you Jesus!',
          {awardedPlayers: players,
          standings: req.body.standings,
          season: req.body.updatedSeason}
        );
      })
      .catch((err: any) => {
        responseHandler.fail(res, 400, 'Error fetching Player', err);
      });

    // responseHandler.success(
    //   res,
    //   200,
    //   'Player awards arranged suscesfully!',
    //   awardObjects
    // );
  } catch (err) {
    console.error(err);
    responseHandler.fail(res, 400, 'Error arranging player awards', err);
  }
}

function createObject(
  awardType: 'player' | 'manager',
  category: string,
  recipient: string,
  season: string,
  period: 'season' | 'year' | 'all-time',
  club: string
) {
  let remark = '',
    name = '';

  switch (category) {
    case 'most-goals':
      remark = `Golden Boot for ${period}`;
      name = 'Highest Goal Scorer';
      break;
    case 'most-points':
      remark = `Player of the ${period}`;
      name = 'Best Player';
      break;
    case 'most-assists':
      remark = `Most Assists of the ${period}`;
      name = 'Highest Assists';
      break;
    case 'most-tackles':
      remark = `Most Tackles of ${period}`;
      name = 'Highest Tackles';
      break;
    case 'most-saves':
      remark = `Golden Gloves of ${period}`;
      name = 'Most Saves';
      break;
  }

  return {
    Name: name,
    Type: awardType, // club/manager/player
    Category: category,
    Period: period,
    Recipient: recipient,
    Club: club, // what club was this manager or player in when this happened?
    Remarks: remark,
    Season: season,
  };
}
