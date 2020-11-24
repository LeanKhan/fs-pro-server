/* eslint-disable no-case-declarations */
import { IFieldPlayer } from '../interfaces/Player';
import { matchEvents, createMatchEvent } from '../utils/events';
import { Actions } from '../state/ImmutableState/Actions/Actions';
import { IBlock } from '../state/ImmutableState/FieldGrid';
import * as playerFunc from '../utils/players';
import * as co from '../utils/coordinates';
import { Match, IMatchData } from './Match';
import { MatchSide } from './MatchSide';
import { IBall } from './Ball';

export default class Referee {
  public FirstName: string;
  public LastName: string;
  public MatchBall: IBall;
  public Difficulty: string;
  public Match?: Match;
  private Teams?: MatchSide[];

  constructor(
    fname: string,
    lname: string,
    diff: string,
    ball: IBall,
    m?: Match
  ) {
    this.FirstName = fname;
    this.LastName = lname;
    this.Difficulty = diff;
    this.MatchBall = ball;
    this.Match = m;

    matchEvents.on('reset-ball-position', () => {
      this.handleMatchRestart();
    });
  }

  public assignMatch(match: Match) {
    this.Match = match;
    this.Teams = [this.Match.Home, this.Match.Away];
  }

  /**
   * Handle foul
   * @param subject The tackler (the offender)
   * @param object The Offended (the victim) ?
   */
  public foul(subject: IFieldPlayer, object: IFieldPlayer) {
    const chance = Math.round(Math.random() * 12);
    console.log('Referees difficulty => ', chance);
    let level = 0;
    switch (this.Difficulty) {
      case 'tough':
        level = 8;
        break;

      case 'lenient':
        level = 4;
        break;
      case 'normal':
        level = 6;
        break;
    }
    if (chance >= level) {
      matchEvents.emit('game halt', {
        reason: 'yellow card',
        subject,
        object,
        where: subject.BlockPosition,
        interruption: true,
      } as IFoul);
    } else if (chance < level) {
      matchEvents.emit('game halt', {
        reason: 'red card',
        subject,
        object,
        where: subject.BlockPosition,
        interruption: true,
      } as IFoul);
    } else {
      matchEvents.emit('game halt', {
        reason: 'foul',
        subject,
        object,
        where: subject.BlockPosition,
        interruption: true,
      } as IFoul);
    }
  }

  public handleFoul(data: IFoul, matchActions: Actions) {
    switch (data.reason) {
      case 'yellow card':
        console.log('yellow card! [Y]');
        // Get freekick taker
        this.setUpSetPiece(data, data.where);
        break;
      case 'red card':
        console.log('red card! [R]');
        this.setUpSetPiece(data, data.where);
        break;
      case 'foul':
        console.log('foul! [FK]');
        this.setUpSetPiece(data, data.where);
        break;
      default:
        break;
    }
  }

  public setUpSetPiece(foulData: IFoul, where: IBlock) {
    const i = this.Teams!.findIndex(
      (t) => t.ClubCode === foulData.object.ClubCode
    );

    //  Get distance from ScoringSide
    const distance = co.calculateDistance(this.Teams![i].ScoringSide, where);
    if (distance < 2) {
      console.log('<== Penalty Kick ==>');

      // Get an attacker or midfielder to take the PK
      const teamIndex = this.Teams!.findIndex(
        (t) => t.ClubCode === foulData.object.ClubCode
      );
      const taker = playerFunc.getRandomATTMID(this.Teams![teamIndex]);

      // Move involved players away
      // Move tackled
      const b1 = playerFunc.findRandomFreeBlock(foulData.object);

      const p1 = co.findPath(b1, foulData.object.BlockPosition);
      foulData.object.move(p1);

      // Move tackler
      const b2 = playerFunc.findRandomFreeBlock(foulData.subject);

      const p2 = co.findPath(b2, foulData.subject.BlockPosition);
      foulData.object.move(p2);

      // Give him the ball :)
    } else if (distance >= 2 && distance < 5) {
      console.log('<== Set Piece Free Kick! ==>');

      // Move freekick taker to spot
      const teamIndex = this.Teams!.findIndex(
        (t) => t.ClubCode === foulData.object.ClubCode
      );
      const taker = playerFunc.getRandomATTMID(this.Teams![teamIndex]);

      const takerPath = co.calculateDifference(
        foulData.where,
        taker.BlockPosition
      );

      taker.move(takerPath);

      // Move ball to freekick taker's position

      taker.Ball.move(
        co.calculateDifference(taker.BlockPosition, taker.Ball.Position)
      );

      console.log(
        `${taker.FirstName} ${taker.LastName} [${taker.Position}] is taking the freekick`
      );

      // Move involved players away
      // Move tackled
      const b1 = playerFunc.findRandomFreeBlock(foulData.object);

      const p1 = co.findPath(b1, foulData.object.BlockPosition);
      foulData.object.move(p1);

      // Move tackler
      const b2 = playerFunc.findRandomFreeBlock(foulData.subject);

      const p2 = co.findPath(b2, foulData.subject.BlockPosition);
      foulData.subject.move(p2);
    } else {
      console.log('<== Pass Free Kick ==>');

      // Move freekick taker to spot

      const teamIndex = this.Teams!.findIndex(
        (t) => t.ClubCode === foulData.object.ClubCode
      );
      const taker = playerFunc.getRandomATTMID(this.Teams![teamIndex]);

      const takerPath = co.calculateDifference(
        foulData.where,
        taker.BlockPosition
      );

      taker.move(takerPath);

      // Move ball to freekick taker's position

      taker.Ball.move(
        co.calculateDifference(taker.BlockPosition, taker.Ball.Position)
      );

      console.log(
        `${taker.FirstName} ${taker.LastName} [${taker.Position}] is taking the freekick`
      );

      // Move involved players away
      // Move tackled
      const b1 = playerFunc.findRandomFreeBlock(foulData.object);

      const p1 = co.findPath(b1, foulData.object.BlockPosition);
      foulData.object.move(p1);

      // Move tackler
      const b2 = playerFunc.findRandomFreeBlock(foulData.subject);

      const p2 = co.findPath(b2, foulData.subject.BlockPosition);
      foulData.subject.move(p2);
    }
  }

