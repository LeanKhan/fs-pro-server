import { ClubInterface as Club } from '../controllers/clubs/club.model';
import { MatchSide } from './MatchSide';
import { matchEvents, createMatchEvent, ballMove } from '../utils/events';
import { IBlock } from '../state/ImmutableState/FieldGrid';
import { IFieldPlayer, IPlayerStats } from '../interfaces/Player';
import { IShot, IPass, GamePoints, ITackle, IDribble } from './Referee';
/**
 * The Match Class gan gan
 */

abstract class MatchClass {
  public static instances: number;
}
// tslint:disable-next-line: max-classes-per-file
export class Match implements IMatch, MatchClass {
  public static instances: number = 0;
  public Home: MatchSide;
  public Away: MatchSide;
  public CenterBlock: IBlock;
  public Details!: IMatchDetails;
  public Events: IMatchEvent[];
  public Actions: IMatchAction[] = [];
  private CurrentTime: number = 0;
  private Teams: MatchSide[];

  /**
   * Create a new match bro
   *
   *
   * @param {Team} home The Home Team
   * @param {Team} away The Away Team
   * @param {IBlock} awayPost The Post of the Away team (where Home will score)
   * @param {IBlock} homePost The Post of the Home team (where Away will score)
   */
  constructor(
    home: Club,
    away: Club,
    awayPost: IBlock,
    homePost: IBlock,
    centerBlock: IBlock
  ) {
    this.Home = new MatchSide(home, awayPost, homePost);
    this.Away = new MatchSide(away, homePost, awayPost);
    this.Teams = [this.Home, this.Away];
    this.CenterBlock = centerBlock;
    this.Events = [];
    this.Details = {
      HomeTeamScore: 0,
      AwayTeamScore: 0,
      TotalPasses: 0,
      Goals: 0,
      HomeTeamDetails: {
        Score: 0,
        Possession: 0,
        TimesWithBall: 0,
        Goals: 0,
        TotalShots: 0,
        ShotsOnTarget: 0,
        ShotsOffTarget: 0,
        Fouls: 0,
        YellowCards: 0,
        RedCards: 0,
        Passes: 0,
      },
      AwayTeamDetails: {
        Score: 0,
        Possession: 0,
        TimesWithBall: 0,
        Goals: 0,
        TotalShots: 0,
        ShotsOnTarget: 0,
        ShotsOffTarget: 0,
        Fouls: 0,
        YellowCards: 0,
        RedCards: 0,
        Passes: 0,
      },
    } as IMatchDetails;

    matchEvents.on('shot', (data: IShot) => {
      // const teamIndex = this.Teams!.findIndex(
      //   (t) => t.ClubCode === data.shooter.ClubCode
      // );
      if (this.Home.ClubCode === data.shooter.ClubCode) {
        this.Details.HomeTeamDetails.TotalShots++;
        switch (data.result) {
          case 'goal':
          case 'save':
            this.Details.HomeTeamDetails.ShotsOnTarget++;
            break;
          case 'miss':
            this.Details.HomeTeamDetails.ShotsOffTarget++;
            break;
        }
      } else {
        this.Details.AwayTeamDetails.TotalShots++;
        switch (data.result) {
          case 'goal':
          case 'save':
            this.Details.AwayTeamDetails.ShotsOnTarget++;
            break;
          case 'miss':
            this.Details.AwayTeamDetails.ShotsOffTarget++;
            break;
        }
      }
    });

    matchEvents.on('goal!', (data: IShot) => {
      console.log('GOAAAALLL!!!');

      // add to match actions...
      this.Actions.push({
        type: 'goal',
        playerID: data.shooter.PlayerID,
        playerTeam: data.shooter.ClubCode!,
        timestamp: this.getCurrentTime,
      });

      data.shooter.increaseGoalTally();

      data.shooter.increasePoints(GamePoints.Goal);

      // now determine if there was an assist!

      const actionLength = this.Actions.length > 1 ? this.Actions.length : 2;

      if (
        this.Actions[actionLength - 2].type === 'pass' &&
        this.Actions[actionLength - 2].playerTeam === data.shooter.ClubCode!
      ) {
        const playerID = this.Actions[actionLength - 2].playerID;

        const assister = this.fetchPlayerById(playerID);

        assister!.GameStats.Assists++;
        assister!.increasePoints(GamePoints.Assist);
      }

      // subtract from keeper's points :3
      data.keeper.increasePoints(-GamePoints.Save / 2);

      if (data.shooter.ClubCode === this.Home.ClubCode) {
        this.Details.HomeTeamScore++;
        this.Details.HomeTeamDetails.Goals++;
      } else if (data.shooter.ClubCode === this.Away.ClubCode) {
        this.Details.AwayTeamScore++;
        this.Details.AwayTeamDetails.Goals++;
      }

      console.log(
        `Goal from ${data.shooter.FirstName} ${data.shooter.LastName} now at ${data.shooter.GameStats.Goals}`
      );

      this.Details.Goals++;
    });

    matchEvents.on('event', (data: IMatchEvent) => {
      data.time = this.getCurrentTime.toString();
      this.Events.push(data);
    });

    matchEvents.on('saved-shot', (data: IShot) => {
      data.keeper.GameStats.Saves++;
      data.keeper.increasePoints(GamePoints.Save);
      console.log('Shot was saved yo');
    });

    matchEvents.on('missed-shot', (data: IShot) => {
      data.shooter.increasePoints(-GamePoints.Goal / 2);
      console.log('Missed shot though :(');
    });

    matchEvents.on('pass-made', (data: IPass) => {
      this.Details.TotalPasses++;
      data.passer.GameStats.Passes++;
      data.passer.increasePoints(GamePoints.Pass);

      // add to match actions...
      this.Actions.push({
        type: 'pass',
        playerID: data.passer.PlayerID,
        playerTeam: data.passer.ClubCode!,
        timestamp: this.getCurrentTime,
      });

      // // give receiver some passes
      data.receiver.increasePoints(-GamePoints.Pass / 2);
      this.Home.ClubCode === data.passer.ClubCode
        ? this.Details.HomeTeamDetails.Passes++
        : this.Details.AwayTeamDetails.Passes++;
      console.log(
        `Pass from ${data.passer.LastName} to ${data.receiver.LastName}`
      );
    });

    matchEvents.on('pass intercepted', (data) => {
      console.log(
        `Attempted Pass from ${data.passer} intercepted by ${data.interceptor}`
      );
    });

    matchEvents.on('dribble', (data: IDribble) => {
      data.dribbler.GameStats.Dribbles++;
      data.dribbler.increasePoints(GamePoints.Dribble);

      // Remove points from Dribbled :)
      data.dribbled.increasePoints(-GamePoints.Dribble / 2);

      console.log(`${data.dribbler.FirstName} ${data.dribbler.LastName} [${data.dribbler.ClubCode}] dribbled
      ${data.dribbled.FirstName} ${data.dribbled.LastName} [${data.dribbled.ClubCode}] successfully`);
    });

    matchEvents.on('tackle', (data: ITackle) => {
      // Increase points for somebori

      if (data.success) {
        data.tackler.GameStats.Tackles++;
        data.tackler.increasePoints(GamePoints.Tackle);

        console.log(
          `${data.tackler.FirstName} ${data.tackler.LastName} [with Ball? ${
            data.tackler.WithBall
          }] at ${JSON.stringify({
            x: data.tackler.BlockPosition.x,
            y: data.tackler.BlockPosition.y,
            key: data.tackler.BlockPosition.key,
          })} tackled the ball from ${data.tackled.FirstName} ${
            data.tackled.LastName
          } [with Ball? ${data.tackled.WithBall}] who was at ${JSON.stringify({
            x: data.tackled.BlockPosition.x,
            y: data.tackled.BlockPosition.y,
            key: data.tackled.BlockPosition.key,
          })} at ${this.getCurrentTime} mins`
        );
      } else {
        // Subtract points hehe
        data.tackler.increasePoints(-GamePoints.Tackle / 2);

        console.log(
          `Unsuccessful tackle attempt by ${data.tackler.FirstName} ${
            data.tackler.LastName
          } at ${JSON.stringify(data.tackler.BlockPosition.key)} on ${
            data.tackled.FirstName
          } ${data.tackled.LastName} who was at ${JSON.stringify(
            data.tackled.BlockPosition.key
          )} at ${this.getCurrentTime} mins`
        );
      }
    });

    matchEvents.on('reset-formations', () => {
      console.log('********Resetting formations *********');
      this.resetClubFormations();
      matchEvents.emit('reset-ball-position');
    });

    matchEvents.on('half-end', () => {
      console.log('First half over!');
      console.log(
        'Match Result => ',
        `[${this.Home.ClubCode}] ${this.Details.HomeTeamScore} : ${this.Details.AwayTeamScore} [${this.Away.ClubCode}]`
      );

      createMatchEvent('Half Over', 'match');

      // console.table(this.Events); TODO - UNCOMMENT O

      console.log('Home Team => ', this.Home.ClubCode);
      this.Home.StartingSquad.forEach((p) => {
        console.log(
          `[${p.FirstName} ${p.LastName}] - ${p.PlayerID} ${p.Position}`
        );
        // console.table(p.GameStats); TODO -UNCOMMENT O
      });

      console.log('Away Team => ', this.Away.ClubCode);
      this.Away.StartingSquad.forEach((p) => {
        console.log(
          `[${p.FirstName} ${p.LastName}] - ${p.PlayerID} ${p.Position}`
        );
        // console.table(p.GameStats); TODO - UNCOMMENT O
      });

      this.endMatch();
    });

    Match.instances++;
  }

