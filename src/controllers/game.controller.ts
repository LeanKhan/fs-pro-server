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
import { fetchClubs } from './clubs/club.service';
import { ClubInterface as IClub } from '../controllers/clubs/club.model';

// import { EventEmitter } from 'events';

// const gameLoop = 90;

export const field = new Field();

import * as co from '../utils/coordinates';

// const homePost: IBlock = co.coordinateToBlock({ x: 0, y: 5 });
// const awayPost: IBlock = co.coordinateToBlock({ x: 14, y: 5 });

abstract class GameClass {
  public static instances: number;
  public static FIELD: Field;
}

// tslint:disable-next-line: max-classes-per-file
export default class Game implements GameClass {
  public static instances = 0;
  public static FIELD: Field = field;
  public homePost: IBlock = co.coordinateToBlock({ x: 0, y: 5 });
  public awayPost: IBlock = co.coordinateToBlock({ x: 14, y: 5 });
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
    // hp: IBlock,
    // ap: IBlock,
    ball: Ball,
    ref: Referee,
    centerBlock: any
  ) {
    // Get the club that is meant to be home
    const homeIndex = clubs.findIndex(
      (club) => club._id?.toString() === sides.home
    );

    console.log('home club =>', homeIndex);

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

    this.MatchBall = ball;

    this.PlayingField = Game.FIELD.PlayingField;

    this.Referee = ref;

    this.MatchActions = new Actions(ref, [this.Match.Home, this.Match.Away]);

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

      // console.log('Actiev player AS =>', this.ActivePlayerAS.LastName);

      this.DS = this.Match.Away;

      // Set the activePlayer in the defending team to be the player closest to
      // the ball
      this.ActivePlayerDS = co.findClosestFieldPlayer(
        this.MatchBall.Position,
        this.DS.StartingSquad
      );
      // console.log('Active player DS =>', this.ActivePlayerDS.LastName);

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

      // console.log('Attacking player AS =>', this.ActivePlayerAS.LastName);

      this.DS = this.Match.Home;

      // Set the activePlayer in the defending team to be the player closest to
      // the ball
      this.ActivePlayerDS = co.findClosestFieldPlayer(
        this.MatchBall.Position,
        this.DS.StartingSquad
      );

      // console.log('Active player DS =>', this.ActivePlayerDS.LastName);

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
    this.ActivePlayerAS = co.findClosestFieldPlayer(
      this.MatchBall.Position,
      this.Match.Home.StartingSquad
    );

    this.MatchActions.move(
      this.ActivePlayerAS,
      'towards ball',
      this.MatchBall.Position
    );

    this.ActivePlayerDS = co.findClosestFieldPlayer(
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
    console.log(
      `Ball is at ${JSON.stringify({
        x: this.MatchBall.Position.x,
        y: this.MatchBall.Position.y,
        key: this.MatchBall.Position.key,
      })}`
    );
    console.log(`
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
    console.log('Half is starting!');
    this.gamePlay();
  }

  private gamePlay() {
    this.gameLoop();
    matchEvents.emit('half-end');
    createMatchEvent('First Half Over', 'match');
    matchEvents.emit('reset-formations');
    console.log('------------------ Second Half Start ------------------');
    this.gameLoop(90, 180);
    matchEvents.emit('half-end');
    createMatchEvent('Match Over', 'match');
    console.log('------------------ Match Over --------------------');
  }

  private gameLoop(timestart = 0, timeend = 90) {
    for (let i = timestart; i < timeend; i++) {
      console.log(`------------Loop Position ${i + 1}---------`);
      this.setPlayingSides();

      this.Match.setCurrentTime(Math.round((i + 1) / 2));

      if (this.AS === undefined || this.DS === undefined) {
        console.log('Mvng Towards ball');
        this.moveTowardsBall();
      } else {
        console.log('-- TAKING ACTION --');
        this.MatchActions.takeAction(
          this.ActivePlayerAS as IFieldPlayer,
          this.AS,
          this.DS,
          this.ActivePlayerDS as IFieldPlayer
        );
        this.setPlayingSides();
        this.Match.recordPossession(this.AS);
      }

      // this.matchComments();
    }
  }
}

let CurrentGame: any;

export const setupGame = async (
  clubs: string[],
  sides: { home: string; away: string }
) => {
  try {
    const teams = await fetchClubs({ _id: { $in: clubs } });

    console.log('Teams => ', teams[0]._id);

    const centerBlock = Game.FIELD.PlayingField[82];

    const ball = new Ball('#ffffff', centerBlock);

    const ref = new Referee('Anjus', 'Banjus', 'normal', ball);

    CurrentGame = new Game(
      teams,
      sides,
      // homePost,
      // awayPost,
      ball,
      ref,
      centerBlock
    );

    CurrentGame.refAssignMatch();

    CurrentGame.setClubPlayers();

    CurrentGame.setClubFormations('HOME-433', 'AWAY-433');

    return CurrentGame;
  } catch (err) {
    console.log('Error setting up game! => ', err);
    throw new Error(err);
  }
};

// export class App {
//   public game: Game;

// }

export const startGame = () => {
  try {
    CurrentGame.startHalf();

    // After here, the game should start!
  } catch (error) {
    console.log('Error starting game!', error);
  }
};

export const endGame = () => {
  try {
    CurrentGame = null;

    // After here, the game should start!
  } catch (error) {
    console.log('Error ending game!', error);
  }
};

// Getting clubs
// getClubs();

function listenForMatchEvents() {
  matchEvents.on('set-playing-sides', () => {
    const playingSides = CurrentGame.setPlayingSides();

    matchEvents.emit('setting-playing-sides', playingSides);
  });
}

// function attackingAction() {
//   MatchActions.takeAction(activePlayerAS, AS, DS, activePlayerDS);
// }

// function defendingAction() {
//   // After every attempt by the AttackingSide the defensive side should move towards the ball
//   MatchActions.move(activePlayerDS, 'towards ball', MatchBall.Position);

//   pushForward(AS);
// }

listenForMatchEvents();

/**
 * TODO:
 *
 * Remove any mention of 'Players' and replace with 'Squad' after testing! - LeanKhan
 */
