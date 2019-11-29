import { IFieldPlayer } from '../interfaces/Player';
import { matchEvents } from '../utils/events';
import { Actions } from '../state/ImmutableState/Actions/Actions';
import { IBlock } from './Ball';
import * as playerFunc from '../utils/players';
import * as co from '../utils/coordinates';
import { Match, IMatchData } from './Match';
import { MatchSide } from './MatchSide';

export default class Referee {
  public FirstName: string;
  public LastName: string;
  // public RefID: string;
  public Difficulty: string;
  public Match?: Match;

  constructor(fname: string, lname: string, diff: string, m?: Match) {
    this.FirstName = fname;
    this.LastName = lname;
    this.Difficulty = diff;
    this.Match = m;
  }

  public assignMatch(match: Match) {
    this.Match = match;
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
    //  Get distance from ScoringSide
    const distance = co.calculateDistance(
      foulData.object.Team.ScoringSide,
      where
    );
    if (distance < 2) {
      console.log('<== Penalty Kick ==>');

      // Get an attacker or midfielder to take the PK
      const taker = playerFunc.getRandomATTMID(foulData.object.Team);

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

      const taker = playerFunc.getRandomATTMID(foulData.object.Team);

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
        `${taker.FirstName} ${taker.LastName} [${
          taker.Position
        }] is taking the freekick`
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

      const taker = playerFunc.getRandomATTMID(foulData.object.Team);

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
        `${taker.FirstName} ${taker.LastName} [${
          taker.Position
        }] is taking the freekick`
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
        console.log('Defending Side => ', defendingSide.Name);
        const keeper = playerFunc.getGK(
          defendingSide.StartingSquad
        ) as IFieldPlayer;
        console.log('Keeper => ', keeper);
        keeper.move(
          co.calculateDifference(keeper.StartingPosition, keeper.BlockPosition)
        );
        // Move ball to keeper position
        keeper.Ball.move(
          co.calculateDifference(keeper.BlockPosition, keeper.Ball.Position)
        );
        // console.log('resume gameplay :)')
        // Move players to starting position
        matchEvents.emit('set-playing-sides');
        break;
      case 'miss':
        console.log('missed shot');
        break;
      case 'save':
        console.log('shot saved');
        break;
      default:
        break;
    }
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
  result: string;
  shooter: IFieldPlayer;
  keeper: IFieldPlayer;
  where: IBlock;
  interruption: boolean;
}
