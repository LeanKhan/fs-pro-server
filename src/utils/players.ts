import { MatchSide } from '../classes/MatchSide';
import { IBlock } from '../state/ImmutableState/FieldGrid';
import * as co from './coordinates';
import { IPositions, IFieldPlayer } from '../interfaces/Player';

/**
 * Get attackers and midfielders that are not with the ball
 *
 * @param team
 */
function getATTMID(team: MatchSide) {
  return team.StartingSquad.filter(player => {
    if (
      (player.Position === 'ATT' && !player.WithBall) ||
      (player.Position === 'MID' && !player.WithBall)
    ) {
      return true;
    } else {
      return false;
    }
  });
}

/**
 * Get Attackers and Midfielders even if they are with the ball
 * @param team
 */
function getATTMIDNoFilter(team: MatchSide) {
  return team.StartingSquad.filter(player => {
    if (player.Position === 'ATT' || player.Position === 'MID') {
      return true;
    } else {
      return false;
    }
  });
}

/**
 * Find a random free block in a 3 block radius
 * @param player
 */
function findRandomFreeBlock(player: IFieldPlayer): IBlock {
  // Get blocks around player
  let circumference = player.getBlocksAround(3);

  // Filter the undefined or occupied ones
  circumference = circumference.filter((block: IBlock) => {
    if (block === undefined || block.occupant !== null) {
      return false;
    } else {
      return true;
    }
  });

  // Then return a random one...

  const randomIndex = Math.round(Math.random() * (circumference.length - 1));

  return circumference[randomIndex];
}

/**
 * Get a random Attacker or Midfielder - No filter
 *
 */
function getRandomATTMID(team: MatchSide): IFieldPlayer {
  const list = getATTMIDNoFilter(team);

  const randomIndex = Math.round(Math.random() * (list.length - 1));

  return list[randomIndex];
}

/**
 * Get the goalkeeper from the given list of players
 */
function getGK(squad: IFieldPlayer[]) {
  return squad.find(player => {
    // tslint:disable-next-line: triple-equals
    return player.Position === 'GK';
  });
}

function getRandomDEF(team: MatchSide) {
  return team.StartingSquad.find(player => {
    return player.Position === 'ATT' || player.Position === 'MID';
  });
}

/**
 *
 * Find a free block around
 * @param around
 */
function findFreeBlock(around: IPositions) {
  for (const key in around) {
    if (around.hasOwnProperty(key) && around[key] !== undefined) {
      const block = around[key] as IBlock;
      if (block.x >= 0 || block.y >= 0 || block.x <= 11 || block.y <= 6) {
        if (block.occupant == null) {
          return block;
        }
      } else {
        return undefined;
      }
    }
  }
}

// function findClosestPlayerToPost(team: MatchSide, scoringSide: IBlock){
//     const noneKeepers = team.StartingSquad.filter(player => {
//         if (
//           (player.Position !== 'GK') ||
//           (!player.WithBall)
//         ) {
//           return true;
//         } else {
//           return false;
//         }
//       });

//       const distances = noneKeepers.forEach((p)=>{
//         co.calculateDistance()
//       });
// }

function calculatePlayerValue(rating: number, age: number) {
  let value;

  if (age >= 17 && age < 20) {
    if (rating < 60) {
      value = 1000000;
    } else if (rating >= 60 && rating < 70) {
      value = 2000000;
    } else if (rating >= 70 && rating < 75) {
      value = 4000000;
    } else if (rating >= 75 && rating < 80) {
      value = 12000000;
    } else if (rating >= 80 && rating < 85) {
      value = 40000000;
    } else if (rating >= 85 && rating < 90) {
      value = 100000000;
    } else if (rating >= 90 && rating < 95) {
      value = 160000000;
    } else if (rating >= 95 && rating <= 100) {
      value = 200000000;
    } else {
      value = 0;
    }
  } else if (age >= 20 && age < 24) {
    if (rating < 60) {
      value = 500000;
    } else if (rating >= 60 && rating < 70) {
      value = 4000000;
    } else if (rating >= 70 && rating < 75) {
      value = 6000000;
    } else if (rating >= 75 && rating < 80) {
      value = 15000000;
    } else if (rating >= 80 && rating < 85) {
      value = 44000000;
    } else if (rating >= 85 && rating < 90) {
      value = value = 90000000;
    } else if (rating >= 90 && rating < 95) {
      value = 180000000;
    } else if (rating >= 95 && rating <= 100) {
      value = 240000000;
    } else {
      value = 0;
    }
  } else if (age >= 24 && age < 26) {
    if (rating < 60) {
      value = 400000;
    } else if (rating >= 60 && rating < 70) {
      value = 3000000;
    } else if (rating >= 70 && rating < 75) {
      value = 18000000;
    } else if (rating >= 75 && rating < 80) {
      value = 30000000;
    } else if (rating >= 80 && rating < 85) {
      value = 48000000;
    } else if (rating >= 85 && rating < 90) {
      value = 120000000;
    } else if (rating >= 90 && rating < 95) {
      value = 200000000;
    } else if (rating >= 95 && rating <= 100) {
      value = 250000000;
    } else {
      value = 0;
    }
  } else if (age >= 26 && age < 30) {
    if (rating < 60) {
      value = 350000;
    } else if (rating >= 60 && rating < 70) {
      value = 2500000;
    } else if (rating >= 70 && rating < 75) {
      value = 15000000;
    } else if (rating >= 75 && rating < 80) {
      value = 34000000;
    } else if (rating >= 80 && rating < 85) {
      value = 8000000;
    } else if (rating >= 85 && rating < 90) {
      value = 120000000;
    } else if (rating >= 90 && rating < 95) {
      value = 140000000;
    } else if (rating >= 95 && rating <= 100) {
      value = 240000000;
    } else {
      value = 0;
    }
  } else if (age >= 30 && age < 42) {
    if (rating < 60) {
      value = 350000;
    } else if (rating >= 60 && rating < 70) {
      value = 2000000;
    } else if (rating >= 70 && rating < 75) {
      value = 12000000;
    } else if (rating >= 75 && rating < 80) {
      value = 28000000;
    } else if (rating >= 80 && rating < 85) {
      value = 46000000;
    } else if (rating >= 85 && rating < 90) {
      value = 90000000;
    } else if (rating >= 90 && rating < 95) {
      value = 130000000;
    } else if (rating >= 95 && rating <= 100) {
      value = 220000000;
    } else {
      value = 0;
    }
  } else {
    value = 0;
  }
  return value;
}

export {
  getATTMID,
  findFreeBlock,
  findRandomFreeBlock,
  getRandomATTMID,
  getGK,
  calculatePlayerValue,
};
