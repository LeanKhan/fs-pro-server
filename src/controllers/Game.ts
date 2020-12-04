/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Match } from '../classes/Match';
import Ball from '../classes/Ball';
import Field, { IBlock } from '../state/ImmutableState/FieldGrid';
import { IFieldPlayer } from '../interfaces/Player';
import { MatchSide } from '../classes/MatchSide';
import Referee from '../classes/Referee';
import { Actions } from '../state/ImmutableState/Actions/Actions';
import { matchEvents, createMatchEvent } from '../utils/events';
import { ClubInterface as IClub } from './clubs/club.model';
import CO from '../utils/coordinates';
import log from '../helpers/logger';

// import log from ''

// import { EventEmitter } from 'events';

// const gameLoop = 90;

// const homePost: IBlock = co.coordinateToBlock({ x: 0, y: 5 });
// const awayPost: IBlock = co.coordinateToBlock({ x: 14, y: 5 });

abstract class GameClass {
  public static instances: number;
}

// tslint:disable-next-line: max-classes-per-file
export default class Game implements GameClass {
  public static instances = 0;
  public homePost: IBlock = CO.co.coordinateToBlock({ x: 0, y: 5 });
  public awayPost: IBlock = CO.co.coordinateToBlock({ x: 14, y: 5 });
  public Referee: Referee;
  public AS?: MatchSide;
  public DS?: MatchSide;
  public ActivePlayerAS?: IFieldPlayer;
  public ActivePlayerDS?: IFieldPlayer;
  private Match: Match;
  private Clubs: IClub[];
  private MatchBall: Ball;
  private PlayingField: IBlock[];
  private MatchActions: Actions;

  constructor(
    clubs: IClub[],
    sides: { home: string; away: string },
    ball: { color: string; cb: IBlock },
    ref: { fname: string; lname: string; level: string },
    centerBlock: any,
    playingField: Field['PlayingField']
  ) {
    // Get the club that is meant to be home
    const homeIndex = clubs.findIndex(
      (club) => club._id?.toString() === sides.home
    );

    log(`home club => ${homeIndex}`);

    // Get the club that is meant to be away
    const awayIndex = clubs.findIndex(
      (club) => club._id!.toString() === sides.away
    );

    this.Match = new Match(
      clubs[homeIndex],
      clubs[awayIndex],
      this.awayPost,
      this.homePost,
      centerBlock
    );
    this.Clubs = clubs;
    // this.homePost = hp;
    // this.awayPost = ap;

    this.MatchBall = new Ball('#ffffff', centerBlock);

    this.PlayingField = playingField;

    // this.Referee = ref;

    // let ball = new Ball('#ffffff', centerBlock);

    this.Referee = new Referee('Anjus', 'Banjus', 'normal', this.MatchBall);

    this.MatchActions = new Actions(this.Referee, [
      this.Match.Home,
      this.Match.Away,
    ]);

    /* ---------- COUNT CLASS INSTANCES ----------- */
    Game.instances++;
  }

  public setMatchBall(ball: Ball) {
    this.MatchBall = ball;
  }

  public refAssignMatch() {
    this.Referee.assignMatch(this.Match);
  }

  public setClubPlayers() {
    this.Match.Home.setPlayers();

    this.Match.Away.setPlayers();
  }

  public setClubFormations(homeFormation: string, awayFormation: string) {
    this.Match.Home.setFormation(
      homeFormation,
      this.MatchBall,
      this.PlayingField
    );

    this.Match.Away.setFormation(
      awayFormation,
      this.MatchBall,
      this.PlayingField
    );
  }

  public getMatch() {
    return this.Match;
  }

