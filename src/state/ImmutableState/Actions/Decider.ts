import { IFieldPlayer } from '../../../interfaces/Player';
import { MatchSide } from '../../../classes/MatchSide';
import * as co from '../../../utils/coordinates';

// Thank you Jesus!

export class Decider {
  public strategy: IStrategy = { type: 'move', detail: 'normal' };

  /**
   * MakeDecision
   *
   * Decide what player will do
   *
   * @param player
   * @param attackingSide
   * @param defendingSide
   * @returns {IStrategy} Strategy player will take
   */
  public makeDecision(
    player: IFieldPlayer,
    attackingSide: MatchSide,
    defendingSide: MatchSide
  ): IStrategy {
    switch (player.Position) {
      // If this guy is a midfielder...
      case 'MID':
        if (player.WithBall) {
          // Check mindsets...
          if (player.Attributes.AttackingMindset) {
            // If Midfielder with ball has attacking mindset...
            // check if he is close to the scoring post... and if his chance in 70%
            if (this.chanceToShoot(player, attackingSide, 70, 2)) {
              this.strategy = { type: 'shoot', detail: 'normal' };
            } else if (this.chanceToShoot(player, attackingSide, 50, 3)) {
              // If not close to the post, what can he do? Move forward!
              this.strategy = { type: 'shoot', detail: 'long' };
            } else if (this.gimmeAChance() <= 80) {
              this.strategy = this.whatKindaPass(player, attackingSide);
            } else {
              this.strategy = { type: 'move', detail: 'normal' };
            }
          } else {
            if (this.chanceToShoot(player, attackingSide, 50, 2)) {
              this.strategy = { type: 'shoot', detail: 'normal' };
            } else if (this.chanceToShoot(player, attackingSide, 30, 3)) {
              this.strategy = { type: 'shoot', detail: 'long' };
            } else if (this.gimmeAChance() <= 80) {
              this.strategy = this.whatKindaPass(player, attackingSide);
            } else {
              this.strategy = { type: 'move', detail: 'normal' };
            }
          }
        }
        break;
      case 'GK':
        if (player.WithBall) {
          this.strategy = this.keeperPass(
            player,
            attackingSide,
            player.Attributes.Keeping
          );
        }
        break;
      case 'ATT':
        if (player.WithBall) {
          if (
            this.chanceToShoot(
              player,
              attackingSide,
              player.Attributes.Shooting,
              2
            )
          ) {
            this.strategy = { type: 'shoot', detail: 'normal' };
          } else if (
            this.chanceToShoot(
              player,
              attackingSide,
              player.Attributes.Shooting,
              3
            )
          ) {
            // If not close to the post, what can he do? Move forward!
            this.strategy = { type: 'shoot', detail: 'long' };
          } else if (this.isClosestToPost(player, attackingSide)) {
            // If the player is near the post, he should keep on moving...
            this.strategy = this.chanceToMoveForward(
              player,
              attackingSide,
              30,
              true,
              2
            );
          } else {
            // here player is neither shooting or moving forward, therefore pass!
            // but what kind of pass?
            // It is possible for this to result in a 'move' strategy i.e
            // closest teammate is too far away
            if (player.Attributes.AttackingMindset) {
              this.strategy = this.chanceToMoveForward(
                player,
                attackingSide,
                30,
                false
              );
            } else {
              this.strategy = this.whatKindaPass(player, attackingSide);
            }
          }
        }
        break;
      case 'DEF':
        if (player.WithBall) {
          // Defenders should be passing!
          if (player.Attributes.AttackingMindset) {
            if (this.chanceToShoot(player, attackingSide, 40, 3)) {
              this.strategy = { type: 'shoot', detail: 'normal' };
            } else if (this.chanceToShoot(player, attackingSide, 60, 4)) {
              // If not close to the post, what can he do? Move forward!
              this.strategy = { type: 'shoot', detail: 'long' };
            } else if (this.isClosestToPost(player, attackingSide)) {
              this.strategy = this.chanceToMoveForward(
                player,
                attackingSide,
                50,
                true
              );
            } else {
              // here player is neither shooting or moving forward, therefore pass!
              // but what kind of pass?
              // It is possible for this to result in a 'move' strategy i.e
              // closest teammate is too far away
              this.strategy = this.whatKindaPass(player, attackingSide);
            }
          } else {
            if (this.chanceToShoot(player, attackingSide, 30, 3)) {
              this.strategy = { type: 'shoot', detail: 'normal' };
            } else if (this.chanceToShoot(player, attackingSide, 40, 4)) {
              // If not close to the post, what can he do? Move forward!
              this.strategy = { type: 'shoot', detail: 'long' };
            } else if (this.isClosestToPost(player, attackingSide)) {
              this.strategy = this.chanceToMoveForward(
                player,
                attackingSide,
                40,
                true
              );
            } else {
              // here player is neither shooting or moving forward, therefore pass!
              // but what kind of pass?
              // It is possible for this to result in a 'move' strategy i.e
              // closest teammate is too far away
              this.strategy = this.whatKindaPass(player, attackingSide);
            }
          }
        }
        break;
    }

    return this.strategy;
  }

