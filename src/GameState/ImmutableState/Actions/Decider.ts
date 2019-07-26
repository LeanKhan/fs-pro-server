import { IFieldPlayer } from '../../../interfaces/Player';
import { MatchSide } from '../../../classes/MatchSide';
import * as co from '../../../utils/coordinates';

// Thank you Jesus!

export class Decider {
  public decide(
    player: IFieldPlayer,
    type: string,
    attackingSide: MatchSide,
    defendingSide: MatchSide
  ) {
    let strategy: IStrategy = { type: 'poops', detail: undefined };
    switch (type) {
      case 'attack':
        if (player.WithBall) {
          console.log(
            co.calculateDistance(
              player.BlockPosition,
              attackingSide.ScoringSide
            )
          );
          if (
            co.calculateDistance(
              player.BlockPosition,
              attackingSide.ScoringSide
            ) <= 2
          ) {
            strategy = { type: 'shoot', detail: 'simple' };
          } else if (
            co.calculateDistance(
              player.BlockPosition,
              attackingSide.ScoringSide
            ) > 2 &&
            co.calculateDistance(
              player.BlockPosition,
              attackingSide.ScoringSide
            ) <= 4
          ) {
            strategy = { type: 'shoot', detail: 'long' };
          } else if (
            co.calculateDistance(
              player.BlockPosition,
              attackingSide.ScoringSide
            ) > 4 &&
            co.calculateDistance(
              player.BlockPosition,
              attackingSide.ScoringSide
            ) <= 7
          ) {
            // If player is the closest player to the post, make een dey move
            if (
              co.findClosestPlayer(
                attackingSide.ScoringSide,
                attackingSide.StartingSquad
              ) === player
            ) {
              strategy = { type: 'move', detail: 'normal' };
            } else {
              strategy = { type: 'pass', detail: 'pass to post' };
            }
          } else {
            const chance = Math.round(Math.random() * 100);

            switch (player.Position) {
              case 'MID':
                if (chance < 60) {
                  strategy = { type: 'pass', detail: 'short' };
                } else {
                  strategy = { type: 'move', detail: 'normal' };
                }
                break;
              case 'ATT':
                if (chance < 30) {
                  strategy = { type: 'pass', detail: 'short' };
                } else {
                  strategy = { type: 'move', detail: 'normal' };
                }

              default:
                if (chance < 50) {
                  strategy = { type: 'pass', detail: 'short' };
                } else {
                  strategy = { type: 'move', detail: 'normal' };
                }
                break;
            }
          }
        } else {
          strategy = { type: 'move', detail: 'normal' };
        }
        break;
    }
    return strategy;
  }
}

export interface IStrategy {
  type: string;
  detail?: string;
}
