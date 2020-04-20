import { Club } from '../controllers/clubs/club.model';

/**
 * Returns the short name of the month based on its index
 * @param index
 */
export function monthFromIndex(index: number): string {
  // TODO: Add the remaining months!
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
    default:
      // code...
      break;
  }

  return month;
}

/**
 * Generate the Week Table
 * @param clubs
 */
export function generateWeekTable(clubs: Club[]) {
  const table = clubs.map((club) => {
    return {
      ClubCode: club.ClubCode,
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
export function generateFixtureObject(
  homeId: string,
  awayId: string,
  homeCode: string,
  awayCode: string,
  homeName: string,
  awayName: string,
  seasonCode: string,
  seasonId: string,
  leagueCode: string,
  stadium: string,
  index: number,
  matchesPerWeek: number
) {
  return {
    FixtureID: `M${index + 1}|${seasonCode}`,
    Title: `${homeName} vs ${awayName}`,
    SeasonCode: seasonCode,
    LeagueCode: leagueCode,
    Season: seasonId,
    Home: homeCode,
    Away: awayCode,
    HomeTeam: homeId,
    AwayTeam: awayId,
    Stadium: stadium,
    Week: Math.ceil((index + 1) / matchesPerWeek),
  };
}
// TODO: Record the reverse or first-leg fixture...
export class RoundRobin {
  private teams: number[];
  private rounds: Array<{ home: number; away: number }> = [];

  constructor(teamsLength: number) {
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
