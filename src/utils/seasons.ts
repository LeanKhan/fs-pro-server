/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ClubInterface as IClub } from '../controllers/clubs/club.model';
import {
  ClubStandings,
  SeasonInterface,
} from '../controllers/seasons/season.model';

const alphabet = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
];

/**
 * Returns the short name of the month based on its index
 * @param index
 */
export function monthFromIndex(index: number): string {
  let month = 'NAN';

  switch (index) {
    case 0:
      // code...
      month = 'JAN';
      break;
    case 1:
      month = 'FEB';
      break;
    case 2:
      month = 'MAR';
      break;
    case 3:
      // code...
      month = 'APR';
      break;
    case 4:
      month = 'MAY';
      break;
    case 5:
      month = 'JUN';
      break;
    case 6:
      month = 'JUL';
      break;
    case 7:
      month = 'AUG';
      break;
    case 8:
      month = 'SEP';
      break;
    case 9:
      // code...
      month = 'OCT';
      break;
    case 10:
      month = 'NOV';
      break;
    case 11:
      month = 'DEC';
      break;
    default:
      // code...
      break;
  }

  return month;
}

/** Index from Month */
export function indexFromMonth(month: string): number {
  let index = -1;

  switch (month) {
    case 'JAN':
      // code...
      index = 0;
      break;
    case 'FEB':
      index = 1;
      break;
    case 'MAR':
      index = 2;
      break;
    case 'APR':
      // code...
      index = 3;
      break;
    case 'MAY':
      index = 4;
      break;
    case 'JUN':
      index = 5;
      break;
    case 'JUL':
      index = 6;
      break;
    case 'AUG':
      index = 7;
      break;
    case 'SEP':
      index = 8;
      break;
    case 'OCT':
      // code...
      index = 9;
      break;
    case 'NOV':
      index = 10;
      break;
    case 'DEC':
      index = 11;
      break;
    default:
      // code...
      break;
  }

  return index;
}

/**
 * Returns a random n-length code!
 * @param length
 * @returns
 */
export function randomCode(length: number) {
  let code = '';
  for (let index = 0; index < length; index++) {
    const i = Math.round(Math.random() * (alphabet.length - 1));
    code = code.concat(alphabet[i]);
  }

  return code.toUpperCase();
}

/**
 * Generate the Week Table
 * @param clubs
 */
export function generateWeekTable(clubs: IClub[]) {
  const table = clubs.map((club) => {
    return {
      ClubCode: club.ClubCode,
      ClubID: club._id,
      Points: 0,
      Played: 0,
      Wins: 0,
      Losses: 0,
      Draws: 0,
      GF: 0,
      GA: 0,
      GD: 0,
    };
  });

  return table;
}

export interface fixtureInterface {
  homeId: string;
  awayId: string;
  homeCode: string;
  awayCode: string;
  homeName: string;
  awayName: string;
  seasonCode: string;
  seasonId: string;
  leagueCode: string;
  stadium: string;
  index: number;
  matchesPerWeek: number;
  type: 'league' | 'cup' | 'tournament' | 'friendly';
  isFinalMatch: boolean;
}

/**
 * Generate the plain fixture Object {} :)
 * @param homeId
 * @param awayId
 * @param homeCode
 * @param awayCode
 * @param homeName
 * @param awayName
 * @param seasonCode
 * @param seasonId
 * @param leagueCode
 * @param stadium
 * @param index
 * @param matchesPerWeek
 */
export function generateFixtureObject(data: fixtureInterface) {
  return {
    FixtureCode: `${data.seasonCode}|match-${data.index + 1}`,
    Title: `${data.homeName} vs ${data.awayName}`,
    SeasonCode: data.seasonCode,
    LeagueCode: data.leagueCode,
    Season: data.seasonId,
    Home: data.homeCode,
    Away: data.awayCode,
    HomeTeam: data.homeId,
    AwayTeam: data.awayId,
    Stadium: data.stadium,
    Type: data.type,
    MatchDay: data.index + 1,
    Week: Math.ceil((data.index + 1) / data.matchesPerWeek),
    isFinalMatch: data.isFinalMatch,
  };
}

