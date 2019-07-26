import { IFieldPlayer, IPositions } from '../../../interfaces/Player';
import * as co from '../../../utils/coordinates';
import * as prob from '../../../utils/probability';
import * as playerFunc from '../../../utils/players';
import { MatchSide } from '../../../classes/MatchSide';
import { IBlock, ICoordinate, IBall } from '../../../classes/Ball';
import { matchEvents } from '../../../utils/events';
import { IReferee } from '../../../classes/Referee';
import {Decider, IStrategy} from './Decider';

export class Actions {
  public referee: IReferee;
  public decider: Decider;

  constructor(ref: IReferee) {
    this.referee = ref;
    this.decider = new Decider();
  }

  public takeAction(
    attackingPlayer: IFieldPlayer,
    attackingSide: MatchSide,
    defendingSide: MatchSide,
    defendingPlayer: IFieldPlayer
  ) {
    // First of all, check what the attacking side should do
    //  then check what the defensive side should do...

    // const option = getOption();

    const strategy: IStrategy = this.decider.decide(attackingPlayer, 'attack', attackingSide, defendingSide);

    console.log('Strategy is => ', strategy.type)

    switch (strategy.type) {
      case 'pass':
        switch (strategy.detail) {
          
          case 'short':
              console.log('Pass attempt');

              this.pass(attackingPlayer, 'short', attackingSide, defendingSide);
            break;
          
          case 'long':
              this.pass(attackingPlayer, 'long', attackingSide, defendingSide);
            break;

          case 'pass to post':
              this.pass(attackingPlayer, 'pass to post', attackingSide, defendingSide);
            break;
        
          default:
            break;
        }


        matchEvents.emit('set-playing-sides');
        break;
      case 'shoot':
        console.log('SHOOOOOOT!!!!!')
      break;

      case 'move':
        console.log('Move attempt');

        const response = this.move(
          attackingPlayer,
          'forward',
          attackingSide.ScoringSide
        );

        console.log(response);

        matchEvents.emit('set-playing-sides');

        // this.pass(attackingPlayer, attackingSide, defendingSide);

        break;
    }

    // Move attackers and midfielders forward

    this.pushForward(attackingSide);
    
    // After every action by the attacking team, the defensive player must move towards the ball
    // and the attacking team must move forward towards opposition lines
    this.move(defendingPlayer, 'towards ball', defendingPlayer.Ball.Position);

        // Another function that makes midfielders and attackers move towards the ball
    this.pressureBall(defendingSide);

  }

  // public flipCoin() {
  //   return Math.ceil(Math.random() * 2);
  // }

  public pass(
    player: IFieldPlayer,
    type: string,
    squad: MatchSide,
    defendingSide: MatchSide
  ) {

    // I am only doing this because of an error :!!!!:
    let teammate: IFieldPlayer = player;

    switch (type) {
      case 'short':
          teammate = co.findClosestPlayer(
            player.BlockPosition,
            squad.StartingSquad,
          );
        break;
      
      case 'long':
          teammate = co.findClosestPlayer(
            player.BlockPosition,
            squad.StartingSquad,
          );
        break;
    
      case 'pass to post':
          teammate = co.findClosestPlayer(
            squad.ScoringSide,
            squad.StartingSquad,
          );
        break;
    }

    /**
     * Find a teammate to pass to
     * 
     * 
     */

    console.log(
      `Closest Teammate => ${teammate.LastName} for [${
        teammate.ClubCode
      }] at {x: ${teammate.BlockPosition.x}, y: ${teammate.BlockPosition.y}}`
    );

    /**
     * Find an opponent closest to the teammate to intercept...
     */
    const interceptor = co.findClosestPlayer(
      teammate.BlockPosition,
      defendingSide.StartingSquad,
    );

    console.log(
      `Potential Interceptor => ${interceptor.LastName} for [${
        interceptor.ClubCode
      }] at {x: ${interceptor.BlockPosition.x}, y: ${
        interceptor.BlockPosition.y
      }}`
    );

    if(co.calculateDistance(teammate.BlockPosition,interceptor.BlockPosition) > 2){
      // This player can't intercept the ball hohoho, let it pass.
      player.pass(
        co.calculateDifference(teammate.BlockPosition, player.BlockPosition)
      );
      matchEvents.emit('pass made', {
        passer: player.LastName,
        reciever: teammate.LastName,
      });
    } else {
      // This player is close enough to intercept

      const chance = Math.round(Math.random() * 100);
    if (chance < 70) {
      player.pass(
        co.calculateDifference(teammate.BlockPosition, player.BlockPosition)
      );
      matchEvents.emit('pass made', {
        passer: player.LastName,
        reciever: teammate.LastName,
      });
    } else {
      player.pass(
        co.calculateDifference(interceptor.BlockPosition, player.BlockPosition)
      );
      matchEvents.emit('pass intercepted', {
        passer: player.LastName,
        interceptor: interceptor.LastName,
      });
    }
    }

    /**
     * If the players AttackingClass beats the interceptors DefensiveClass
     * then allow the pass to go through. Else, pass to the interceptor hehe
     */
    
  }

