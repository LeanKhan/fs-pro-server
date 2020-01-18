import { Match, IMatchEvent } from '../classes/Match';
// import ClubModel, { IClubModel } from '../models/club.model';
import Ball, { IBall } from '../classes/Ball';
import Field, { IBlock } from '../state/ImmutableState/FieldGrid';
import * as co from '../utils/coordinates';
import { IFieldPlayer } from '../interfaces/Player';
import { MatchSide } from '../classes/MatchSide';
import Referee, { IReferee } from '../classes/Referee';
import { Actions } from '../state/ImmutableState/Actions/Actions';
import { matchEvents, createMatchEvent } from '../utils/events';
import { fetchClubs } from '../services/club.service';
import { IClub } from '../interfaces/Club';
// import { EventEmitter } from 'events';

// let Clubs: IClubModel[] = [];

// let match: Match;

export const GameField = new Field();
export const PlayingField = GameField.PlayingField;

export const mapWidth = GameField.mapWidth;

const centerBlock = PlayingField[82];

// const gameLoop = 90;

const homePost: IBlock = co.coordinateToBlock({ x: 0, y: 5 });
const awayPost: IBlock = co.coordinateToBlock({ x: 14, y: 5 });

class Game {
  public homePost: IBlock;
  public awayPost: IBlock;
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
    hp: IBlock,
    ap: IBlock,
    field: IBlock[],
    ball: Ball,
    ref: Referee
  ) {
    this.Match = new Match(clubs[0], clubs[1], ap, hp, centerBlock);
    this.Clubs = clubs;
    this.homePost = hp;
    this.awayPost = ap;

    this.MatchBall = ball;

    this.PlayingField = field;

    this.Referee = ref;

    this.MatchActions = new Actions(ref);

    /* ---------- LISTEN TO MATCH EVENTS ----------- */
  }

  public setMatchBall(ball: Ball) {
    this.MatchBall = ball;
  }

  public refAssignMatch() {
    this.Referee.assignMatch(this.Match);
  }

  public setClubFormations(homeFormation: string, awayFormation: string) {
    this.Match.Home.setFormation(
      homeFormation,
      this.MatchBall as Ball,
      this.PlayingField
    );

    this.Match.Away.setFormation(
      awayFormation,
      this.MatchBall as Ball,
      this.PlayingField
    );
  }

  public setPlayingSides() {
    if (
      this.Match.Home.StartingSquad.find(p => {
        return p.WithBall;
      })
    ) {
      this.AS = this.Match.Home as MatchSide;

      // Set the activePlayer in the attacking team to be the player with
      // the ball
      this.ActivePlayerAS = this.Match.Home.StartingSquad.find(p => {
        return p.WithBall;
      }) as IFieldPlayer;

      // console.log('Actiev player AS =>', this.ActivePlayerAS.LastName);

      this.DS = this.Match.Away as MatchSide;

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
      this.Match.Away.StartingSquad.find(p => {
        return p.WithBall;
      })
    ) {
      this.AS = this.Match.Away as MatchSide;

      // Set the activePlayer in the attacking team to be the player with
      // the ball
      this.ActivePlayerAS = this.Match.Away.StartingSquad.find(p => {
        return p.WithBall;
      }) as IFieldPlayer;

      // console.log('Attacking player AS =>', this.ActivePlayerAS.LastName);

      this.DS = this.Match.Home as MatchSide;

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

    // this.matchComments();
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
      this.ActivePlayerDS!.LastName
    } of [${this.ActivePlayerDS!.ClubCode}] at ${JSON.stringify({
      x: this.ActivePlayerDS!.BlockPosition.x,
      y: this.ActivePlayerDS!.BlockPosition.y,
      key: this.ActivePlayerDS!.BlockPosition.key,
    })}
      `);
  }

  public startHalf() {
    createMatchEvent('Match Kick-Off', 'match');
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

  private gameLoop(timestart: number = 0, timeend: number = 90) {
    for (let i = timestart; i < timeend; i++) {
      console.log(`------------Loop Position ${i + 1}---------`);
      this.setPlayingSides();

      this.Match.setCurrentTime(Math.round((i + 1) / 2));

      if (this.AS === undefined || this.DS === undefined) {
        this.moveTowardsBall();
      } else {
        this.MatchActions.takeAction(
          this.ActivePlayerAS as IFieldPlayer,
          this.AS,
          this.DS,
          this.ActivePlayerDS as IFieldPlayer
        );
        this.setPlayingSides();
        this.Match.recordPossession(this.AS);
      }

      this.matchComments();
    }
  }
}

let CurrentGame: Game;

const getClubs = async () => {
  try {
    const { result } = await fetchClubs({ ClubCode: { $in: ['IB', 'RP'] } });

    const ball = new Ball('#ffffff', centerBlock);

    const ref = new Referee('Anjus', 'Banjus', 'normal', ball);

    CurrentGame = new Game(result, homePost, awayPost, PlayingField, ball, ref);

    CurrentGame.setClubFormations('HOME-433', 'AWAY-433');

    CurrentGame.refAssignMatch();

    CurrentGame.startHalf();

    // After here, the game should start!
  } catch (error) {
    console.log('Errro!', error);
  }
};

// Getting clubs
getClubs();

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