  /**
   * GetPassResult
   *
   * Determines the success or failure of a pass attempt
   *
   * @param {IFieldPlayer} passer
   * @param {IFieldPlayer} reciever
   * @param {boolean} type
   * @param {number} luck
   * @param {IFieldPlayer | undefined} interceptor
   * @returns {boolean} true/false
   */
  public getPassResult(
    passer: IFieldPlayer,
    reciever: IFieldPlayer,
    type: string,
    luck: number,
    interceptor?: IFieldPlayer
  ): boolean {
    // check their properties
    let result = true;
    const chance = Math.round(Math.random() * 100);
    switch (type) {
      case 'short':
        if (interceptor) {
          const tally =
            passer.Attributes.ShortPass +
            reciever.Attributes.Control / 2 +
            passer.Attributes.Mental / 2 -
            interceptor!.Attributes.Tackling;
          result = chance > tally;
        } else {
          const tally =
            passer.Attributes.ShortPass +
            reciever.Attributes.Control / 2 +
            passer.Attributes.Mental / 2 -
            chance;

          result = chance > tally;
        }
        break;
      case 'long':
        // let chance = Math.round(Math.random() * 100);
        if (interceptor) {
          const tally =
            passer.Attributes.LongPass > interceptor!.Attributes.Tackling;
          result = tally && chance <= passer.Attributes.Mental;
        } else {
          const tally =
            passer.Attributes.LongPass +
            (reciever.Attributes.Control / 2 +
              passer.Attributes.Mental / 2 -
              chance);

          result = chance > tally;
        }
        break;

      default:
        break;
    }

    return result;
  }

  /**
   * GetDribbleResult
   *
   * Determine the success or failure of a dribble attempt
   *
   * @param dribbler
   * @param opponent
   * @returns {boolean} true/false
   */
  public getDribbleResult(
    dribbler: IFieldPlayer,
    opponent: IFieldPlayer
  ): boolean {
    const chance = Math.round(Math.random() * 100);
    const tally =
      dribbler.Attributes.Dribbling / 2 +
      dribbler.Attributes.Speed / 2 -
      opponent.Attributes.Tackling;
    return chance < tally;
  }

  /**
   * GetTackleResult
   *
   * Determine the success or failure of a tackle attempt
   *
   * @param tackler
   * @param ballHolder
   * @returns {boolean} true/false
   */
  public getTackleResult(
    tackler: IFieldPlayer,
    ballHolder: IFieldPlayer
  ): boolean {
    const chance = Math.round(Math.random() * 100);
    // TODO: Improve the distribution of attributes here...
    const tally =
      tackler.Attributes.Tackling / 2 +
      tackler.Attributes.Strength / 2 -
      (ballHolder.Attributes.Strength / 2 + ballHolder.Attributes.Control / 2);

    if (tally < 0) {
      return chance > Math.abs(tally);
    } else {
      return chance < tally;
    }
  }

