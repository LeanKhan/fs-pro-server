import { Team } from './Team';
import { MatchSide } from './MatchSide';
import { matchEvents } from '../utils/events';
import { IBlock } from './Ball';

export interface MatchDetails {
  Title: string;
  LeagueString: string;
  Draw: boolean;
  Played: boolean;
  Time: Date;
  HomeTeamScore: number;
  AwayTeamScore: number;
  Winner: string | null;
  Loser: string | null;
  HomeTeamDetails: {};
  AwayTeamDetails: {};
}

/**
 * Match Interface bro!
 */
export interface MatchInterface {
  Home: MatchSide;
  Away: MatchSide;
  Details: MatchDetails;
  Events: {};
  report(): void;
  start(): void;
}

export class Match implements MatchInterface {
  public Home: MatchSide;
  public Away: MatchSide;

  public Details!: MatchDetails;

  public Events!: {};

  public Time: number = 90;

  /**
   * Create a new match bro
   * 
   *  
   * @param {Team} home The Home Team
   * @param {Team} away The Away Team
   * @param {IBlock} awayPost The Post of the Away team (where Home will score)
   * @param {IBlock} homePost The Post of the Home team (where Away will score)
   */
  constructor(home: Team, away: Team, awayPost:IBlock, homePost:IBlock) {
    this.Home = new MatchSide(home, awayPost);
    this.Away = new MatchSide(away, homePost);
    this.Details = {} as MatchDetails;

    matchEvents.on('game halt', data => {
      console.log(
        `${data.reason} offence by ${data.subject.LastName} on ${
          data.object.LastName
        }`
      );
    });

    matchEvents.on('pass made', data => {
      console.log(`Pass from ${data.passer} to ${data.teammate}`);
    });

    matchEvents.on('pass intercepted', data => {
      console.log(
        `Attempted Pass from ${data.passer} intercepted by ${data.interceptor}`
      );
    });

    matchEvents.on('dribble', data => {
      console.log(`${data.dribbler} dribbled ${data.dribbled} successfully`);
    });

    matchEvents.on('bad-tackle', data => {
      console.log(
        `${data.tackler} at ${JSON.stringify(
          data.tacklerPosition
        )} made a bad tackle on ${data.tackled} who was at ${JSON.stringify(
          data.tackledPlayerPosition
        )}`
      );
    });

    matchEvents.on('successful-tackle', data => {
      console.log(
        `${data.tackler} at ${JSON.stringify(
          data.tacklerPosition
        )} tackled the ball from ${data.tackled} who was at ${JSON.stringify(
          data.tackledPlayerPosition
        )}`
      );
    });
  }

  /** Create match report */
  public report = () => {
    // tslint:disable-next-line: no-debugger
    // debugger;
    if (this.Home.GoalsScored === this.Away.GoalsScored) {
      this.Details.Winner = null;
      this.Details.Loser = null;
      this.Details.Draw = true;
    } else if (this.Home.GoalsScored > this.Away.GoalsScored) {
      this.Details.Winner = this.Home.Name;
      this.Details.Loser = this.Away.Name;
    } else {
      this.Details.Winner = this.Away.Name;
      this.Details.Loser = this.Home.Name;
    }
    this.Details.Time = new Date();
    this.Details.Title = `${this.Home.Name} vs ${this.Away.Name} <-> ${
      this.Details.Time
    }`;
    this.Details.HomeTeamDetails = {
      GoalsScored: this.Home.GoalsScored,
      ChancesCreatedRate: this.Home.ChancesCreatedRate,
      ChancesCreatedNumber: this.Home.ChancesCreatedNumber,
      ProbabilityNumber: this.Home.ProbalityNumber,
      DefensiveForm: this.Home.DefensiveForm,
      AttackingForm: this.Home.AttackingForm,
      DefensiveClass: this.Home.DefensiveClass,
      AttackingClass: this.Home.AttackingClass,
    };
    this.Details.AwayTeamDetails = {
      GoalsScored: this.Away.GoalsScored,
      ChancesCreatedRate: this.Away.ChancesCreatedRate,
      ChancesCreatedNumber: this.Away.ChancesCreatedNumber,
      ProbabilityNumber: this.Away.ProbalityNumber,
      DefensiveForm: this.Away.DefensiveForm,
      AttackingForm: this.Away.AttackingForm,
      DefensiveClass: this.Away.DefensiveClass,
      AttackingClass: this.Away.AttackingClass,
    };
  };

  // public startMatch(){
  //   for(let i:number = 0; i <= this.Time; i++){
  //   }
  // }


  /** Start match */
  public start = () => {
    this.Home.calculateForm();
    this.Away.calculateForm();

    this.Home.calculateCCR(this.Away.DefensiveClass, this.Away.DefensiveForm);
    this.Away.calculateCCR(this.Home.DefensiveClass, this.Home.DefensiveForm);

    this.Home.calculateCCN();
    this.Away.calculateCCN();

    this.Home.calculateGoalsScored(this.Away.DefensiveForm);
    this.Away.calculateGoalsScored(this.Home.DefensiveForm);

    this.report();
    // console.log(this.Home)
  };
}
