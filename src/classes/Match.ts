import { Club } from './Club';
import { MatchSide } from './MatchSide';
import { matchEvents } from '../utils/events';
import { IBlock } from './Ball';
import { IFieldPlayer } from '../interfaces/Player';

/**
 * The Match Class gan gan
 */
export class Match implements IMatch {
  public Home: MatchSide;
  public Away: MatchSide;
  public Details!: IMatchDetails;
  public Events!: {};
  private CurrentTime: number = 0;

  /**
   * Create a new match bro
   *
   *
   * @param {Team} home The Home Team
   * @param {Team} away The Away Team
   * @param {IBlock} awayPost The Post of the Away team (where Home will score)
   * @param {IBlock} homePost The Post of the Home team (where Away will score)
   */
  constructor(home: Club, away: Club, awayPost: IBlock, homePost: IBlock) {
    this.Home = new MatchSide(home, awayPost, homePost);
    this.Away = new MatchSide(away, homePost, awayPost);
    this.Details = {} as IMatchDetails;

    matchEvents.on('game halt', data => {
      console.log(
        `${data.reason} offence by ${data.subject.LastName} on ${
          data.object.LastName
        }`
      );
    });

    matchEvents.on('goal!', () => {
      console.log('GOAAAALLL!!!');
    });

    matchEvents.on('pass made', data => {
      console.log(`Pass from ${data.passer} to ${data.reciever}`);
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
        )} at ${this.getCurrentTime} mins`
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
  };

  public setCurrentTime(time: number) {
    this.CurrentTime = time;
  }

  public get getCurrentTime(): number {
    return this.CurrentTime;
  }

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

export interface IMatchData {
  attackingSide?: MatchSide;
  activePlayerAS?: IFieldPlayer;
  defendingSide?: MatchSide;
  activePlayerDS?: IFieldPlayer;
}

export interface IMatchSideDetails {
  Score: number;
  Possession: number;
  Goals: number;
  Shots: number;
  Fouls: number;
  YellowCards: number;
  RedCards: number;
  Passes: number;
  Events: IMatchEvent[];
  [key: string]: any;
}

/**
 *  @todo Flesh this guy out!
 */

// TODO: Flesh this guy out! - LeanKhan
export interface IMatchEvent {
  Type: string;
}

export interface IMatchDetails {
  Title: string;
  LeagueName: string;
  Draw: boolean;
  Played: boolean;
  Score: number;
  Time: Date;
  HomeTeamScore: number;
  AwayTeamScore: number;
  Winner: string | null;
  Loser: string | null;
  HomeTeamDetails: IMatchSideDetails;
  AwayTeamDetails: IMatchSideDetails;
}

export interface IMatch {
  Home: MatchSide;
  Away: MatchSide;
  Details: IMatchDetails;
  Events: {};
  getCurrentTime: number;
  setCurrentTime(time: number): any;
  report(): void;
  start(): void;
}
