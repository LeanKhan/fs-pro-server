import { IFieldPlayer, IPositions, IGameStats } from '../interfaces/Player';
import Player from './Player';
import Ball from './Ball';
import { ICoordinate, IBlock } from '../state/ImmutableState/FieldGrid';
import { coordinateToBlock } from '../utils/coordinates';
import { ballMove } from '../utils/events';
import { MatchSide } from './MatchSide';

export default class FieldPlayer extends Player implements IFieldPlayer {
  public Points: number = 0;
  public Starting: boolean;
  public Substitute: boolean;
  public BlockPosition: IBlock;
  public StartingPosition: ICoordinate | null;
  public BallPosition: ICoordinate;
  public WithBall: boolean;
  public Ball: Ball;
  public Team: MatchSide;
  public GameStats: IGameStats = {
    Goals: 0,
    Saves: 0,
    YellowCards: 0,
    RedCards: 0,
    Assists: 0,
    CleanSheets: 0,
    Points: 0,
  };

  constructor(
    player: any,
    starting: boolean,
    pos: IBlock,
    ball: Ball,
    team: MatchSide
  ) {
    super(player);
    this.Starting = starting;
    this.Ball = ball;
    this.BallPosition = this.Ball.Position;
    this.Substitute = !this.Starting;
    this.StartingPosition = pos;
    this.Team = team;
    this.BlockPosition = pos;
    this.setBlockOccupant(this, this.BlockPosition);
    this.WithBall =
      this.BlockPosition.x === this.BallPosition.x &&
      this.BlockPosition.y === this.BallPosition.y
        ? true
        : false;
    ballMove.on('ball-moved', p => {
      this.updateBallPosition(p);
    });
  }

  public pass(pos: ICoordinate) {
    this.Ball.move(pos);
    this.WithBall = false;
    console.log(`${this.LastName} passed the ball to ${JSON.stringify(pos)}`);
  }

  public shoot(pos: ICoordinate) {
    this.Ball.move(pos);
    this.WithBall = false;
    console.log(`${this.LastName} shot the ball to ${JSON.stringify(pos)}`);
  }

  public updateBallPosition(pos: IBlock) {
    this.Ball.Position = pos;
    this.checkWithBall();
  }

  // TODO: WIP!
  public increaseGoalTally() {
    this.GameStats.Goals = this.GameStats.Goals + 1;
  }

  // TODO: WIP!
  public increasePoints(pnts: number) {
    this.GameStats.Points += pnts;
  }

  public move(pos: ICoordinate): void {
    // First set occupant of current Block to null
    this.setBlockOccupant(null, this.BlockPosition);
    // Then set this players BlockPosition to his current Block coordinates

    const newPos = {
      x: this.BlockPosition.x + pos.x,
      y: this.BlockPosition.y + pos.y,
    };

    this.BlockPosition = coordinateToBlock(newPos);

    // Then set the Block Occupant of current block to this player
    this.setBlockOccupant(this, this.BlockPosition);
    if (this.WithBall) {
      this.Ball.move(pos);
    }
    // console.log(
    //   `${this.FirstName} ${this.LastName} [${
    //     this.ClubCode
    //   }] moved  ${JSON.stringify(pos)} steps.
    //   And is at {x: ${this.BlockPosition.x}, y: ${this.BlockPosition.y}}
    //   `
    // );
    this.checkWithBall();
  }

  public substitute() {
    this.Starting = false;
  }

  public start() {
    this.Starting = true;
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
        : coordinateToBlock({
            x: this.BlockPosition.x,
            y: this.BlockPosition.y - 1,
          });
    around.left =
      this.BlockPosition.x - 1 < 0
        ? undefined
        : coordinateToBlock({
            x: this.BlockPosition.x - 1,
            y: this.BlockPosition.y,
          });
    around.right =
      this.BlockPosition.x + 1 > 11
        ? undefined
        : coordinateToBlock({
            x: this.BlockPosition.x + 1,
            y: this.BlockPosition.y,
          });
    around.bottom =
      this.BlockPosition.y + 1 > 6
        ? undefined
        : coordinateToBlock({
            x: this.BlockPosition.x,
            y: this.BlockPosition.y + 1,
          });

    // console.log(`Players around: `, JSON.stringify(around));
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
              this.BlockPosition.y - 1 < 0
                ? undefined
                : coordinateToBlock({
                    x: this.BlockPosition.x,
                    y: this.BlockPosition.y - 1,
                  });
            blocks.push(block);
          }
          break;

        case 2:
          // Left side
          for (let r = 1; r < radius; r++) {
            const block =
              this.BlockPosition.x - 1 < 0
                ? undefined
                : coordinateToBlock({
                    x: this.BlockPosition.x - 1,
                    y: this.BlockPosition.y,
                  });
            blocks.push(block);
          }
          break;
        case 3:
          // Right side
          for (let r = 1; r < radius; r++) {
            const block =
              this.BlockPosition.x + 1 > 11
                ? undefined
                : coordinateToBlock({
                    x: this.BlockPosition.x + 1,
                    y: this.BlockPosition.y,
                  });
            blocks.push(block);
          }
          break;
        case 4:
          // Bottom side
          for (let r = 1; r < radius; r++) {
            const block =
              this.BlockPosition.y + 1 > 6
                ? undefined
                : coordinateToBlock({
                    x: this.BlockPosition.x,
                    y: this.BlockPosition.y + 1,
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

  private checkWithBall() {
    this.WithBall =
      this.BlockPosition.key === this.Ball.Position.key ? true : false;

    // if (this.WithBall) {
    //   console.log(`${this.LastName} is now with the ball :)`);
    // }
  }
  private setBlockOccupant(who: any, pos: ICoordinate): void {
    coordinateToBlock(pos).occupant = who;
  }
}
