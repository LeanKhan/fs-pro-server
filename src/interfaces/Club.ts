import { Player } from './Player';

export interface Club {
  Name: string;
  AttackingClass: number;
  DefensiveClass: number;
  Players: [];
  Manager: string;
  Stadium: string;
  LeagueCode: string;
}

/*
    NOTE!

    Change the type of Squad property back to 'Player[]'
    I only changed it here for testing purposes - LeanKhan

*/
