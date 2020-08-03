import { MatchSide } from '../classes/MatchSide';
import { IBlock } from '../state/ImmutableState/FieldGrid';
import * as co from './coordinates';
import { IPositions, IFieldPlayer, IPlayer } from '../interfaces/Player';
import { ratingFactors, postitionFactors, ageFactors } from './player_factors';

/**
 * Get attackers and midfielders that are not with the ball
 *
 * @param team
 */
function getATTMID(team: MatchSide) {
  return team.StartingSquad.filter((player) => {
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
  return team.StartingSquad.filter((player) => {
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
  return squad.find((player) => {
    // tslint:disable-next-line: triple-equals
    return player.Position === 'GK';
  });
}

function getRandomDEF(team: MatchSide) {
  return team.StartingSquad.find((player) => {
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

// function calculatePlayerValue(rating: number, age: number) {
//   let value;

//   if (age >= 17 && age < 20) {
//     if(rating > 40) {
//       value = 500000;
//     }
//     else if (rating < 60) {
//       value = 1000000;
//     } else if (rating >= 60 && rating < 70) {
//       value = 2000000;
//     } else if (rating >= 70 && rating < 75) {
//       value = 4000000;
//     } else if (rating >= 75 && rating < 80) {
//       value = 12000000;
//     } else if (rating >= 80 && rating < 85) {
//       value = 40000000;
//     } else if (rating >= 85 && rating < 90) {
//       value = 100000000;
//     } else if (rating >= 90 && rating < 95) {
//       value = 160000000;
//     } else if (rating >= 95 && rating <= 100) {
//       value = 200000000;
//     } else {
//       value = 0;
//     }
//   } else if (age >= 20 && age < 24) {
//     if (rating < 60) {
//       value = 500000;
//     } else if (rating >= 60 && rating < 70) {
//       value = 4000000;
//     } else if (rating >= 70 && rating < 75) {
//       value = 6000000;
//     } else if (rating >= 75 && rating < 80) {
//       value = 15000000;
//     } else if (rating >= 80 && rating < 85) {
//       value = 44000000;
//     } else if (rating >= 85 && rating < 90) {
//       value = value = 90000000;
//     } else if (rating >= 90 && rating < 95) {
//       value = 180000000;
//     } else if (rating >= 95 && rating <= 100) {
//       value = 240000000;
//     } else {
//       value = 0;
//     }
//   } else if (age >= 24 && age < 26) {
//     if (rating < 60) {
//       value = 400000;
//     } else if (rating >= 60 && rating < 70) {
//       value = 3000000;
//     } else if (rating >= 70 && rating < 75) {
//       value = 18000000;
//     } else if (rating >= 75 && rating < 80) {
//       value = 30000000;
//     } else if (rating >= 80 && rating < 85) {
//       value = 48000000;
//     } else if (rating >= 85 && rating < 90) {
//       value = 120000000;
//     } else if (rating >= 90 && rating < 95) {
//       value = 200000000;
//     } else if (rating >= 95 && rating <= 100) {
//       value = 250000000;
//     } else {
//       value = 0;
//     }
//   } else if (age >= 26 && age < 30) {
//     if (rating < 60) {
//       value = 350000;
//     } else if (rating >= 60 && rating < 70) {
//       value = 2500000;
//     } else if (rating >= 70 && rating < 75) {
//       value = 15000000;
//     } else if (rating >= 75 && rating < 80) {
//       value = 34000000;
//     } else if (rating >= 80 && rating < 85) {
//       value = 8000000;
//     } else if (rating >= 85 && rating < 90) {
//       value = 120000000;
//     } else if (rating >= 90 && rating < 95) {
//       value = 140000000;
//     } else if (rating >= 95 && rating <= 100) {
//       value = 240000000;
//     } else {
//       value = 0;
//     }
//   } else if (age >= 30 && age < 42) {
//     if (rating < 60) {
//       value = 350000;
//     } else if (rating >= 60 && rating < 70) {
//       value = 2000000;
//     } else if (rating >= 70 && rating < 75) {
//       value = 12000000;
//     } else if (rating >= 75 && rating < 80) {
//       value = 28000000;
//     } else if (rating >= 80 && rating < 85) {
//       value = 46000000;
//     } else if (rating >= 85 && rating < 90) {
//       value = 90000000;
//     } else if (rating >= 90 && rating < 95) {
//       value = 130000000;
//     } else if (rating >= 95 && rating <= 100) {
//       value = 220000000;
//     } else {
//       value = 0;
//     }
//   } else {
//     value = 0;
//   }
//   return value;
// }

function calculatePlayerValue(pos: string, rating: number, age: number) {
  // 1. Get basevalue from overall...
  // 2. get position multiplier...
  // 3. get potential multiplier...
  // 4. get age multiplier...

  const basevalue = getBasevalue(Math.round(rating));

  console.log('Basevalue =>', basevalue);

  const position_multiplier = basevalue * getPositionMultiplier(pos);

  console.log('Position mu =>', position_multiplier);

  const age_multiplier = basevalue * getAgeMultiplier(pos, age);

  console.log('Age mu =>', age_multiplier);

  return Math.round(basevalue + position_multiplier + age_multiplier);
}

function getBasevalue(rating: number): number {
  return ratingFactors[rating];
}

function getPositionMultiplier(pos: string): number {
  let position = -1;
  switch (pos) {
    case 'GK':
      position = 0;
      break;
    case 'DEF':
      position = 1 + Math.round(Math.random() * 10);
      break;
    case 'MID':
      position = randomBetween(12, 20);
      break;
    case 'ATT':
      position = randomBetween(20, 26);
      break;
    default:
      break;
  }

  return postitionFactors[position] / 100;
}

function getAgeMultiplier(pos: string, age: number): number {
  let multiplier = 0;
  if (pos == 'GK') {
    multiplier = -2;
  } else {
    multiplier = ageFactors[age];
  }

  return multiplier / 100;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
Sort from keeper down
-Returns the players from GK-DEF-MID-ATT

thank you Jesus!
**/
function sortFromKeeperDown(players: IPlayer[]) {
  const positions = { GK: 4, DEF: 3, MID: 2, ATT: 1 } as {
    GK: number;
    DEF: number;
    MID: number;
    ATT: number;
    [key: string]: number;
  };

  return players.sort((a, b) => positions[b.Position] - positions[a.Position]);
}

export {
  getATTMID,
  findFreeBlock,
  findRandomFreeBlock,
  getRandomATTMID,
  getGK,
  calculatePlayerValue,
  sortFromKeeperDown,
};
