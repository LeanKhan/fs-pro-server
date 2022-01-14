/* eslint-disable no-prototype-builtins */
import { MatchSide } from '../classes/MatchSide';
import { IBlock } from '../state/ImmutableState/FieldGrid';
import { ratingFactors, postitionFactors, ageFactors } from './player-factors';
import log from '../helpers/logger';
import {
  IPositions,
  IFieldPlayer,
  PlayerInterface,
  IPlayerAttributes,
  Multipliers,
  AllMultipliers,
} from '../interfaces/Player';
import { Role } from '../controllers/players/player.model';

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

function calculatePlayerValue(pos: string, rating: number, age: number) {
  // 1. Get basevalue from overall...
  // 2. get position multiplier...
  // 3. get potential multiplier...
  // 4. get age multiplier...

  const basevalue = getBasevalue(Math.round(rating));

  console.log(`Basevalue => ${basevalue}`);

  const position_multiplier = basevalue * getPositionMultiplier(pos);

  console.log(`Position mu => ${position_multiplier}`);

  const age_multiplier = basevalue * getAgeMultiplier(pos, age);

  console.log(`Age mu => ${age_multiplier}`);

  return Math.round(basevalue + position_multiplier + age_multiplier);
}

function getBasevalue(rating: number): number {
  return ratingFactors[rating];
}

function calculateTotal(
  multiplier: Multipliers,
  attributes: IPlayerAttributes
) {
  // attributes.reduce((a: IPlayerAttributes) => {

  // }, 0)

  const attr = Object.keys(attributes);

  // attr.filter(a => typeof multiplier[c] != 'number' )

  const total = attr.reduce((sum, c, ci, arr) => {
    // console.log(`Type: ${typeof multiplier[c] != 'number'}`);
    // console.log(
    //   `Result: ${attributes[c]} x ${multiplier[c]} = ${
    //     attributes[c] * multiplier[c]
    //   }`
    // );
    if (typeof multiplier[c] != 'number') {
      return sum;
    }
    // attributes and multipliers must have the same keys :)
    return sum + attributes[c] * multiplier[c];
  }, 0);

  if (total > 99) return 99;

  return total;
}

/**
 Calculate Player Rating 
*/
export function calculatePlayerRating(
  attributes: IPlayerAttributes,
  position: string,
  role: Role
) {
  let multiplier: Multipliers;
  let rating = 0;

  // is this completely redundant?? - investigate  :p
  switch (position) {
    case 'ATT':
      rating = calculateTotal(AllMultipliers[role], attributes);
      break;
    case 'MID':
      rating = calculateTotal(AllMultipliers[role], attributes);
      break;
    case 'DEF':
      rating = calculateTotal(AllMultipliers[role], attributes);
      break;
    case 'GK':
      rating = calculateTotal(AllMultipliers[role], attributes);
      break;
    default:
      // this means the player is neither!
      rating = -10000;
      break;
  }

  return rating;
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
  if (pos === 'GK') {
    multiplier = -2;
  } else {
    // adding 1 to account for zero indexing
    multiplier = ageFactors[age + 1];
  }

  return multiplier / 100;
}

/** Get a random number between min and max */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
Sort from keeper down
-Returns the players from GK-DEF-MID-ATT

thank you Jesus!
**/
function sortFromKeeperDown(players: PlayerInterface[]) {
  const positions = { GK: 4, DEF: 3, MID: 2, ATT: 1 } as {
    GK: number;
    DEF: number;
    MID: number;
    ATT: number;
    [key: string]: number;
  };

  return players.sort((a, b) => positions[b.Position] - positions[a.Position]);
}

const attributes = [
  'Speed',
  'Shooting',
  'LongPass',
  'ShortPass',
  'Mental',
  'Tackling',
  'Keeping',
  'Control',
  'Strength',
  'Stamina',
  'SetPiece',
  'Dribbling',
  'Vision',
  'ShotPower',
  'Aggression',
  'Interception',
];

const attributesToIncrease: {
  ATT: string[];
  GK: string[];
  MID: string[];
  DEF: string[];
  [key: string]: string[];
} = {
  ATT: [
    'Speed',
    'Shooting',
    'LongPass',
    'ShortPass',
    'Mental',
    'Control',
    'SetPiece',
    'Dribbling',
  ],
  GK: ['LongPass', 'ShortPass', 'Control', 'Keeping'],
  MID: [
    'Speed',
    'Shooting',
    'Mental',
    'LongPass',
    'ShortPass',
    'Control',
    'Tackling',
    'Strength',
    'Dribbling',
  ],
  DEF: [
    'Speed',
    'Shooting',
    'Mental',
    'LongPass',
    'ShortPass',
    'Control',
    'Tackling',
    'Strength',
    'Stamina',
  ],
};

//  TODO: TEST THIS! 30-08-21
export function newAttributeRatings(player: PlayerInterface, pnts: number) {
  /**
   * - Get attributes that would be increased...
   * - Share points among attributes
   */
  let points = Math.round(pnts);

  if (player.Rating >= 95) {
    points *= 0.4;
    console.log('Rating > 95', points);
  } else if (player.Rating >= 88) {
    points *= 0.5;
    console.log('Rating > 88', points);
  } else if (player.Rating >= 80) {
    points *= 0.9;
    console.log('Rating > 80', points);
  }
  // if player is above a certain age then. his points shouldn't increase that much...
  if (player.Age > 32) {
    // he is no more developing quickly...
    points *= 0.4; // only use 80% of their points...
    console.log('Age > 32', points);
  } else if (player.Age > 28) {
    // he is no more developing quickly...
    points *= 0.5; // only use 80% of their points...
    console.log('Age > 28', points);
  } else if (player.Age >= 20 && player.Age <= 22) {
    // add some extra points to rating lol...
    points += 3;
    console.log('Age 20 - 22', points);
  } else if (player.Age < 20) {
    // add some extra points to rating lol...
    points += 5;
    console.log('Age < 20', points);
  }

  const toIncrease = [...attributesToIncrease[player.Position]];

  // console.log('Old Attributes => ', player.Attributes);

  // console.log('Points => ', points);

  // While there are still points to share...
  while (points > 0) {
    let toBeAdded = Math.round(Math.random() * points);

    if (Math.ceil(toBeAdded / 5) > 1) {
      // If this is higher than 5
      toBeAdded = 5;
    }
    const randomAttribute =
      toIncrease[Math.round(Math.random() * (toIncrease.length - 1))];

    // console.log(`toBeAdded => ${toBeAdded}, randomAtt => ${randomAttribute}`);

    if (toIncrease.length == 1) {
      // if it's the last atntribute to add... just add the remaining points.
      player.Attributes[randomAttribute] += points;
      break;
    }

    player.Attributes[randomAttribute] += toBeAdded;
    points -= toBeAdded;
    toIncrease.splice(toIncrease.indexOf(randomAttribute), 1);

    // console.log(`Points => ${points}, toIncrease => ${toIncrease.toString()}`);
  }

  // console.log('New Attributes => ', player.Attributes);

  const new_rating = Math.round(
    calculatePlayerRating(player.Attributes, player.Position, player.Role)
  );

  const new_value = calculatePlayerValue(
    player.Position,
    new_rating,
    player.Age
  );

  // console.log(
  //   `${player.FirstName} ${player.LastName} new rating is [${new_rating}], new value is [${new_value}]`
  // );

  // TODO: Age should be factored in distributing points...

  return { attributes: player.Attributes, new_rating, new_value };
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