// DONE: Record the reverse or first-leg fixture...
// For this we just need to look for another fixture where the roles are reversed...
// So find a fixture where current HOME is AWAY and AWAY is HOME...

export class RoundRobin {
  private teams: number[];
  private rounds: Array<{ home: number; away: number }> = [];

  constructor(teamsLength: number) {
    // TODO: check this out
    // eslint-disable-next-line prefer-spread
    this.teams = Array.apply(null, Array(teamsLength)).map((_, i) => i);
  }

  public generateFixtures() {
    for (let i = 0; i < this.teams.length - 1; i++) {
      this.rounds = this.rounds.concat(this.generateRoundFixtures());
      this.nextRound();
    }

    this.rounds = this.rounds.concat(this.reverseFixtures(this.rounds));

    return this.rounds;
  }

  private nextRound() {
    const next = this.teams.pop() as number;

    this.teams.splice(1, 0, next);
  }

  private generateRoundFixtures() {
    const round = [];
    for (let y = 0; y < this.teams.length / 2; y++) {
      const home = progression(y + 1, 0, 1);
      const away = progression(y + 1, this.teams.length - 1, -1);
      round.push({ home: this.teams[home], away: this.teams[away] });
    }

    return round;
  }

  private reverseFixtures(fixtures: Array<{ home: number; away: number }>) {
    return fixtures.map((f) => {
      return { home: f.away, away: f.home };
    });
  }
}

function progression(n: number, a: number, d: number) {
  return a + (n - 1) * d;
}

function sumStandings(
  standings: SeasonInterface['Standings']
): ClubStandings[] {
  return standings.reduce((acc: any, week) => acc.concat(week.Table), []);
}

function sortStandings(standings: ClubStandings[]) {
  return standings.sort((a, b) => {
    if (b.Points === a.Points) {
       // return b.GD - a.GF;
      if (b.GD === a.GD) {
        return b.GF - a.GF;
      } else {
        return b.GD - a.GD;
      }
    }
    return b.Points - a.Points;
  });
}

/**
 *  Array.from(new Set(allStandings.map((x) => x.ClubID))).forEach((x) => {
    sum.push(
      allStandings
        .filter((y) => y.ClubID === x)
        .reduce((output: any, item: any) => {
 */
export function compileStandings(standings: SeasonInterface['Standings']) {
  const allStandings = sumStandings(standings);

  const sum: any[] = [];

  Array.from(new Set(allStandings.map((x) => x.ClubID))).forEach((x) => {
    sum.push(
      allStandings
        .filter((y) => y.ClubID === x)
        .reduce((output: any, item: any) => {
          const pnts = output['Points'] === undefined ? 0 : output['Points'];
          const gd = output['GD'] === undefined ? 0 : output['GD'];
          const ga = output['GA'] === undefined ? 0 : output['GA'];
          const gf = output['GF'] === undefined ? 0 : output['GF'];
          const plyd = output['Played'] === undefined ? 0 : output['Played'];
          const w = output['Wins'] === undefined ? 0 : output['Wins'];
          const l = output['Losses'] === undefined ? 0 : output['Losses'];
          const d = output['Draws'] === undefined ? 0 : output['Draws'];

          output['ClubID'] = x;
          output['ClubCode'] = item.ClubCode;
          output['Points'] = item.Points + pnts;
          output['GD'] = item.GD + gd;
          output['GA'] = item.GA + ga;
          output['GF'] = item.GF + gf;
          output['Played'] = item.Played + plyd;
          output['Wins'] = item.Wins + w;
          output['Losses'] = item.Losses + l;
          output['Draws'] = item.Draws + d;

          return output;
        }, {})
    );
  });
  return sortStandings(sum);
}