  public setPlayingSides() {
    if (
      this.Match.Home.StartingSquad.find((p) => {
        return p.WithBall;
      })
    ) {
      this.AS = this.Match.Home;

      // Set the activePlayer in the attacking team to be the player with
      // the ball
      this.ActivePlayerAS = this.Match.Home.StartingSquad.find((p) => {
        return p.WithBall;
      }) as IFieldPlayer;

      // log(`Active player AS => ${this.ActivePlayerAS.LastName}`);

      this.DS = this.Match.Away;

      // Set the activePlayer in the defending team to be the player closest to
      // the ball
      this.ActivePlayerDS = CO.co.findClosestFieldPlayer(
        this.MatchBall.Position,
        this.DS.StartingSquad
      );
      // log(`Active player DS => ${this.ActivePlayerDS.LastName});

      // return {activePlayerAS, AS, activePlayerDS, DS};
      return {
        activePlayerAS: this.ActivePlayerAS,
        AS: this.AS,
        activePlayerDS: this.ActivePlayerDS,
        DS: this.DS,
      };
    } else if (
      this.Match.Away.StartingSquad.find((p) => {
        return p.WithBall;
      })
    ) {
      this.AS = this.Match.Away;

      // Set the activePlayer in the attacking team to be the player with
      // the ball
      this.ActivePlayerAS = this.Match.Away.StartingSquad.find((p) => {
        return p.WithBall;
      }) as IFieldPlayer;

      // log(`Attacking player AS => ${this.ActivePlayerAS.LastName}`);

      this.DS = this.Match.Home;

      // Set the activePlayer in the defending team to be the player closest to
      // the ball
      this.ActivePlayerDS = CO.co.findClosestFieldPlayer(
        this.MatchBall.Position,
        this.DS.StartingSquad
      );

      // log(`Active player DS => ${this.ActivePlayerDS.LastName});

      return {
        activePlayerAS: this.ActivePlayerAS,
        AS: this.AS,
        activePlayerDS: this.ActivePlayerDS,
        DS: this.DS,
      };
    } else {
      this.AS = undefined;
      // this.ActivePlayerAS = undefined;
      this.DS = undefined;
      // this.ActivePlayerDS = undefined;
      return false;
    }
    // this.MatchActions.setSides(this.ActivePlayerAS, this.AS, this.ActivePlayerDS, this.DS);
  }

  public moveTowardsBall() {
    this.ActivePlayerAS = CO.co.findClosestFieldPlayer(
      this.MatchBall.Position,
      this.Match.Home.StartingSquad
    );

    this.MatchActions.move(
      this.ActivePlayerAS,
      'towards ball',
      this.MatchBall.Position
    );

    this.ActivePlayerDS = CO.co.findClosestFieldPlayer(
      this.MatchBall.Position,
      this.Match.Away.StartingSquad
    );

    this.MatchActions.move(
      this.ActivePlayerDS,
      'towards ball',
      this.MatchBall.Position
    );

    this.matchComments();
  }

  public matchComments() {
    log(
      `Ball is at ${JSON.stringify({
        x: this.MatchBall.Position.x,
        y: this.MatchBall.Position.y,
        key: this.MatchBall.Position.key,
      })}`
    );
    log(`
      ActivePlayerAS is ${this.ActivePlayerAS!.FirstName} ${
      this.ActivePlayerAS!.LastName
    } of [${this.ActivePlayerAS!.ClubCode}] at ${JSON.stringify({
      x: this.ActivePlayerAS!.BlockPosition.x,
      y: this.ActivePlayerAS!.BlockPosition.y,
      key: this.ActivePlayerAS!.BlockPosition.key,
    })}
      ActivePlayerDS is ${this.ActivePlayerDS!.FirstName} ${
      this.ActivePlayerDS?.LastName
    } of [${this.ActivePlayerDS?.ClubCode}] at ${JSON.stringify({
      x: this.ActivePlayerDS!.BlockPosition.x,
      y: this.ActivePlayerDS!.BlockPosition.y,
      key: this.ActivePlayerDS!.BlockPosition.key,
    })}
      `);
  }

  public startHalf() {
    createMatchEvent('Match Kick-Off', 'match');
    log('Half is starting!');
    return this.gamePlay();
  }

  private async gamePlay() {
    await this.gameLoop();
    matchEvents.emit('half-end');
    createMatchEvent('First Half Over', 'match');
    matchEvents.emit('reset-formations');
    log('------------------ Second Half Start ------------------');
    await this.gameLoop(90, 180);
    matchEvents.emit('half-end');
    createMatchEvent('Match Over', 'match');
    log('------------------ Match Over --------------------');
    return this.getMatch();
  }

  private gameLoop(timestart = 0, timeend = 90) {
    // TODO: work on this, use it more and betterly
    return new Promise((resolve, reject) => {
      for (let i = timestart; i < timeend; i++) {
        log(`------------Loop Position ${i + 1}---------`);
        this.setPlayingSides();

        // TODO: do error handling here, so throw any error that may arise from here.
        // thank you Jesus!

        this.Match.setCurrentTime(Math.round((i + 1) / 2));

        if (this.AS === undefined || this.DS === undefined) {
          log('Mvng Towards ball');
          this.moveTowardsBall();
        } else {
          log('-- TAKING ACTION --');
          this.MatchActions.takeAction(
            this.ActivePlayerAS as IFieldPlayer,
            this.AS,
            this.DS,
            this.ActivePlayerDS as IFieldPlayer
          );
          this.setPlayingSides();
          this.Match.recordPossession(this.AS);
        }
      }
      return resolve(true);
    });
  }
}
