import { IFieldPlayer } from '../../../interfaces/Player';
import { MatchSide } from '../../../classes/MatchSide';
import * as co from '../../../utils/coordinates';

// Thank you Jesus!

export class Decider {
  public strategy: IStrategy = { type: 'poops', detail: 'normal' };

  // Decide now, what should this player do!
  // First lets do for midfielders...

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
            if (this.chanceToShoot(player, attackingSide, 70, 3)) {
              this.strategy = { type: 'shoot', detail: 'normal' };
            } else if (this.chanceToShoot(player, attackingSide, 50, 5)) {
              // If not close to the post, what can he do? Move forward!
              this.strategy = { type: 'shoot', detail: 'long' };
            } else {
              // here player is neither shooting or moving forward, therefore pass!
              // but what kind of pass?
              // It is possible for this to result in a 'move' strategy i.e
              // closest teammate is too far away
              this.strategy = this.whatKindaPass(player, attackingSide);
            }
          } else {
            if (this.chanceToShoot(player, attackingSide, 50, 3)) {
              this.strategy = { type: 'shoot', detail: 'normal' };
            } else if (this.chanceToShoot(player, attackingSide, 30, 5)) {
              // If not close to the post, what can he do? Move forward!
              this.strategy = { type: 'shoot', detail: 'long' };
            } else if (this.gimmeAChance() <= 80) {
              this.strategy = this.whatKindaPass(player, attackingSide);
            } else {
              // Here Midfileder player is not passing or shooting, he will move forward...
              console.log('Mehn, dem call me from here o!');
              this.strategy = { type: 'move', detail: 'normal' };
            }
          }
        }
        break;
      case 'GK':
        if (player.WithBall) {
          // Goal keeper should pass if he's with the ball, normal...
          // But what kind of pass :)
          this.strategy = this.keeperPass(
            player,
            attackingSide,
            player.Attributes.Keeping
          );
        }
        break;
      case 'ATT':
        if (player.WithBall) {
          // TODO:
          // You can change these chance to shoot to their own shooting ability ...
          if (this.chanceToShoot(player, attackingSide, 90, 3)) {
            this.strategy = { type: 'shoot', detail: 'normal' };
          } else if (this.chanceToShoot(player, attackingSide, 70, 4)) {
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
            } else if (this.chanceToShoot(player, attackingSide, 60, 5)) {
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
          }
        }
        break;
    }

    return this.strategy;
  }

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
            reciever.Attributes.Control / 2 +
            passer.Attributes.Mental / 2 -
            chance;

          result = chance > tally;
        }
        break;

      default:
        break;
    }

    return result;
  }

  public getDribbleResult(dribbler: IFieldPlayer, opponent: IFieldPlayer) {
    const chance = Math.round(Math.random() * 100);
    const tally =
      dribbler.Attributes.Dribbling / 2 +
      dribbler.Attributes.Speed / 2 -
      opponent.Attributes.Tackling;
    return chance > tally;
  }

  public getTackleResult(tackler: IFieldPlayer, ballHolder: IFieldPlayer) {
    const chance = Math.round(Math.random() * 100);
    const tally =
      tackler.Attributes.Tackling / 2 +
      tackler.Attributes.Strength / 2 -
      ballHolder.Attributes.Control;
    return chance > tally;
  }

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
   * gimmeAChance
   */
  public gimmeAChance() {
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

  private getShotTarget(shooter: IFieldPlayer) {
    // if distance from post is near post...
    const chance = Math.round(Math.random() * 100);

    if (this.isNearPost(shooter, shooter.Team, 2)) {
      // here player is 80% likely to shoot on target
      return chance <= 80;
    } else {
      return chance <= 60;
    }
  }

  private chanceToMoveForward(
    player: IFieldPlayer,
    attackingSide: MatchSide,
    threshold: number,
    teammatePosition: boolean,
    passingDistance = 4
  ): IStrategy {
    // Do some random things he should keep on moving
    // but if not he should pass I guess
    let strategy = { type: 'move', detail: 'normal' };

    if (
      co.atExtremeBlock(player.BlockPosition) &&
      player.Attributes.LongPass > 30 &&
      player.Position !== 'ATT'
    ) {
      // TODO: Add some randomness here...
      return { type: 'pass', detail: 'long' };
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
   *
   * @param player
   * @param attackingSide
   * @param distance how far from the player in focus
   */
  private passability(
    player: IFieldPlayer,
    attackingSide: MatchSide,
    distance: number,
    teammatePosition: boolean
  ) {
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
   * Check if player is near the post
   *
   * @param player Player in focus
   * @param attackingSide Player's team
   */
  private isNearPost(
    player: IFieldPlayer,
    attackingSide: MatchSide,
    distance: number
  ) {
    return (
      co.calculateDistance(player.BlockPosition, attackingSide.ScoringSide) <=
      distance
    );
  }

  private isClosestToPost(player: IFieldPlayer, attackingSide: MatchSide) {
    return (
      co.findClosestPlayerInclusive(
        attackingSide.ScoringSide,
        attackingSide.StartingSquad
      ) === player
    );
  }

  private whatKindaPass(
    player: IFieldPlayer,
    attackingSide: MatchSide
  ): IStrategy {
    let strategy = { type: 'pass', detail: 'short' };

    if (co.atExtremeBlock(player.BlockPosition)) {
      if (this.passability(player, attackingSide, 4, true)) {
        return { type: 'pass', detail: 'short' };
      } else {
        return { type: 'pass', detail: 'long' };
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

  private keeperPass(
    player: IFieldPlayer,
    attackingSide: MatchSide,
    chance: number
  ): IStrategy {
    // if keeper long pass is greater than short pass... do long pass
    // else do short pass
    let strategy: IStrategy = { type: 'pass', detail: 'short' };

    // Check passablility first...

    // Players are close by
    if (this.passability(player, attackingSide, 3, false)) {
      if (
        player.Attributes.LongPass > player.Attributes.ShortPass &&
        this.gimmeAChance() <= chance
      ) {
        // do long pass
        strategy = { type: 'pass', detail: 'long' };
      } else {
        // do long pass
        strategy = { type: 'pass', detail: 'short' };
      }
    } else {
      // Players are far away do long pass
      strategy = { type: 'pass', detail: 'long' };
    }

    return strategy;
  }
}

export interface IStrategy {
  type: string;
  detail?: string;
}

// TODO:
// Add interfaces and documentation for the methods