  /**
   * GetShotResult
   *
   * Returns the result of a goal attempt
   * @param shooter
   * @param keeper
   */
  public getShotResult(shooter: IFieldPlayer, keeper: IFieldPlayer) {
    // Let's see what happens.
    // What determines a goal? Shooter's shooting (duh), ball control, Keepers keeping and the *le randomness* :)
    const onTarget = this.getShotTarget(shooter);
    const chance = Math.round(Math.random() * 100);

    if (!keeper && onTarget) {
      return { onTarget, goal: true };
    } else {
      if (onTarget) {
        const tally =
          shooter.Attributes.Shooting +
          shooter.Attributes.Mental -
          keeper.Attributes.Keeping;

        return { onTarget, goal: chance <= tally };
      } else {
        return { onTarget, goal: false };
      }
    }
  }

  /**
   * GimmeAChance - _just give me a chance!_
   *
   * Returns a random percentage
   * @returns {number} chance threshold
   */
  public gimmeAChance(): number {
    return Math.round(Math.random() * 100);
  }

  private chanceToShoot(
    player: IFieldPlayer,
    attackingSide: MatchSide,
    threshold: number,
    distance: number
  ) {
    return (
      co.calculateDistance(player.BlockPosition, attackingSide.ScoringSide) <=
        distance && this.gimmeAChance() <= threshold
    );
  }

  /**
   * GetShotTarget
   *
   * Used to see if player will shoot on target or not
   *
   * - Uses their Shooting to get their normal shot success percentage
   *
   * - Uses their Shooting and Shooting divided by 2 to get long shot success
   *   percentage
   *
   * @param shooter
   */
  private getShotTarget(shooter: IFieldPlayer) {
    // if distance from post is near post...
    const chance = Math.round(Math.random() * 100);

    if (this.isNearPost(shooter, shooter.Team, 2)) {
      // here player is 80% likely to shoot on target
      return chance <= shooter.Attributes.Shooting;
    } else {
      return (
        chance <=
        (shooter.Attributes.SetPiece + shooter.Attributes.Shooting) / 2
      );
    }
  }

  /**
   * ChanceToMoveForward
   *
   * determines a strategy for the player whether he should move forward
   * or pass
   *
   * @param player
   * @param attackingSide
   * @param threshold
   * @param teammatePosition
   * @param passingDistance
   */
  private chanceToMoveForward(
    player: IFieldPlayer,
    attackingSide: MatchSide,
    threshold: number,
    teammatePosition: boolean,
    passingDistance = 4
  ): IStrategy {
    let strategy: IStrategy = { type: 'move', detail: 'normal' };

    if (
      co.atExtremeBlock(player.BlockPosition) &&
      player.Attributes.LongPass > 30 &&
      player.Position !== 'ATT'
    ) {
      if(this.gimmeAChance() < 50) {
        return { type: 'pass', detail: 'long' };
      } else {
        return { type: 'pass', detail: 'short' };
      }
    }

    const closest = this.isClosestToPost(player, attackingSide);

    const pos = player.Position === 'ATT';

    if (
      this.passability(player, attackingSide, passingDistance, !pos) &&
      this.gimmeAChance() <= threshold
    ) {
      //  If the closest teammate is also an attacker then pass
      strategy = { type: 'pass', detail: 'short' };
    } else {
      strategy = { type: 'move', detail: 'normal' };
    }

    return strategy;
  }

  /**
   * Passability
   *
   * This determines if passing is a good move for the player
   * @param {IFieldPlayer} player
   * @param {MatchSide} attackingSide
   * @param {number} distance max distance a teammate should be
   */
  private passability(
    player: IFieldPlayer,
    attackingSide: MatchSide,
    distance: number,
    teammatePosition: boolean
  ): boolean {
    const teammate = co.findClosestPlayer(
      player.BlockPosition,
      attackingSide.StartingSquad,
      player,
      true
    );

    const teammateIsClose =
      co.calculateDistance(player.BlockPosition, teammate.BlockPosition) <=
      distance;

    if (teammatePosition) {
      // Pass to Attackers or Midfielders
      return (
        (teammate.Position === 'ATT' || teammate.Position === 'MID') &&
        teammateIsClose
      );
    }

    return teammateIsClose;
  }

