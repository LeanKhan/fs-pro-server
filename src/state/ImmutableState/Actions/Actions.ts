import { IFieldPlayer, IPositions } from '../../../interfaces/Player';
import * as co from '../../../utils/coordinates';
import * as prob from '../../../utils/probability';
import * as playerFunc from '../../../utils/players';
import { MatchSide } from '../../../classes/MatchSide';
import { IBlock, ICoordinate } from '../../ImmutableState/FieldGrid';
import { IBall } from '../../../classes/Ball';
import { matchEvents, createMatchEvent } from '../../../utils/events';
import {
  IReferee,
  IShot,
  IPass,
  IDribble,
  ITackle,
} from '../../../classes/Referee';
import { Decider, IStrategy } from './Decider';
import { IMatchData } from '../../../classes/Match';

export class Actions {
  public referee: IReferee;
  public decider: Decider;
  public interruption: boolean;
  public activePlayerAS: IFieldPlayer | undefined;
  public activePlayerDS: IFieldPlayer | undefined;
  public attackingSide: MatchSide | undefined;
  public defendingSide: MatchSide | undefined;
  public teams: MatchSide[];

  constructor(
    ref: IReferee,
    teams: MatchSide[],
    as?: MatchSide,
    ds?: MatchSide,
    activePlayerAS?: IFieldPlayer,
    activePlayerDS?: IFieldPlayer
  ) {
    this.referee = ref;
    this.interruption = false;
    this.activePlayerAS = activePlayerAS;
    this.activePlayerDS = activePlayerDS;
    this.attackingSide = as;
    this.defendingSide = ds;
    this.teams = teams;

    console.log('Teams => ', this.teams[0].Name);

    this.decider = new Decider(this.teams);

    matchEvents.on('game halt', (data) => {
      this.interruption = true;
    });

    matchEvents.on('shot', (data: IShot) => {
      this.interruption = data.interruption;
      this.referee.handleShot(data, this);
    });

    matchEvents.on('setting-playing-sides', (data: IMatchData) => {
      this.setSides(data);
    });
  }

  get getPlayingSides(): IMatchData {
    const data = {
      activePlayerAS: this.activePlayerAS,
      attackingSide: this.attackingSide,
      activePlayerDS: this.activePlayerDS,
      defendingSide: this.defendingSide,
    } as IMatchData;
    return data as IMatchData;
  }

  // TODO TAKE ACTION FOR ALL PLAYERS!
  // Well... the 'action' taken by the other players is to move forward lol
  // But actually I should consider this.

  public takeAction(
    attackingPlayer: IFieldPlayer,
    attackingSide: MatchSide,
    defendingSide: MatchSide,
    defendingPlayer: IFieldPlayer
  ) {
    // First of all, check what the attacking side should do
    //  then check what the defensive side should do...

    // const option = getOption();

    this.setSides({
      activePlayerAS: attackingPlayer,
      attackingSide,
      activePlayerDS: defendingPlayer,
      defendingSide,
    } as IMatchData);

    let strategy: IStrategy;

    strategy = this.decider.makeDecision(
      attackingPlayer,
      attackingSide,
      defendingSide
    );

    this.interruption = false;

    console.log(
      'Taking Action... \nStrategy is => ',
      strategy.detail,
      ' ',
      strategy.type
    );
    const log = {
      Player: attackingPlayer.FirstName + ' ' + attackingPlayer.LastName,
      Club: attackingSide.ClubCode,
      Position: attackingPlayer.Position,
    };

    console.table(log);

    switch (strategy.type) {
      case 'pass':
        switch (strategy.detail) {
          case 'short':
            this.pass(attackingPlayer, 'short', attackingSide, defendingSide);
            break;

          case 'long':
            this.pass(attackingPlayer, 'long', attackingSide, defendingSide);
            break;
          case 'pass to post':
            this.pass(
              attackingPlayer,
              'pass to post',
              attackingSide,
              defendingSide
            );
            break;

          default:
            break;
        }

        matchEvents.emit('set-playing-sides');
        break;
      case 'shoot':
        console.log('SHOOOOOOT!!!!!');
        this.shoot(attackingPlayer, attackingSide.ScoringSide, 'shot');
        break;

      case 'move':
        console.log('Move attempt');

        this.move(attackingPlayer, 'forward', attackingSide.ScoringSide);

        break;
    }

    // Move attackers and midfielders forward

    if (this.interruption) {
      // handle interruption
      console.log('handling interruption...');
    } else {
      matchEvents.emit('set-playing-sides');
      //  Continue gameplay
      this.continueGamePlay(
        attackingPlayer,
        attackingSide,
        defendingPlayer,
        defendingSide
      );
    }
  }

