import {
  IFieldPlayer,
  IPositions,
  PlayerInterface,
} from '../interfaces/Player';
import Player from './Player';
import Ball from './Ball';
import { ICoordinate, IBlock } from '../state/ImmutableState/FieldGrid';
import CO from '../utils/coordinates';
import { ballMove } from '../utils/events';
import log from '../helpers/logger';

abstract class FieldPlayerClass {
  public static instances: number;
}

// tslint:disable-next-line: max-classes-per-file
export default class FieldPlayer
  extends Player
  implements IFieldPlayer, FieldPlayerClass {
  public static instances = 0;
  public Points = 0;
  public Substitute: boolean;
  public BlockPosition: IBlock;
  public BallPosition: ICoordinate;
  public WithBall: boolean;
  public Ball: Ball;
  private StartingPosition: IBlock;
  // public Team: MatchSide;

  /**
   *
   * @param {PlayerInterface} player The player guy
   * @param {boolean} starting Is the player starting?
   * @param {IBlock} pos starting position
   * @param {IBall} ball the match ball
   * @param {MatchSide} team player's team
   */
  constructor(
    player: PlayerInterface,
    starting: boolean,
    pos: IBlock,
    ball: Ball
    // team: MatchSide
  ) {
    super(player);
    this.Ball = ball;
    this.BallPosition = this.Ball.Position;
    this.isStarting = starting;
    this.Substitute = !this.isStarting;
    this.StartingPosition = pos;
    // this.Team = team;

    this.BlockPosition = pos;
    this.setBlockOccupant(this, this.BlockPosition);
    this.WithBall =
      this.BlockPosition.x === this.BallPosition.x &&
      this.BlockPosition.y === this.BallPosition.y
        ? true
        : false;

    // make this event unique!
    ballMove.on(`${this.Ball.id}-ball-moved`, (p) => {
      this.updateBallPosition(p);
    });

    FieldPlayer.instances++;
  }

  public pass(pos: ICoordinate) {
    this.Ball.move(pos);
    this.WithBall = false;
    log(`${this.LastName} passed the ball to ${JSON.stringify(pos)}`);
  }

  public shoot(pos: ICoordinate) {
    this.Ball.move(pos);
    this.WithBall = false;
    log(`${this.LastName} shot the ball to ${JSON.stringify(pos)}`);
  }

  public updateBallPosition(pos: IBlock) {
    // log(`New Position x,y,key => ${pos.x}, ${pos.y}, ${pos.key}`);
    // this.Ball.Position = pos;
    this.BallPosition = pos;
    // UPDATE: The ball updates it's position by itself :)
    this.checkWithBall();
  }

  public increaseGoalTally() {
    this.GameStats.Goals = this.GameStats.Goals + 1;
  }

  public increasePoints(pnts: number) {
    this.GameStats.Points += pnts;
    if (this.GameStats.Points > 10) {
      this.GameStats.Points = 10;
    }
  }

  public move(pos: ICoordinate): void {
    // First set occupant of current Block to null
    this.setBlockOccupant(null, this.BlockPosition);
    // Then set this players BlockPosition to his current Block coordinates

    const newPos = {
      x: this.BlockPosition.x + pos.x,
      y: this.BlockPosition.y + pos.y,
    };

    this.BlockPosition = CO.co.coordinateToBlock(newPos);

    // Then set the Block Occupant of current block to this player
    this.setBlockOccupant(this, this.BlockPosition);
    if (this.WithBall) {
      this.Ball.move(pos);
    }
    log(
      `${this.FirstName} ${this.LastName} [${
        this.ClubCode
      }] moved  ${JSON.stringify(pos)} steps.
      And is at {x: ${this.BlockPosition.x}, y: ${this.BlockPosition.y}}
      `
    );
    this.checkWithBall();
  }

  public substitute() {
    this.isSubstituted = false;
  }

  public start() {
    this.isStarting = true;
  }

  public changeStartingPosition(block: IBlock){
    this.StartingPosition = block;
  }

  /**
   *
   * Get first blocks around the player
   * Circumference: 1
   */
  public checkNextBlocks() {
    const around: IPositions = {
      top: undefined,
      left: undefined,
      right: undefined,
      bottom: undefined,
    };
    around.top =
      this.BlockPosition.y - 1 < 0
        ? undefined
        : CO.co.coordinateToBlock({
            x: this.BlockPosition.x,
            y: this.BlockPosition.y - 1,
          });
    around.left =
      this.BlockPosition.x - 1 < 0
        ? undefined
        : CO.co.coordinateToBlock({
            x: this.BlockPosition.x - 1,
            y: this.BlockPosition.y,
          });
    around.right =
      this.BlockPosition.x + 1 > 14
        ? undefined
        : CO.co.coordinateToBlock({
            x: this.BlockPosition.x + 1,
            y: this.BlockPosition.y,
          });
    around.bottom =
      this.BlockPosition.y + 1 > 10
        ? undefined
        : CO.co.coordinateToBlock({
            x: this.BlockPosition.x,
            y: this.BlockPosition.y + 1,
          });

    // log(`Players around: `, JSON.stringify(around));
    return around;
  }

  /**
   * Get the blocks around a player by radius
   * @param radius how many block around?
   */
  public getBlocksAround(radius: number): any[] {
    // Get the blocks around for each side.
    const blocks: any[] = [];
    for (let side = 1; side <= 4; side++) {
      // const block = this.BlockPosition.y - 1 < 0 ? undefined : coordinateToBlock({
      //   x: this.BlockPosition.x,
      //   y: this.BlockPosition.y - 1,
      // });
      switch (side) {
        case 1:
          // Top side
          for (let r = 1; r <= radius; r++) {
            const block =
              this.BlockPosition.y - r < 0
                ? undefined
                : CO.co.coordinateToBlock({
                    x: this.BlockPosition.x,
                    y: this.BlockPosition.y - r,
                  });
            blocks.push(block);
          }
          break;

        case 2:
          // Left side
          for (let r = 1; r <= radius; r++) {
            const block =
              this.BlockPosition.x - r < 0
                ? undefined
                : CO.co.coordinateToBlock({
                    x: this.BlockPosition.x - r,
                    y: this.BlockPosition.y,
                  });
            blocks.push(block);
          }
          break;
        case 3:
          // Right side
          for (let r = 1; r <= radius; r++) {
            const block =
              this.BlockPosition.x + r > 14
                ? undefined
                : CO.co.coordinateToBlock({
                    x: this.BlockPosition.x + r,
                    y: this.BlockPosition.y,
                  });
            blocks.push(block);
          }
          break;
        case 4:
          // Bottom side
          for (let r = 1; r <= radius; r++) {
            const block =
              this.BlockPosition.y + r > 10
                ? undefined
                : CO.co.coordinateToBlock({
                    x: this.BlockPosition.x,
                    y: this.BlockPosition.y + r,
                  });
            blocks.push(block);
          }
          break;

        default:
          break;
      }
    }
    return blocks;
  }

  /**
   *
   * @param pos new block position
   */
  public changePosition(pos: IBlock) {
    // Empty old block position
    this.setBlockOccupant(null, this.BlockPosition);

    // Change player's BlockPosition to initial position
    this.BlockPosition = pos;

    // Move to new position
    this.setBlockOccupant(this, pos);
  }

  private checkWithBall() {
    this.WithBall =
      this.BlockPosition.key === this.Ball.Position.key ? true : false;

    // if (this.WithBall) {
    //   log(`${this.LastName} is now with the ball :)`);
    // }
  }
  private setBlockOccupant(who: any, pos: ICoordinate): void {
    CO.co.coordinateToBlock(pos).occupant = who;
  }
}