  /**
   * Move player
   *
   * @param player player that is moving
   * @param type type of movement: 'forwards' , 'towards ball' etc.
   * @param ref where you want to move the player to
   */
  public move(player: IFieldPlayer, type: string, ref: IBlock): ISituation {

    console.log('Moving... Player form Actions')

    const around = player.checkNextBlocks();

    let situation: ISituation = {
      status: undefined,
      reason: 'no free block around',
    };

    // Check if there's a free block around the player -- if not do something else
    if (this.findFreeBlock(around) !== undefined) {
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
            situation = { status: false, reason: 'no where to move' };
          }
          break;

        case 'forward':
          const opponentBlock = this.findMarkingOpponent(
            player,
            around
          ) as IFieldPlayer;

          // console.log('Around the player => ', around);

          // r being where you want to move the player to
          const r = ref as IBlock;

          // console.log(`Opponent block => ${opponentBlock.LastName} [${opponentBlock.ClubCode}]`);

          // asin x: -1 or y: 1
          const p = co.findPath(r, player.BlockPosition);

          // If there is no marking opponent nearby just move
          // But if there is a marking opponent nearby, the opponent will try to take the ball from
          // the attackingPlayer
          if (opponentBlock === undefined) {
            // console.log('opponent block is undefined')
            if (this.makeMove(player, p, around)) {
              situation = { status: true, reason: 'move forward successful' };
            } else {
              situation = { status: false, reason: 'no where to move' };
            }
            // If the player is with the ball and there is a bad guy around
          } else if (player.WithBall && opponentBlock !== undefined) {
            if (
              prob.compareValues(
                player.AttackingClass,
                opponentBlock.DefensiveClass
              )
            ) {
              // this.makeMove(player, p, around);
              if (this.successfulDribble(player, p, around, opponentBlock)) {
                situation = {
                  status: true,
                  reason: 'move towards ball successful via dribble',
                };
              }
            } else {
              if (this.tackle(player, opponentBlock)) {
                situation = {
                  status: true,
                  reason: 'move towards not successful, because of tackle',
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

  public kick(player: IFieldPlayer, direction: IBlock) {
    player.shoot(co.calculateDifference(direction, player.BlockPosition));
    matchEvents.emit('kick', { subject: player });
  }

  public shoot(player: IFieldPlayer, direction: IBlock) {
    player.shoot(co.calculateDifference(direction, player.BlockPosition));
    matchEvents.emit('shot', { subject: player });
  }
  
  public freekick(player: IFieldPlayer, ball: IBall, direction: IBlock) {
    // Move the ball to the player taking the freekick
    ball.move(co.calculateDifference(player.BlockPosition, ball.Position));

    const where = co.calculateDistance(player.BlockPosition, direction);

    if (where <= 3) {
      this.shoot(player, direction);
    } else {
      this.kick(player, direction);
    }
  }

  /**
   * Find the first block around the player that is free
   */
  private findFreeBlock(around: IPositions) {
    for (const key in around) {
      if (around.hasOwnProperty(key) && around[key] !== undefined) {
        const block = around[key] as IBlock;
        if (block.x >= 0 || block.y >= 0 || block.x <= 11 || block.y <= 6) {
          if (block.occupant == null) {
            return block;
          }
        } else {
          return undefined;
        }
      }
    }
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
    return arr.find(p => {
      return p.ClubCode !== player.ClubCode;
    });
  }

  private makeMove(
    player: IFieldPlayer,
    path: ICoordinate,
    around: IPositions
  ) {

    console.log('Inside Make move')

    switch (path.x) {
      case -1:
        const b1 = around.left as IBlock;
        if (b1.occupant == null) {
          player.move(path);
          return true;
        } else {
          const b = this.findFreeBlock(around) as IBlock;
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
          const b = this.findFreeBlock(around) as IBlock;
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
          const b = this.findFreeBlock(around) as IBlock;
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
          const b = this.findFreeBlock(around) as IBlock;
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
      dribbler: player.LastName,
      dribbled: dribbled.LastName,
    });
    return true;
  }

  private tackle(player: IFieldPlayer, tackler: IFieldPlayer) {
    console.log(`${tackler.LastName} is tackling ${player.LastName}`);
    const chance = Math.round(Math.random() * 12);

    if (chance >= 4) {
      tackler.Ball.move(
        co.calculateDifference(tackler.BlockPosition, player.BlockPosition)
      );
      matchEvents.emit('successful-tackle', {
        tackler: tackler.LastName,
        tacklerPosition: {
          x: tackler.BlockPosition.x,
          y: tackler.BlockPosition.y,
        },
        tackled: player.LastName,
        tackledPlayerPosition: {
          x: player.BlockPosition.x,
          y: player.BlockPosition.y,
        },
      });
    } else {
      matchEvents.emit('bad-tackle', {
        tackler: tackler.LastName,
        tacklerPosition: {
          x: tackler.BlockPosition.x,
          y: tackler.BlockPosition.y,
        },
        tackled: player.LastName,
        tackledPlayerPosition: {
          x: player.BlockPosition.x,
          y: player.BlockPosition.y,
        },
      });
      this.referee.foul(tackler, player);
    }
    return true;
  }

  private markBall(player: IFieldPlayer){
    this.move(player, 'towards ball', player.Ball.Position);
  }

  private pushForward(team: MatchSide) {
    // const chance = Math.round(Math.random() * 100);
    console.log('*-- Attacking Side pushing forward --*');

    const attackingPlayers = playerFunc.getATTMID(team);

    attackingPlayers.forEach(p => {
      this.movePlayersForward(p, team);
    });
  }

  private pressureBall(team: MatchSide){
    console.log('*-- Defending Side pressuring ball --*');

    // Find midfielders and attackers
    const defendingPlayers = playerFunc.getATTMID(team);

    defendingPlayers.forEach(p => {
      this.markBall(p);
    })
  }
}

// function getSide(index: number) {
//   return co.indexToBlock(index);
// }

interface ISituation {
  status?: boolean;
  reason: string;
}

// const Actions = {
//   general: {
//     pass: {
//       short: 1,
//       medium: 2,
//       long: 3,
//     },
//     shoot: {
//       curved: {
//         diagonal: true,
//       },
//     },
//     move: {},
//   },
// };
