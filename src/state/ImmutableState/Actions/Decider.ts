import { IFieldPlayer } from '../../../interfaces/Player';
import { MatchSide } from '../../../classes/MatchSide';
import * as co from '../../../utils/coordinates';

// Thank you Jesus!

export class Decider {
  public strategy: IStrategy = { type: 'poops', detail: 'normal' };
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
            } else if (this.chanceToMoveForward(player, attackingSide, 60)) {
              this.strategy = { type: 'move', detail: 'normal' };
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
              player.Attributes.ShortPass
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
                30
              );
            } else {
              this.strategy = this.whatKindaPass(player, attackingSide);
            }
          }
        }
        break;
      case 'DEF':
        if(player.WithBall) {
          // Defenders should be passing!
          if (player.Attributes.AttackingMindset) {

            if (this.chanceToShoot(player, attackingSide, 40, 3)) {
              this.strategy = { type: 'shoot', detail: 'normal' };
            } else if (this.chanceToShoot(player, attackingSide, 60, 5)) {
              // If not close to the post, what can he do? Move forward!
              this.strategy = { type: 'shoot', detail: 'long' };
            } else if (this.isClosestToPost(player, attackingSide)) {
              this.strategy = this.chanceToMoveForward(player, attackingSide, 50, 'MID');
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

  private chanceToMoveForward(
    player: IFieldPlayer,
    attackingSide: MatchSide,
    threshold: number,
    teammatePosition = 'ATT',
    passingDistance = 3
  ): IStrategy {
    // Do some random things he should keep on moving
    // but if not he should pass I guess
    let strategy = { type: 'move', detail: 'normal' };

    if(co.atExtremeBlock(player.BlockPosition) && player.Attributes.LongPass > 40) {
      // TODO: Add some randomness here...
      return {type: 'pass', detail: 'long'};
    };

    if (
      this.passability(player, attackingSide, passingDistance, teammatePosition) &&
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
    teammatePosition?: string
  ) {
    const teammate = co.findClosestPlayer(
      player.BlockPosition,
      attackingSide.StartingSquad,
      player
    );

    const teammateIsClose =
      co.calculateDistance(player.BlockPosition, teammate.BlockPosition) <=
      distance;

    if (teammatePosition) {
      return teammate.Position === teammatePosition && teammatePosition;
    }

    return teammateIsClose;
  }

  /**
   * Check if player is near the post
   *
   * @param player Player in focus
   * @param attackingSide Player's team
   */
  private isNearPost(player: IFieldPlayer, attackingSide: MatchSide) {
    return (
      co.calculateDistance(player.BlockPosition, attackingSide.ScoringSide) <= 7
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

    if(co.atExtremeBlock(player.BlockPosition) && player.Attributes.LongPass > 39) {
      return {type: 'pass', detail: 'long'};
    };

    // Check if his closest teammate is 3 steps away or less
    if (this.passability(player, attackingSide, 2)) {
      strategy = { type: 'pass', detail: 'short' };
    } else if (this.passability(player, attackingSide, 5)) {
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
    if (this.passability(player, attackingSide, 3)) {
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