  public pass(
    player: IFieldPlayer,
    type: string,
    squad: MatchSide,
    defendingSide: MatchSide
  ) {
    // I am only doing this because of an error :!!!!:
    let teammate: IFieldPlayer;

    let situation: ISituation;

    let interceptorDistance = 2;

    // situation = { status: false, reason: 'no where to move' };

    switch (type) {
      case 'short':
        teammate = co.findClosestPlayer(
          player.BlockPosition,
          squad.StartingSquad,
          player
        );
        break;

      case 'long':
        teammate = co.findLongPlayer(
          player.BlockPosition,
          squad.StartingSquad,
          player
        );
        interceptorDistance = 3;
        break;
      // Find the keeper! but keeper may alos be not gien the ball
      case 'pass to post':
        teammate = co.findClosestPlayerByPosition(
          squad.KeepingSide,
          'GK',
          player,
          squad.StartingSquad
        );
        interceptorDistance = 3;
        break;
      default:
        teammate = player;
        break;
    }

    /**
     * Find an opponent closest to the teammate to intercept...
     */
    const interceptor = co.findClosestFieldPlayer(
      teammate.BlockPosition,
      defendingSide.StartingSquad,
      undefined,
      interceptorDistance
    );

    if (!interceptor) {
      // This player can't intercept the ball hohoho, let it pass.
      player.pass(
        co.calculateDifference(teammate.BlockPosition, player.BlockPosition)
      );
      matchEvents.emit('pass-made', {
        passer: player,
        receiver: teammate,
        intercepted: false,
      } as IPass);
    } else {
      // This player is close enough to intercept

      // Actually from now on it is the Decider class that will handle all this success rate...

      // Decider class, handle!
      /**
       * pass the player, the reciever and the nearest interceptor if possible...
       */

      const fail = this.decider.getPassResult(
        player,
        teammate,
        type,
        40,
        interceptor
      );

      if (!fail) {
        player.pass(
          co.calculateDifference(teammate.BlockPosition, player.BlockPosition)
        );
        matchEvents.emit('pass-made', {
          passer: player,
          receiver: teammate,
          intercepted: false,
        } as IPass);
        situation = { status: true, reason: 'Player pass successful' };
      } else {
        player.pass(
          co.calculateDifference(
            interceptor.BlockPosition,
            player.BlockPosition
          )
        );
        matchEvents.emit('pass intercepted', {
          passer: player.LastName,
          interceptor: interceptor.LastName,
        });

        situation = { status: true, reason: 'pass intercepted' };
      }
    }
  }

  /**
   * Move player
   *
   * @param player player that is moving
   * @param type type of movement: 'forwards' , 'towards ball' etc.
   * @param ref where you want to move the player to
   */
  public move(player: IFieldPlayer, type: string, ref: IBlock): ISituation {
    const around = player.checkNextBlocks();

    let situation: ISituation = {
      status: undefined,
      reason: 'no free block around',
    };

    // Check if there's a free block around the player -- if not do something else
    if (playerFunc.findFreeBlock(around) !== undefined) {
      switch (type) {
        case 'towards ball':
          const ball = ref as IBlock;

          // Find the path to the ball
          const path = co.findPath(ball, player.BlockPosition);

          // Make move towards that path
          if (this.makeMove(player, path, around)) {
            // It means move was successful
            situation = {
              status: true,
              reason: 'move towards ball successful',
            };
          } else {
            // means no where to move
            situation = {
              status: true,
              reason: 'no where to move, no interruption',
            };
          }
          break;

        case 'forward':
          const opponentBlock = this.findMarkingOpponent(
            player,
            around
          ) as IFieldPlayer;

          // r being where you want to move the player to
          const r = ref as IBlock;

          // asin x: -1 or y: 1
          const p = co.findPath(r, player.BlockPosition);

          // If there is no marking opponent nearby just move
          // But if there is a marking opponent nearby, the opponent will try to take the ball from
          // the attackingPlayer
          if (opponentBlock === undefined) {
            if (this.makeMove(player, p, around)) {
              situation = { status: true, reason: 'move forward successful' };
            } else {
              situation = {
                status: false,
                reason: 'no where to move, no interruption',
              };
            }
            // If the player is with the ball and there is a bad guy around
          } else if (player.WithBall && opponentBlock !== undefined) {
            const success = this.decider.getDribbleResult(
              player,
              opponentBlock
            );
            if (success) {
              // this.makeMove(player, p, around);
              this.successfulDribble(player, p, around, opponentBlock);
              // this.makeMove(player, p, around);
              situation = {
                status: true,
                reason: 'move successful via dribble',
              };
            } else {
              if (this.tackle(player, opponentBlock)) {
                situation = {
                  status: false,
                  reason: 'tackle successful, possession lost',
                };
              } else {
                this.makeMove(player, p, around);
                situation = {
                  status: true,
                  reason: 'tackle failed, possession kept',
                };
              }
            }
            // If the player is not with the ball even though bad guy around, still move.
          } else {
            if (this.makeMove(player, p, around)) {
              situation = {
                status: true,
                reason: 'move forward successful, tho bad guy',
              };
            } else {
              situation = {
                status: false,
                reason: 'no where to move, tho bad guy',
              };
            }
          }
          break;
      }
    } else {
      // situation = { status: false, reason: 'move towards ball successful' };
    }
    return situation;
  }

