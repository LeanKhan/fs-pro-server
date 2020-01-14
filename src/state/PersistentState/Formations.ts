export interface FormationsList {
  'AWAY-433': number[];
  'HOME-433': number[];
  [key: string]: number[];
}

export const formations: FormationsList = {
  'AWAY-433': [89, 28, 58, 118, 148, 41, 131, 24, 84, 144, 83],
  'HOME-433': [
    75,
    16,
    46,
    106,
    136,
    33,
    79,
    123,
    20,
    140,
    82,
    // 81, This is the original position the player that is meant to start...
  ],
};