  public castEvent(data: IMatchEvent) {
    matchEvents.emit('event', data);
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
      this.Details.Winner = { code: this.Home.ClubCode, id: this.Home._id };
      this.Details.Loser = { code: this.Away.ClubCode, id: this.Away._id };
    } else {
      this.Details.Winner = { code: this.Away.ClubCode, id: this.Away._id };
      this.Details.Loser = { code: this.Home.ClubCode, id: this.Home._id };
    }
    this.Details.Time = new Date();
    this.Details.Title = `${this.Home.Name} vs ${this.Away.Name} <-> ${this.Details.Time}`;
  };

  public resetClubFormations() {
    this.Home.resetFormation();
    this.Away.resetFormation();
  }

  public getWinners() {
    if (this.Details.HomeTeamScore > this.Details.AwayTeamScore) {
      this.Details.Winner = { code: this.Home.ClubCode, id: this.Home._id };
      this.Details.Loser = { code: this.Away.ClubCode, id: this.Away._id };
      this.Details.Draw = false;
    } else if (this.Details.HomeTeamScore === this.Details.AwayTeamScore) {
      this.Details.Draw = true;
      this.Details.Winner = null;
      this.Details.Loser = null;
    } else {
      this.Details.Winner = { code: this.Away.ClubCode, id: this.Away._id };
      this.Details.Loser = { code: this.Home.ClubCode, id: this.Home._id };
      this.Details.Draw = false;
    }
  }

  public setPlayerStats() {
    this.Details.HomeTeamDetails.PlayerStats = this.Home.getPlayerStats();
    this.Details.AwayTeamDetails.PlayerStats = this.Away.getPlayerStats();
  }

  public endMatch() {
    this.Details.Played = true;
    this.Details.FullTimeScore = `${this.Details.HomeTeamScore} : ${this.Details.AwayTeamScore}`;
    this.calculatePosession();
    this.setPlayerStats();
    this.getWinners();
    this.getMOTM();

    console.log('ball-moved listeners: ', ballMove.listenerCount('ball-moved'));
    if (this.getCurrentTime === 90) {
      // Only remove the listeners at the end of the match :) Thank you Jesus!
      ballMove.removeAllListeners();
      matchEvents.removeAllListeners();
    }
    console.log('Match Details =>', this.Details);
  }

  public setCurrentTime(time: number) {
    this.CurrentTime = time;
  }

  public get getCurrentTime(): number {
    return this.CurrentTime;
  }

  public recordPossession(team: MatchSide) {
    if (team) {
      if (team.ClubCode === this.Home.ClubCode) {
        this.Details.HomeTeamDetails.TimesWithBall++;
      } else {
        this.Details.AwayTeamDetails.TimesWithBall++;
      }
    }
  }

  public fetchPlayerById(id: string) {
    const allPlayers = this.Home.StartingSquad.concat(this.Away.StartingSquad);

    return allPlayers.find((player) => {
      return player.PlayerID === id;
    });
  }

  public showActions() {
    // console.table(this.Actions); TODO: UNCOMMENT O
    console.table('this.Actions');
  }

  public calculatePosession() {
    const totalPossession =
      this.Details.HomeTeamDetails.TimesWithBall +
      this.Details.AwayTeamDetails.TimesWithBall;

    this.Details.HomeTeamDetails.Possession = Math.round(
      (this.Details.HomeTeamDetails.TimesWithBall / totalPossession) * 100
    );

    this.Details.AwayTeamDetails.Possession = Math.round(
      (this.Details.AwayTeamDetails.TimesWithBall / totalPossession) * 100
    );
  }

  public getMOTM() {
    let allSquads = this.Home.StartingSquad.concat(this.Away.StartingSquad);

    allSquads = allSquads.sort(
      (a, b) => a.GameStats.Points - b.GameStats.Points
    );

    const motm = allSquads[allSquads.length - 1];
    // console.log('MOTM =>', motm); TODO - UNCOMMENT O

    this.Details.MOTM = {
      playerID: motm.PlayerID,
      id: motm._id,
      name: motm.FirstName + ' ' + motm.LastName,
      clubcode: motm.ClubCode,
      points: motm.GameStats.Points,
    };
  }
}