  public movePlayersForward(player: IFieldPlayer, team: MatchSide) {
    this.move(player, 'forward', team.ScoringSide);
  }

  /**
   * Continue gameplay...
   * * Push attacking side forward
   * * Move Defending player towards the ball
   * * Defending side pressures the ball
   * @param attackingPlayer
   * @param attackingSide
   * @param defendingPlayer
   * @param defendingSide
   */
  public continueGamePlay(
    attackingPlayer: IFieldPlayer,
    attackingSide: MatchSide,
    defendingPlayer: IFieldPlayer,
    defendingSide: MatchSide
  ) {
    this.pushForward(attackingSide);

    // After every action by the attacking team, the defensive player must move towards the ball
    // and the attacking team must move forward towards opposition lines
    this.move(defendingPlayer, 'towards ball', defendingPlayer.Ball.Position);

    // Another function that makes midfielders and attackers move towards the ball
    this.pressureBall(defendingSide);
  }

  public kick(player: IFieldPlayer, direction: IBlock) {
    player.shoot(co.calculateDifference(direction, player.BlockPosition));
    matchEvents.emit('kick', { subject: player });
  }

  public shoot(player: IFieldPlayer, post: IBlock, reason: string) {
    // matchEvents.emit('shot', { subject: player });

    // Use a reference to the player's team... thank you Jesus!
    const teamIndex = this.teams.findIndex(
      (t) => t.ClubCode === player.ClubCode
    );
    const keeper = this.teams[teamIndex].ScoringSide.occupant;

    const result = this.decider.getShotResult(player, keeper as IFieldPlayer);

    if (result.goal) {
      // Shot is a goal, fine and good
      player.shoot(co.calculateDifference(post, player.BlockPosition));
      matchEvents.emit('shot', {
        shooter: player,
        keeper,
        where: player.BlockPosition,
        interruption: true,
        result: 'goal',
        reason,
      } as IShot);
    } else if (result.onTarget && !result.goal) {
      // Shot is a miss
      player.shoot(co.calculateDifference(post, player.BlockPosition));
      matchEvents.emit('shot', {
        shooter: player,
        keeper,
        where: player.BlockPosition,
        interruption: true,
        result: 'save',
        reason,
      } as IShot);
    } else if (!result.onTarget) {
      // Here put the ball at a random block hehehe
      // find free blocks around the keeper and pick a random one...

      let freeBlocksAroundKeeper = keeper!.getBlocksAround(3);

      // Filter the undefined or occupied ones
      freeBlocksAroundKeeper = freeBlocksAroundKeeper.filter(
        (block: IBlock) => {
          if (block === undefined || block.occupant !== null) {
            return false;
          } else {
            return true;
          }
        }
      );

      // Then return a random one...

      const randomIndex = Math.round(
        Math.random() * (freeBlocksAroundKeeper.length - 1)
      );

      const landingBlock = freeBlocksAroundKeeper[randomIndex];

      player.shoot(co.calculateDifference(landingBlock, player.BlockPosition));

      console.log('Free Blocks around keeper =>', freeBlocksAroundKeeper);

      console.log('landing block', landingBlock);

      // Shot is off target
      matchEvents.emit('shot', {
        shooter: player,
        keeper,
        where: player.BlockPosition,
        interruption: true,
        result: 'miss',
        reason,
      } as IShot);
    }
  }

  public freekick(player: IFieldPlayer, ball: IBall, direction: IBlock) {
    // Move the ball to the player taking the freekick
    ball.move(co.calculateDifference(player.BlockPosition, ball.Position));

    const where = co.calculateDistance(player.BlockPosition, direction);

    if (where <= 3) {
      this.shoot(player, direction, 'freekick');
    } else {
      this.kick(player, direction);
    }
  }

  /**
   * Set Match data
   *
   */

  private setSides(data: IMatchData) {
    const {
      activePlayerAS,
      attackingSide,
      activePlayerDS,
      defendingSide,
    } = data;

    this.activePlayerAS = activePlayerAS;
    this.attackingSide = attackingSide;
    this.activePlayerDS = activePlayerDS;
    this.defendingSide = defendingSide;
  }

