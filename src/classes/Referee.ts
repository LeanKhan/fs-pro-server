import { IFieldPlayer } from '../interfaces/Player';
import { matchEvents } from '../utils/events';
import { Actions } from '../GameState/ImmutableState/Actions/Actions';
import { IBlock } from './Ball';
import * as playerFunc from '../utils/players';
import * as co from '../utils/coordinates';

export default class Referee {
  public FirstName: string;
  public LastName: string;
  // public RefID: string;
  public Difficulty: string;

  constructor(fname: string, lname: string, diff: string) {
    this.FirstName = fname;
    this.LastName = lname;
    this.Difficulty = diff;
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

      // Move involved players away
      // Move tackled
      const b1 = playerFunc.findRandomFreeBlock(foulData.object);

      const p1 = co.findPath(b1, foulData.object.BlockPosition);
      foulData.object.move(p1);

      // Move tackler
      const b2 = playerFunc.findRandomFreeBlock(foulData.subject);

      const p2 = co.findPath(b2, foulData.subject.BlockPosition);
      foulData.object.move(p2);
    } else {
      console.log('<== Pass Free Kick ==>');

      // Move freekick taker to spot

      const taker = playerFunc.getRandomATTMID(foulData.object.Team);

      const takerPath = co.calculateDifference(
        foulData.where,
        taker.BlockPosition
      );

      taker.move(takerPath);

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
}

export interface IReferee {
  FirstName: string;
  LastName: string;
  Difficulty: string;
  foul(subject: IFieldPlayer, object: IFieldPlayer): void;
  handleFoul(data: IFoul, matchActions: Actions): void;
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