  public handleShot(data: IShot, matchActions: Actions) {
    switch (data.result) {
      case 'goal':
        // Emit goal event
        matchEvents.emit('goal!', data);

        // Keeper to his StartingPosition
        const defendingSide = matchActions.getPlayingSides
          .defendingSide as MatchSide;

        const keeper = playerFunc.getGK(
          defendingSide.StartingSquad
        ) as IFieldPlayer;

        keeper.move(
          co.calculateDifference(keeper.StartingPosition, keeper.BlockPosition)
        );

        // Move ball to keeper position
        keeper.Ball.move(
          co.calculateDifference(keeper.BlockPosition, keeper.Ball.Position)
        );
        // console.log('resume gameplay :)')
        // Move players to starting position

        // Move players to starting position...

        createMatchEvent(
          `${data.shooter.FirstName} ${data.shooter.LastName} [${data.shooter.ClubCode}] scored`,
          'goal',
          data.shooter.PlayerID,
          data.shooter.ClubCode
        );

        matchEvents.emit('reset-formations');

        // matchEvents.emit('set-playing-sides');
        break;
      case 'miss':
        console.log('missed shot');
        // matchEvents.emit('set-playing-sides');
        createMatchEvent(
          `${data.shooter.FirstName} ${data.shooter.LastName} [${data.shooter.ClubCode}] missed a shot`,
          'miss',
          data.shooter.PlayerID,
          data.shooter.ClubCode
        );
        matchEvents.emit('missed-shot', data);
        break;
      case 'save':
        console.log('shot saved');
        createMatchEvent(
          `${data.keeper.FirstName} ${data.keeper.LastName} [${data.keeper.ClubCode}] saved a shot from ${data.shooter.FirstName} ${data.shooter.LastName}`,
          'save',
          data.keeper.PlayerID,
          data.keeper.ClubCode
        );
        matchEvents.emit('saved-shot', data);
        break;
      default:
        break;
    }
  }

  public handleMatchRestart() {
    // move ball to centerBlock
    this.MatchBall.move(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      co.calculateDifference(this.Match!.CenterBlock, this.MatchBall.Position)
    );
  }
}

export interface IReferee {
  FirstName: string;
  LastName: string;
  Difficulty: string;
  assignMatch(match: Match): void;
  foul(subject: IFieldPlayer, object: IFieldPlayer): void;
  handleFoul(data: IFoul, matchActions: Actions): void;
  handleShot(data: IShot, matchActions: Actions): void;
}

/**
 * Reason this
 */
export interface IFoul {
  reason: string;
  subject: IFieldPlayer;
  object: IFieldPlayer;
  where: IBlock;
  interruption: boolean;
}

export interface IShot {
  reason: string;
  result: 'goal' | 'miss' | 'save';
  shooter: IFieldPlayer;
  keeper: IFieldPlayer;
  where: IBlock;
  interruption: boolean;
}

export interface IPass {
  reason?: string;
  intercepted: boolean;
  passer: IFieldPlayer;
  receiver: IFieldPlayer;
  interceptor?: IFieldPlayer | undefined;
}

export interface IDribble {
  dribbler: IFieldPlayer;
  dribbled: IFieldPlayer;
}

export interface ITackle {
  tackler: IFieldPlayer;
  tackled: IFieldPlayer;
  success: boolean;
}

export interface IInterception {
  passer: IFieldPlayer;
  interceptor: IFieldPlayer;
}

export const GamePoints = {
  Pass: 0.25,
  Goal: 1,
  Save: 1,
  Tackle: 0.25,
  Dribble: 0.5,
  Assist: 0.5,
};