  /**
   * Find an opponent block around the player
   * @param player
   * @param around
   */
  private findMarkingOpponent(player: IFieldPlayer, around: IPositions) {
    const arr: IFieldPlayer[] = [];
    for (const key in around) {
      if (around.hasOwnProperty(key) && around[key] !== undefined) {
        const block = around[key] as IBlock;
        const occupant = block.occupant as IFieldPlayer;
        if (occupant == null) {
          // return undefined;
        } else {
          arr.push(occupant);
        }
      }
    }
    return arr.find((p) => {
      return p.ClubCode !== player.ClubCode;
    });
  }

  private makeMove(
    player: IFieldPlayer,
    path: ICoordinate,
    around: IPositions
  ) {
    switch (path.x) {
      case -1:
        const b1 = around.left as IBlock;
        if (b1.occupant == null) {
          player.move(path);
          return true;
        } else {
          const b = playerFunc.findFreeBlock(around) as IBlock;
          if (b === undefined) {
            return false;
          } else {
            const p = co.findPath(b, player.BlockPosition);
            player.move(p);
            return true;
          }
        }

      case 1:
        const b2 = around.right as IBlock;
        if (b2.occupant == null) {
          player.move(path);
          return true;
        } else {
          const b = playerFunc.findFreeBlock(around) as IBlock;
          if (b === undefined) {
            return false;
          } else {
            const p = co.findPath(b, player.BlockPosition);
            player.move(p);
            return true;
          }
        }
    }

    switch (path.y) {
      case -1:
        const b3 = around.top as IBlock;
        if (b3.occupant == null) {
          player.move(path);
          return true;
        } else {
          const b = playerFunc.findFreeBlock(around) as IBlock;
          if (b === undefined) {
            return false;
          } else {
            const p = co.findPath(b, player.BlockPosition);
            player.move(p);
            return true;
          }
        }

      case 1:
        const b4 = around.bottom as IBlock;
        if (b4.occupant == null) {
          player.move(path);
          return true;
        } else {
          const b = playerFunc.findFreeBlock(around) as IBlock;
          if (b === undefined) {
            return false;
          } else {
            const p = co.findPath(b, player.BlockPosition);
            player.move(p);
            return true;
          }
        }
    }
  }

  private successfulDribble(
    player: IFieldPlayer,
    path: ICoordinate,
    around: IPositions,
    dribbled: IFieldPlayer
  ) {
    this.makeMove(player, path, around);
    matchEvents.emit('dribble', {
      dribbler: player,
      dribbled,
    } as IDribble);
    createMatchEvent(
      `${player.FirstName} ${player.LastName} [${player.ClubCode}] 
      dribbled ${dribbled.FirstName} ${dribbled.LastName}`,
      'dribble',
      player.PlayerID,
      player.ClubCode
    );
  }

  private tackle(player: IFieldPlayer, tackler: IFieldPlayer) {
    // console.log(`${tackler.LastName} is tackling ${player.LastName}`);
    const success = this.decider.getTackleResult(tackler, player);

    if (success) {
      // Ball is now in possession of tackler :)
      tackler.Ball.move(
        co.calculateDifference(tackler.BlockPosition, player.BlockPosition)
      );
      matchEvents.emit('tackle', {
        tackler,
        tackled: player,
        success,
      } as ITackle);
      createMatchEvent(
        `${tackler.FirstName} ${tackler.LastName} [${tackler.ClubCode}] 
        tackled the ball from ${player.FirstName} ${player.LastName}`,
        'tackle',
        tackler.PlayerID,
        tackler.ClubCode
      );
      return true;
    } else {
      matchEvents.emit('tackle', {
        tackler,
        tackled: player,
        success,
      } as ITackle);
      return false;
    }
  }

  private markBall(player: IFieldPlayer) {
    this.move(player, 'towards ball', player.Ball.Position);
  }

  private pushForward(team: MatchSide) {
    // const chance = Math.round(Math.random() * 100);
    console.log('*-- Attacking Side pushing forward --*');

    const attackingPlayers = playerFunc.getATTMID(team);

    attackingPlayers.forEach((p) => {
      this.movePlayersForward(p, team);
    });
  }

  private pressureBall(team: MatchSide) {
    console.log('*-- Defending Side pressuring ball --*');

    // Find midfielders and attackers
    const defendingPlayers = playerFunc.getATTMID(team);

    defendingPlayers.forEach((p) => {
      this.markBall(p);
    });
  }
}

interface ISituation {
  status?: boolean;
  reason: string;
}
