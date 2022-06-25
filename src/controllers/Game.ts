/* eslint-disable @typescript-eslint/no-non-null-assertion */
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

abstract class GameClass {
  public static instances: number;
}

// tslint:disable-next-line: max-classes-per-file
export default class Game implements GameClass {
  public static instances = 0;
  public homePost: IBlock;
  public awayPost: IBlock;
  public Referee: Referee;
  public AS?: MatchSide;
  public DS?: MatchSide;
  public ActivePlayerAS?: IFieldPlayer;
  public ActivePlayerDS?: IFieldPlayer;
  public Match: Match;
  public MatchBall: Ball;
  public MatchSettings: any;
  public Co: Coordinates;
  private Clubs: IClub[];
  private PlayingField: IBlock[];
  private MatchActions: Actions;

  constructor(
    clubs: IClub[],
    sides: { home: string; away: string },
    ball: { color: string; cb: IBlock },
    ref: { fname: string; lname: string; level: string },
    centerBlock: any,
    playingField: Field['PlayingField'],
    Co: Coordinates
  ) {

    this.Co = Co;

    this.homePost = this.Co.coordinateToBlock({ x: 0, y: 5 });
    this.awayPost = this.Co.coordinateToBlock({ x: 14, y: 5 })

    // save match config and all
    this.MatchSettings = {};

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

    this.MatchBall = new Ball('#ffffff', centerBlock, this.Match.id);

    this.PlayingField = playingField;

    // this.Referee = ref;

    // let ball = new Ball('#ffffff', centerBlock);

    this.Referee = new Referee('Anjus', 'Banjus', 'normal', this.MatchBall, this.Match);

    this.MatchActions = new Actions(this.Referee, [
      this.Match.Home,
      this.Match.Away,
    ],
    this.Match
    );

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

  /** Initial Club Formations */
  public setClubFormations(homeFormation: string, awayFormation: string) {

    this.MatchSettings.homeFormation = homeFormation;
    this.MatchSettings.awayFormation = awayFormation;

    this.Match.Home.setFormation(
      this.MatchSettings.homeFormation,
      this.MatchBall,
      this.PlayingField
    );

    this.Match.Away.setFormation(
      this.MatchSettings.awayFormation,
      this.MatchBall,
      this.PlayingField
    );
  }

  /** Swap Club Formations at half time... */
  public swapClubFormations() {
    // copy value
    let awayF = this.MatchSettings.awayFormation;
    let homeF = this.MatchSettings.homeFormation;

    this.MatchSettings.homeFormation = awayF;
    this.MatchSettings.awayFormation = homeF;

    this.Match.Home.changeFormation(
      this.MatchSettings.homeFormation,
      this.PlayingField,
      // new scoring side
      this.homePost,
      // new keeping side
      this.awayPost
    );

    this.Match.Away.changeFormation(
      this.MatchSettings.awayFormation,
      this.PlayingField,
      // new scoring side
      this.awayPost,
      // new keeping side
      this.homePost
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
      this.ActivePlayerDS = this.Co.findClosestFieldPlayer(
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
      this.ActivePlayerDS = this.Co.findClosestFieldPlayer(
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
    this.ActivePlayerAS = this.Co.findClosestFieldPlayer(
      this.MatchBall.Position,
      this.Match.Home.StartingSquad
    );

    this.MatchActions.move(
      this.ActivePlayerAS,
      'towards ball',
      this.MatchBall.Position
    );

    this.ActivePlayerDS = this.Co.findClosestFieldPlayer(
      this.MatchBall.Position,
      this.Match.Away.StartingSquad
    );

    this.MatchActions.move(
      this.ActivePlayerDS,
      'towards ball',
      this.MatchBall.Position
    );

    // this.matchComments();
  }

  public matchComments() {
    const _log = console.log;

    if(!this.ActivePlayerDS || !this.ActivePlayerAS){
      return _log('NO ACTIVE PLAYERS');
    }

    // _log(
    //   `Ball is at ${JSON.stringify({
    //     x: this.MatchBall.Position.x,
    //     y: this.MatchBall.Position.y,
    //     key: this.MatchBall.Position.key,
    //   })}`
    // );
    // _log(`
    //   ActivePlayerAS is ${this.ActivePlayerAS!.FirstName} ${
    //   this.ActivePlayerAS!.LastName
    // } of [${this.ActivePlayerAS!.ClubCode}] at ${JSON.stringify({
    //   x: this.ActivePlayerAS!.BlockPosition.x,
    //   y: this.ActivePlayerAS!.BlockPosition.y,
    //   key: this.ActivePlayerAS!.BlockPosition.key,
    // })}
    //   ActivePlayerDS is ${this.ActivePlayerDS!.FirstName} ${
    //   this.ActivePlayerDS?.LastName
    // } of [${this.ActivePlayerDS?.ClubCode}] at ${JSON.stringify({
    //   x: this.ActivePlayerDS!.BlockPosition.x,
    //   y: this.ActivePlayerDS!.BlockPosition.y,
    //   key: this.ActivePlayerDS!.BlockPosition.key,
    // })}
    //   `);
  }

  public startHalf() {
    createMatchEvent(this.Match.id, 'Match Kick-Off', 'match');
    log('Half is starting!');
    return this.gamePlay();
  }

  private async gamePlay() {
    // Anything you want to do to change the game, do it before 'gameLoop' is called :)
    // thank you Jesus!
    await this.gameLoop();
    matchEvents.emit(`${this.Match.id}-half-end`);
    createMatchEvent(this.Match.id, 'First Half Over', 'match');
    log('------------------ Second Half Start ------------------');
    this.swapClubFormations();
    matchEvents.emit(`${this.Match.id}-reset-formations`);
    await this.gameLoop(90, 180);
    matchEvents.emit(`${this.Match.id}-half-end`);
    createMatchEvent(this.Match.id, 'Match Over', 'match');
    log('------------------ Match Over --------------------');
    return this.getMatch();
  }

  private gameLoop(timestart = 0, timeend = 90) {
    // TODO: work on this, use it more and betterly
    this.matchComments();
    return new Promise((resolve, reject) => {
      for (let i = timestart; i < timeend; i++) {
        // console.log(`------------Loop Position ${i + 1}---------`);
        const playingSides = this.setPlayingSides();

         // matchEvents.emit(`${this.Match.id}-setting-playing-sides`, playingSides);

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
          const playingSides = this.setPlayingSides();
          // matchEvents.emit(`${this.Match.id}-setting-playing-sides`, playingSides);
          this.Match.recordPossession(this.AS);
        }

        this.matchComments();
      }
      return resolve(true);
    });
  }
}
