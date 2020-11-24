export interface FormationsList {
  'AWAY-433': FormationItem[];
  'HOME-433': FormationItem[];
  [key: string]: any[];
}

export interface FormationItem {
  positions: string[];
  block: number;
}
// export const formations: FormationsList = {
//   'AWAY-433': [89, 28, 58, 118, 148, 41, 131, 24, 84, 144, 83],
//   'HOME-433': [
//     75,
//     16,
//     46,
//     106,
//     136,
//     33,
//     79,
//     123,
//     20,
//     140,
//     82,
//     // 81, This is the original position the player that is meant to start...
//   ],
// };

export const formations: FormationsList = {
  'AWAY-433': [
    { positions: ['GK'], block: 89 },
    { positions: ['DEF'], block: 28 },
    { positions: ['DEF'], block: 58 },
    { positions: ['DEF', 'MID'], block: 118 },
    { positions: ['DEF', 'MID'], block: 148 },
    { positions: ['MID', 'DEF'], block: 41 },
    { positions: ['MID', 'DEF', 'ATT'], block: 131 },
    { positions: ['MID', 'ATT'], block: 24 },
    { positions: ['ATT', 'MID'], block: 84 },
    { positions: ['ATT', 'MID'], block: 144 },
    { positions: ['ATT', 'MID'], block: 83 },
  ],
  'HOME-433': [
    { positions: ['GK'], block: 75 },
    { positions: ['DEF'], block: 16 },
    { positions: ['DEF'], block: 46 },
    { positions: ['DEF', 'MID'], block: 106 },
    { positions: ['DEF', 'MID'], block: 136 },
    { positions: ['MID', 'DEF'], block: 33 },
    { positions: ['MID', 'DEF', 'ATT'], block: 79 },
    { positions: ['MID', 'ATT'], block: 123 },
    { positions: ['ATT', 'MID'], block: 20 },
    { positions: ['ATT', 'MID'], block: 140 },
    { positions: ['ATT', 'MID'], block: 82 },
    // 81, This is the original position the player that is meant to start...
  ],
};

// Formations should give detail on what kind of player will play at the position...

// {position: ['GK'], blockNumber: 75}