export interface IMatchData {
  attackingSide?: MatchSide;
  activePlayerAS?: IFieldPlayer;
  defendingSide?: MatchSide;
  activePlayerDS?: IFieldPlayer;
}

export interface IMatchEvent {
  type: 'match' | 'shot' | 'miss' | 'save' | 'goal' | 'dribble' | 'tackle';
  message: string;
  time?: string;
  playerID?: string;
  playerTeamID?: string;
  data?: any;
}

export interface IMatchDetails {
  Title: string;
  LeagueName: string;
  Draw: boolean;
  Played: boolean;
  Time: Date;
  FirstHalfScore: string;
  FullTimeScore: string;
  HomeTeamScore: number;
  AwayTeamScore: number;
  Winner: { code: string; id: string } | null;
  Loser: { code: string; id: string } | null;
  MOTM: any;
  TotalPasses: number;
  Goals: number;
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
}

export interface IMatchSideDetails {
  Score: number;
  TimesWithBall: number;
  Possession: number;
  Goals: number;
  TotalShots: number;
  ShotsOnTarget: number;
  ShotsOffTarget: number;
  Fouls: number;
  YellowCards: number;
  RedCards: number;
  Passes: number;
  Events: IMatchEvent[];
  PlayerStats: IPlayerStats[];
  Won: boolean;
  Drew: boolean;
  [key: string]: any;
}

interface IMatchAction {
  type: 'pass' | 'goal';
  playerID: string;
  playerTeam: string;
  timestamp: number;
}
