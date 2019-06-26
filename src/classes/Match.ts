import { Team } from './Team';
import { MatchSide } from './MatchSide';
import {moveEvents} from '../utils/events';

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

  constructor(home: Team, away: Team) {
    this.Home = new MatchSide(home);
    this.Away = new MatchSide(away);
    this.Details = {} as MatchDetails;

    moveEvents.on('yellow card', (player)=>{
      console.log('Yellow card for ' + player.FirstName);
    });

    moveEvents.on('red card', (player)=>{
      console.log('Red card for ' + player.FirstName);
    });

    moveEvents.on('foul', (player)=>{
      console.log('Foul commited by ' + player.FirstName);
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
