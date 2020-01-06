import { Match } from '../classes/Match';
// import ClubModel, { IClubModel } from '../models/club.model';
import Ball, { IBlock, IBall } from '../classes/Ball';
import { PlayingField } from '../state/ImmutableState/FieldGrid';
import * as co from '../utils/coordinates';
import { IFieldPlayer } from '../interfaces/Player';
import { MatchSide } from '../classes/MatchSide';
import Referee, { IReferee } from '../classes/Referee';
import { Actions } from '../state/ImmutableState/Actions/Actions';
import { matchEvents } from '../utils/events';
import { fetchClubs } from '../services/club.service';
import { IClub } from '../interfaces/Club';
// import { EventEmitter } from 'events';

// let Clubs: IClubModel[] = [];

// let match: Match;

const centerBlock = PlayingField[42];

// const gameLoop = 90;

const homePost: IBlock = co.coordinateToBlock({ x: 11, y: 3 });
const awayPost: IBlock = co.coordinateToBlock({ x: 0, y: 3 });

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
    this.Match = new Match(clubs[0], clubs[1], ap, hp);
    this.Clubs = clubs;
    this.homePost = hp;
    this.awayPost = ap;

    this.MatchBall = ball;

    this.PlayingField = field;

    this.Referee = ref;

    this.MatchActions = new Actions(ref);

    console.log('Game created');
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

      console.log('Attacking player AS =>', this.ActivePlayerAS.LastName);

      this.DS = this.Match.Away as MatchSide;

      // Set the activePlayer in the defending team to be the player closest to
      // the ball
      this.ActivePlayerDS = co.findClosestFieldPlayer(
        this.MatchBall.Position,
        this.DS.StartingSquad
      );

      console.log('Attacking player DS =>', this.ActivePlayerDS.LastName);

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

      console.log('Attacking player AS =>', this.ActivePlayerAS.LastName);

      this.DS = this.Match.Home as MatchSide;

      // Set the activePlayer in the defending team to be the player closest to
      // the ball
      this.ActivePlayerDS = co.findClosestFieldPlayer(
        this.MatchBall.Position,
        this.DS.StartingSquad
      );

      console.log('Attacking player DS =>', this.ActivePlayerAS.LastName);

      return {
        activePlayerAS: this.ActivePlayerAS,
        AS: this.AS,
        activePlayerDS: this.ActivePlayerDS,
        DS: this.DS,
      };
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
    console.log(`Ball is at ${JSON.stringify({
      x: this.MatchBall.Position.x,
      y: this.MatchBall.Position.y,
      key: this.MatchBall.Position.key,
    })}
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
    // console.table(this.Match.Home.StartingSquad[0].Attributes);
    this.gamePlay();
  }

  private gamePlay() {
    for (let i = 0; i < 12; i++) {
      console.log(`------------Loop Position ${i + 1}---------`);
      this.setPlayingSides();

      this.Match.setCurrentTime(i);

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

    const ref = new Referee('Anjus', 'Banjus', 'normal');

    CurrentGame = new Game(result, homePost, awayPost, PlayingField, ball, ref);

    CurrentGame.setClubFormations('HOME-433', 'AWAY-433');

    CurrentGame.refAssignMatch();

    CurrentGame.startHalf();

    // After here, the game should start!
  } catch (error) {
    console.log('EErrro!', error);
  }
};

// Getting clubs
console.log('-------- getting clubs --------');
getClubs();

function listenForMatchEvents() {
  matchEvents.on('set-playing-sides', () => {
    console.log('*---- setting playing sides ----*');

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

// setTimeout(() => {
//   console.log('Match Starting...');

//   startMatch();
// }, 5000);

// match.start();
// console.log('From db', clubs);
// console.log('From class', Clubs);

/**
 * TODO:
 *
 * Remove any mention of 'Players' and replace with 'Squad' after testing! - LeanKhan
 */