  /**
   * isNearPost
   *
   * Check if player is near the post
   * @param {IFieldPlayer} player Player in focus
   * @param {MatchSide} attackingSide Player's team
   * @returns {boolean} true/false
   */
  private isNearPost(
    player: IFieldPlayer,
    attackingSide: MatchSide,
    distance: number,
    ownPost: boolean = false
  ): boolean {
 if(ownPost) {
  return (
    co.calculateDistance(player.BlockPosition, attackingSide.KeepingSide) <=
    distance
  );
 } else {
  return (
    co.calculateDistance(player.BlockPosition, attackingSide.ScoringSide) <=
    distance
  );
 }
  }

  /**
   * isClosestToPost
   *
   * Check if player is the closest in his team to the post
   * @param {IFieldPlayer} player
   * @param {MatchSide} attackingSide
   * @returns {boolean} true/false
   */
  private isClosestToPost(
    player: IFieldPlayer,
    attackingSide: MatchSide
  ): boolean {
    return (
      co.findClosestPlayerInclusive(
        attackingSide.ScoringSide,
        attackingSide.StartingSquad
      ) === player
    );
  }

  /**
   * WhatKindaPass
   *
   * Determines the kind of pass this player will make, but
   * can also result in the player moving forward
   * @param {IFieldPlayer} player
   * @param {MatchSide} attackingSide
   * @returns {IStrategy} Strategy to take: pass or move
   */
  private whatKindaPass(
    player: IFieldPlayer,
    attackingSide: MatchSide
  ): IStrategy {
    let strategy: IStrategy = { type: 'pass', detail: 'short' };

    if (co.atExtremeBlock(player.BlockPosition)) {
      if (this.passability(player, attackingSide, 4, true)) {
        return { type: 'pass', detail: 'short' };
      } else {
        return { type: 'pass', detail: 'long' };
      }
    }

    if(this.isNearPost(player, attackingSide, 5, true)) {
      if (this.gimmeAChance() <= 50) {
        return { type: 'pass', detail: 'pass to post' };
      } else {
        return { type: 'pass', detail: 'short' };
      }
    }

    // Check if his closest teammate is 3 steps away or less
    if (this.passability(player, attackingSide, 4, true)) {
      strategy = { type: 'pass', detail: 'short' };
    } else if (
      this.passability(player, attackingSide, 7, true) &&
      !this.isClosestToPost(player, attackingSide)
    ) {
      strategy = { type: 'pass', detail: 'long' };
    } else {
      strategy = { type: 'move', detail: 'normal' };
    }

    return strategy;
  }

  /**
   * KeeperPass
   *
   * Determines the kind of pass keeper will make
   * @param {IFieldPlayer} player
   * @param {MatchSide} attackingSide
   * @param {boolean} chance
   * @returns {IStrategy} kind of pass
   */
  private keeperPass(
    player: IFieldPlayer,
    attackingSide: MatchSide,
    chance: number
  ): IStrategy {
    let strategy: IStrategy = { type: 'pass', detail: 'short' };

    if (this.passability(player, attackingSide, 3, false)) {
      if (
        player.Attributes.LongPass > player.Attributes.ShortPass &&
        this.gimmeAChance() <= chance
      ) {
        strategy = { type: 'pass', detail: 'long' };
      } else {
        strategy = { type: 'pass', detail: 'short' };
      }
    } else {
      strategy = { type: 'pass', detail: 'long' };
    }

    return strategy;
  }
}

export interface IStrategy {
  type: 'pass' | 'move' | 'shoot';
  detail?: string;
}
