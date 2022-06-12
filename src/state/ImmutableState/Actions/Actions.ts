/* eslint-disable no-prototype-builtins */
/* eslint-disable no-case-declarations */
import { IFieldPlayer, IPositions } from '../../../interfaces/Player';
import CO from '../../../utils/coordinates';
import * as playerFunc from '../../../utils/players';
import { MatchSide } from '../../../classes/MatchSide';
import { IBlock, ICoordinate } from '../../ImmutableState/FieldGrid';
import Ball, { IBall } from '../../../classes/Ball';
import { matchEvents, createMatchEvent } from '../../../utils/events';
import {
  IReferee,
  IShot,
  IPass,
  IDribble,
  ITackle,
} from '../../../classes/Referee';
import { Decider, IStrategy } from './Decider';
import { Match, IMatchData } from '../../../classes/Match';
import log from '../../../helpers/logger';

export class Actions {
  public referee: IReferee;
  public decider: Decider;
  public interruption: boolean;
  public activePlayerAS: IFieldPlayer | undefined;
  public activePlayerDS: IFieldPlayer | undefined;
  public attackingSide: MatchSide | undefined;
  public defendingSide: MatchSide | undefined;
  public teams: MatchSide[];
  private match: Match;

  constructor(
    ref: IReferee,
    teams: MatchSide[],
    match: Match,
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
    this.match = match;

    log(`Teams => ${this.teams[0].Name} ${this.teams[1].Name}`);

    this.decider = new Decider(this.teams);

    matchEvents.on(`${this.match.id}-game-halt`, (data) => {
      this.interruption = true;
    });

    matchEvents.on(`${this.match.id}-shot`, (data: IShot) => {
      this.interruption = data.interruption;
      this.referee.handleShot(data, this);
    });

    matchEvents.on(`${this.match.id}-setting-playing-sides`, (data: IMatchData) => {
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
    return data;
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

    const strategy = this.decider.makeDecision(
      attackingPlayer,
      attackingSide,
      defendingSide
    );

    this.interruption = false;

    log(
      `Taking Action... \nStrategy is => ${strategy.detail} ${strategy.type}`
    );
    const log_data = {
      Player: attackingPlayer.FirstName + ' ' + attackingPlayer.LastName,
      Club: attackingSide.ClubCode,
      Position: attackingPlayer.Position,
    };

    log(log_data, 'table');

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

        matchEvents.emit(`${this.match.id}-set-playing-sides`);
        break;
      case 'shoot':
        log('SHOOOOOOT!!!!!');
        this.shoot(attackingPlayer, attackingSide.ScoringSide, 'shot');
        break;

      case 'move':
        log('Move attempt');

        this.move(attackingPlayer, 'forward', attackingSide.ScoringSide);

        break;
    }

    // Move attackers and midfielders forward

    if (this.interruption) {
      // handle interruption
      log('handling interruption...');
    } else {
      matchEvents.emit(`${this.match.id}-set-playing-sides`);
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
        teammate = CO.co.findClosestPlayer(
          player.BlockPosition,
          squad.StartingSquad,
          player
        );
        break;

      case 'long':
        teammate = CO.co.findLongPlayer(
          player.BlockPosition,
          squad.StartingSquad,
          player
        );
        interceptorDistance = 3;
        break;
      // Find the keeper! but keeper may alos be not gien the ball
      case 'pass to post':
        teammate = CO.co.findClosestPlayerByPosition(
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
    const interceptor = CO.co.findClosestFieldPlayer(
      teammate.BlockPosition,
      defendingSide.StartingSquad,
      undefined,
      interceptorDistance
    );

    if (!interceptor) {
      // This player can't intercept the ball hohoho, let it pass.
      player.pass(
        CO.co.calculateDifference(teammate.BlockPosition, player.BlockPosition)
      );
      matchEvents.emit(`${this.match.id}-pass-made`, {
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
          CO.co.calculateDifference(
            teammate.BlockPosition,
            player.BlockPosition
          )
        );
        matchEvents.emit(`${this.match.id}-pass-made`, {
          passer: player,
          receiver: teammate,
          intercepted: false,
        } as IPass);
        situation = { status: true, reason: 'Player pass successful' };
      } else {
        player.pass(
          CO.co.calculateDifference(
            interceptor.BlockPosition,
            player.BlockPosition
          )
        );
        matchEvents.emit(`${this.match.id}-pass-intercepted`, {
          passer: player,
          interceptor: interceptor,
          intercepted: true
        } as IPass);

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
      status: false,
      reason: 'no free block around',
    };

    let path = CO.co.findPath(ref, player.BlockPosition);

    // Check if there's a free block around the player -- if not do something else
    if (playerFunc.findFreeBlock(around) !== undefined) {
      switch (type) {
        case 'towards ball':
          // const ball = ref;

          situation = {
              status: true,
              reason: 'move towards ball'
          };

          // // Find the path to the ball

          // // Make move towards that path
          // if (this.makeMove(player, path, around)) {
          //   // It means move was successful
          //   situation = {
          //     status: true,
          //     reason: 'move towards ball successful',
          //   };
          // } else {
          //   // means no where to move
          //   situation = {
          //     status: true,
          //     reason: 'no where to move, no interruption',
          //   };
          // }
          break;

      case 'fallback':
          // const keepingSide = ref;

          // // Find the path to the ball
          // path = CO.co.findPath(keepingSide, player.BlockPosition);

           situation = {
              status: true,
              reason: 'move fallback',
          };

          // Make move towards that path
          // if (this.makeMove(player, path, around)) {
          //   // It means move was successful
          //   situation = {
          //     status: true,
          //     reason: 'move back to side successful',
          //   };
          // } else {
          //   // means no where to move
          //   situation = {
          //     status: true,
          //     reason: 'no where to move, no interruption',
          //   };
          // }
          break;

        case 'forward':

          situation = { status: true, reason: 'move forward' };

        break;
      };

          const opponentBlock = this.findMarkingOpponent(
            player,
            around
          ) as IFieldPlayer;

          log('Moving Forward!');
          // r being where you want to move the player to
          const r = ref;

          // asin x: -1 or y: 1
          // const p = CO.co.findPath(ref, player.BlockPosition);

          // If there is no marking opponent nearby just move
          // But if there is a marking opponent nearby, the opponent will try to take the ball from
          // the attackingPlayer
          if (!opponentBlock) {
            if (this.makeMove(player, path, around)) {
              situation.status = true;
            } else {
              situation.status = false;
            }
            // If the player is with the ball and there is a bad guy around
          } else if (player.WithBall && opponentBlock) {
            // Tackle about to happen :0
            log(
              `Ball x,y => ${player.Ball.Position.x} ${player.Ball.Position.y}`
            );
            const success = this.decider.getDribbleResult(
              player,
              opponentBlock
            );
            if (success) {
              // this.makeMove(player, p, around);
              this.successfulDribble(player, path, around, opponentBlock);
              // this.makeMove(player, p, around);
              situation = {
                status: true,
                reason: `move ${type} successful via dribble`,
              };
          
          } else {
              if (this.tackle(player, opponentBlock)) {
                situation = {
                  status: false,
                  reason: `move ${type} tackle successful, possession lost`,
                };
              } else {
                this.makeMove(player, path, around);
                situation = {
                  status: true,
                  reason: `move ${type} tackle failed, possession kept`,
                };
              }
            }
            // If the player is not with the ball even though bad guy around, still move.
          } else {
            if (this.makeMove(player, path, around)) {
              situation = {
                status: true,
                reason: `move ${type} successful, tho bad guy`,
              };
            } else {
              situation = {
                status: false,
                reason: `no where to move ${type}, tho bad guy`,
              };
            }
      }
    } else {
      console.log('In the empty else for Actions. No free block around player., thank you Jesus!');
      log(around);
      // situation = { status: false, reason: 'move towards ball successful' };
      // Player should pass now.

      // find the nearest Marker to this player.
       const marker = this.findMarkingOpponent(
            player,
            around
        ) as IFieldPlayer;

       const markerTeammate = this.findMarkingTeammate(
            player,
            around
        ) as IFieldPlayer;

       /** 
        * If a player has a marker nearby, do a dribble
        * - if dribble is successful, swap positions of players.
        * */

      // TODO: Ideally, player should just jump over another player.
      if(player.WithBall){
        console.log('With ball and tightly marked :/');

        if(marker) {

          let successOfTightDribble = this.decider.getDribbleResult(
              player,
              marker
            );

            if(successOfTightDribble) {
              // swap positions away from this guy
              // get free blocks around marker and move player there.
              situation = {
                  status: true,
                  reason: 'dribbled successfully while tightly marked',
                }

              let toMoveTo = playerFunc.findRandomFreeBlock(marker, 5);
              let path = CO.co.findPath(toMoveTo, player.BlockPosition);

              player.move(path);

              matchEvents.emit(`${this.match.id}-dribble`, {
              dribbler: player,
              dribbled: marker
            } as IDribble);
            createMatchEvent(
              this.match.id,
              `${player.FirstName} ${player.LastName} [${player.ClubCode}] 
              dribbled ${marker.FirstName} ${marker.LastName}`,
              'dribble',
              player._id,
              player.ClubCode
            );
            } else {
              // do a successful tackle, already predetermined
              this.tackle(player, marker, true);
                situation = {
                  status: true,
                  reason: 'tackle successful in close position, possession lost',
                };
            }
        } else if (markerTeammate) {
          // pass
          situation = {
                status: true,
                reason: `move ${type} | ran away from closely marking teammate XD`,
          };

            let toMoveTo = playerFunc.findRandomFreeBlock(markerTeammate, 5);
            let path = CO.co.findPath(toMoveTo, player.BlockPosition);

            player.move(path);

        // do a dribble
        // this.pass(player, 'long', this.attackingSide, this.defendingSide);
      }
    } else {
        // I guess do nothing lol
        console.log('Not with ball. Everyone is blocking me :(. Will stay here')
      }
    }
    // console.log('situation -> ', situation);
    return situation;
  }

  public movePlayersForward(player: IFieldPlayer, team: MatchSide) {
    this.move(player, 'forward', team.ScoringSide);
  }

  public movePlayersBackward(player: IFieldPlayer, team: MatchSide) {
    this.move(player, 'fallback', team.KeepingSide);
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
    // TODO: Change this depending on the playing style of Club...
    const shouldFallBack = this.decider.gimmeAChance();
    if(shouldFallBack < 50){
    this.pressureBall(defendingSide);
    } else {
      this.pushBackward(defendingSide);
    }
  }

  public kick(player: IFieldPlayer, direction: IBlock) {
    player.shoot(CO.co.calculateDifference(direction, player.BlockPosition));
    matchEvents.emit(`${this.match.id}-kick`, { subject: player });
  }

  public shoot(player: IFieldPlayer, post: IBlock, reason: string) {
    // matchEvents.emit(`${this.match.id}-shot`, { subject: player });

    // Use a reference to the player's team... thank you Jesus!
    const teamIndex = this.teams.findIndex(
      (t) => t.ClubCode === player.ClubCode
    );
    const keeper = this.teams[teamIndex].ScoringSide.occupant;
    // console.log(this.teams[teamIndex].ClubCode);
    // console.log(this.teams[teamIndex].ScoringSide.occupant);

    const result = this.decider.getShotResult(player, keeper as IFieldPlayer);

    if (result.goal) {
      // Shot is a goal, fine and good
      player.shoot(CO.co.calculateDifference(post, player.BlockPosition));
      matchEvents.emit(`${this.match.id}-shot`, {
        shooter: player,
        keeper,
        where: player.BlockPosition,
        interruption: true,
        result: 'goal',
        reason,
      } as IShot);
    } else if (result.onTarget && !result.goal) {
      // Shot is a miss
      player.shoot(CO.co.calculateDifference(post, player.BlockPosition));
      matchEvents.emit(`${this.match.id}-shot`, {
        shooter: player,
        keeper,
        where: player.BlockPosition,
        interruption: true,
        result: 'save',
        reason,
      } as IShot);
    } else if (!result.onTarget) {
      // Here put the ball at a random block hehehe
      // find free blocks around the scoring and pick a random one...

      let freeBlocksAroundScoringSide = CO.co.getBlocksAround(this.teams[teamIndex].ScoringSide!, 5);

      // Filter the undefined or occupied ones
      freeBlocksAroundScoringSide = freeBlocksAroundScoringSide.filter(
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
        Math.random() * (freeBlocksAroundScoringSide.length - 1)
      );

      const landingBlock = freeBlocksAroundScoringSide[randomIndex];

      // when a player misses a shot, they 'shoot' somewhere else.
      player.shoot(
        CO.co.calculateDifference(landingBlock, player.BlockPosition)
      );

      log('Free Blocks around keeper =>', freeBlocksAroundScoringSide);

      log('landing block =>', landingBlock);

      // Shot is off target
      matchEvents.emit(`${this.match.id}-shot`, {
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
    ball.move(CO.co.calculateDifference(player.BlockPosition, ball.Position));

    const where = CO.co.calculateDistance(player.BlockPosition, direction);

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
        const occupant = block.occupant;

        // if there is an occupant, push it!
        occupant && arr.push(occupant);
      }
    }

    return arr.find((p) => {
      return p.ClubCode !== player.ClubCode;
    });
  }

  /** find closest teammate around */
  private findMarkingTeammate(player: IFieldPlayer, around: IPositions) {
    const arr: IFieldPlayer[] = [];
    for (const key in around) {
      if (around.hasOwnProperty(key) && around[key] !== undefined) {
        const block = around[key] as IBlock;
        const occupant = block.occupant;

        // if there is an occupant, push it!
        occupant && arr.push(occupant);
      }
    }

    return arr.find((p) => {
      return p.ClubCode == player.ClubCode;
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
            const p = CO.co.findPath(b, player.BlockPosition);
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
            const p = CO.co.findPath(b, player.BlockPosition);
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
            const p = CO.co.findPath(b, player.BlockPosition);
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
            const p = CO.co.findPath(b, player.BlockPosition);
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
    matchEvents.emit(`${this.match.id}-dribble`, {
      dribbler: player,
      dribbled,
    } as IDribble);
    createMatchEvent(
      this.match.id,
      `${player.FirstName} ${player.LastName} [${player.ClubCode}] 
      dribbled ${dribbled.FirstName} ${dribbled.LastName}`,
      'dribble',
      player.PlayerID,
      player.ClubCode
    );
  }

  private tackle(player: IFieldPlayer, tackler: IFieldPlayer, predetermined = false) {
    // log(`${tackler.LastName} is tackling ${player.LastName}`);
    // const success = this.decider.getTackleResult(tackler, player);
    const success = predetermined ? true : Math.round(Math.random() * 12) >= 6;

    if (success) {
      tackler.Ball.move(
        CO.co.calculateDifference(tackler.BlockPosition, player.BlockPosition)
      );
      matchEvents.emit(`${this.match.id}-tackle`, {
        tackler,
        tackled: player,
        success,
      } as ITackle);
      createMatchEvent(
        this.match.id,
        `${tackler.FirstName} ${tackler.LastName} [${tackler.ClubCode}] 
        tackled the ball from ${player.FirstName} ${player.LastName}`,
        'tackle',
        tackler.PlayerID,
        tackler.ClubCode
      );
      return true;
    } else {
      matchEvents.emit(`${this.match.id}-tackle`, {
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
    log('*-- Attacking Side pushing forward --*');

    const attackingPlayers = playerFunc.getATTMID(team);

    attackingPlayers.forEach((p) => {
      this.movePlayersForward(p, team);
    });
  }

  private pushBackward(team: MatchSide) {
    // const chance = Math.round(Math.random() * 100);
    log('*-- Team pushing backward --*');

    const attackingPlayers = playerFunc.getATTMID(team);

    attackingPlayers.forEach((p) => {
      this.movePlayersBackward(p, team);
    });
  }

  private pressureBall(team: MatchSide) {
    log('*-- Defending Side pressuring ball --*');

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
