export interface FormationsList {
  'AWAY-433': string[];
  'HOME-433': string[];
  [key: string]: string[];
}

export const formations: FormationsList = {
  'AWAY-433': [
    'P4',
    'P8',
    'P10',
    'P12',
    'P14',
    'P23',
    'P25',
    'P27',
    'P31',
    'P33',
    'P39',
  ],
  'HOME-433': [
    'P81',
    'P75',
    'P73',
    'P69',
    'P67',
    'P65',
    'P56',
    'P54',
    'P52',
    'P50',
    'P46',
  ],
};
