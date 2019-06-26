import { IFieldPlayer, IPositions } from '../../interfaces/Player';
import * as co from '../../utils/coordinates';
import { MatchSide } from '../../classes/MatchSide';
import { IBlock, ICoordinate } from '../../classes/Ball';
import {moveEvents} from '../../utils/events';
import {IReferee} from '../../classes/Referee';

export class Actions {
  
  public referee: IReferee;
  private attackingSide: MatchSide;
  private defensingSide: MatchSide;
  private attackingPlayer: IFieldPlayer;
  private defendingPlayer: IFieldPlayer;
  

  constructor(
    attackingPlayer: IFieldPlayer,
    attackingSide: MatchSide,
    defendingPlayer: IFieldPlayer,
    defendingSide: MatchSide,
    ref: IReferee
  ){
    this.attackingPlayer = attackingPlayer;
    this.defendingPlayer = defendingPlayer;
    this.attackingSide = attackingSide;
    this.defensingSide = defendingSide;
    this.referee = ref;
  }

  public setSides(
    attackingPlayer: IFieldPlayer,
    attackingSide: MatchSide,
    defendingPlayer: IFieldPlayer,
    defendingSide: MatchSide
  ){
    this.attackingPlayer = attackingPlayer;
    this.defendingPlayer = defendingPlayer;
    this.attackingSide = attackingSide;
    this.defensingSide = defendingSide;
  }

  public takeAction(
    attackingPlayer: IFieldPlayer,
    attackingSide: MatchSide,
    defendingPlayer: IFieldPlayer,
    defendingSide: MatchSide
  ) {
  
    switch (this.flipCoin()) {
      case 1:
        this.pass(attackingPlayer, attackingSide)
        break;
    
      case 2:
        if(!this.move(attackingPlayer, 'forward')){
          this.pass(attackingPlayer, attackingSide)
        }
        break;
    }
  
  
  }
  
  public flipCoin(){
    return Math.ceil(Math.random() * 2);
  }
  
  public pass(player: IFieldPlayer, squad: MatchSide){
  
    /**
     * Find a teammate to pass to
     */
    const teammate = co.findClosestPlayer(
      player.BlockPosition,
      squad.StartingSquad
    );
  
    /**
     * Find an opponent closest to the teammate to intercept...
     */
    const interceptor = co.findClosestPlayer(teammate.BlockPosition, this.defensingSide.StartingSquad);

      
      /**
       * If the players AttackingClass beats the interceptors DefensiveClass
       * then allow the pass to go through. Else, pass to the interceptor hehe
       */
      if(this.compareValues(player.AttackingClass, interceptor.DefensiveClass)){
        player.pass(
          co.calculateDifference(teammate.BlockPosition, player.BlockPosition)
        );
      } else {
        player.pass(
          co.calculateDifference(interceptor.BlockPosition, player.BlockPosition)
        );
      }
  }
  
  public move(player: IFieldPlayer, type: string, ref?: IBlock){
    const around = player.checkNextBlocks();

    // Check if there's a free block around the player -- if not do something else
    if(this.findFreeBlock(around) !== undefined){
       switch (type) {
      case 'towards ball':
      const ball = ref as IBlock;
      const path = co.findPath(ball, player.BlockPosition);

      this.makeMove(player, path, around);

        /**
         * Check to see if any sides are empty
         */
        // switch (path.x) {
        //   case -1:
        //     const b1 = around.left as IBlock;
        //     if(b1.occupant!==null){
        //       player.move(path)
        //     }else {
        //       const b =  this.findFreeBlock(around) as IBlock;
        //       const p = co.findPath(b, player.BlockPosition)
             
        //       player.move(p);
        //     }
        //     break;
        
        //   case 1:
        //       const b2 = around.right as IBlock;
        //       if(b2.occupant!=null){
        //         player.move(path)
        //       }else {
        //         const b =  this.findFreeBlock(around) as IBlock;
        //         const p = co.findPath(b, player.BlockPosition)
               
        //         player.move(p);
        //       }
        //     break;
        // }

        // switch (path.y) {
        //   case -1:
        //       const b3 = around.top as IBlock;
        //       if(b3.occupant!=null){
        //         player.move(path)
        //       }else {
        //         const b =  this.findFreeBlock(around) as IBlock;
        //         const p = co.findPath(b, player.BlockPosition)
               
        //         player.move(p);
        //       }
        //     break;
        
        //   case 1:
        //       const b4 = around.left as IBlock;
        //       if(b4.occupant!=null){
        //         player.move(path)
        //       }else {
        //         const b =  this.findFreeBlock(around) as IBlock;
        //         const p = co.findPath(b, player.BlockPosition)
               
        //         player.move(p);
        //       }
        //     break;
        // }

      
          // player.move(path);
        break;
    
      case 'forward':
        const opponentBlock = this.findMarkingOpponent(player, around) as IFieldPlayer;
        const r = ref as IBlock;
          const p = co.findPath(r, player.BlockPosition);

        // If there is no marking opponent nearby just move
        // But if there is a marking opponent nearby, the opponent will try to take the ball from
        // the attackingPlayer
        if(opponentBlock === undefined){
          
          this.makeMove(player, p, around);
        } else {
          if(this.compareValues(player.AttackingClass, opponentBlock.DefensiveClass)){
            // this.makeMove(player, p, around);
            this.successfulDribble(player, p, around);
          } else {
            this.tackle(opponentBlock);
          }
        }
        break;
    }
    } else {
      return false;
    }

   
  }

  /**
   * Returns true if the first player's stats are closer to a randomly chosen
   * number. 
   * If the function returns true it means weight A wins
   * if false it means weight B wins
   * See 'Weight based' probability I think :p
   * 
   * @param a Weight of player A
   * @param b Weight of player B
   */
  private compareValues(a: number, b: number) : boolean{

    const universe = 1000;

    /**
     * Weight based simulation
     */
    const winningChanceA = Math.round(a /(a + b) * 100);

    const winningChanceB = Math.round(b /(a + b) * 100);

    const fulcrumNumber = winningChanceA <= winningChanceB ? winningChanceA / 100 * universe : winningChanceB / 100 * universe;


    const random = Math.round(Math.random() * 1000);

    return random <= fulcrumNumber;

  }

  /**
   * Find the first block around the player that is free
   */
  private findFreeBlock(around: IPositions){
    for (const key in around) {
      if (around.hasOwnProperty(key)) {
        const block = around[key] as IBlock;
        if(block.occupant == null){
          return block;
        }
      }
    }
  }

  /**
   * Find an opponent block around the player
   * @param player 
   * @param around 
   */
  private findMarkingOpponent(player : IFieldPlayer, around: IPositions){
    for (const key in around) {
      if (around.hasOwnProperty(key)) {
        const block = around[key] as IBlock;
        const occupant = block.occupant as IFieldPlayer;
        if(occupant.ClubCode !== player.ClubCode){
          return block.occupant;
        }
      }
    }
  }

  private makeMove(player:IFieldPlayer, path: ICoordinate, around: IPositions){
    switch (path.x) {
      case -1:
        const b1 = around.left as IBlock;
        if(b1.occupant!==null){
          player.move(path)
        }else {
          const b =  this.findFreeBlock(around) as IBlock;
          const p = co.findPath(b, player.BlockPosition)
         
          player.move(p);
        }
        break;
    
      case 1:
          const b2 = around.right as IBlock;
          if(b2.occupant!=null){
            player.move(path)
          }else {
            const b =  this.findFreeBlock(around) as IBlock;
            const p = co.findPath(b, player.BlockPosition)
           
            player.move(p);
          }
        break;
    }

    switch (path.y) {
      case -1:
          const b3 = around.top as IBlock;
          if(b3.occupant!=null){
            player.move(path)
          }else {
            const b =  this.findFreeBlock(around) as IBlock;
            const p = co.findPath(b, player.BlockPosition)
           
            player.move(p);
          }
        break;
    
      case 1:
          const b4 = around.left as IBlock;
          if(b4.occupant!=null){
            player.move(path)
          }else {
            const b =  this.findFreeBlock(around) as IBlock;
            const p = co.findPath(b, player.BlockPosition)
           
            player.move(p);
          }
        break;
    }

  }

  private successfulDribble(player:IFieldPlayer, path: ICoordinate, around: IPositions){
    this.makeMove(player, path, around);
    moveEvents.emit('dribble', {player: player.FirstName + ' ' + player.LastName});
  }

  private tackle(tackler: IFieldPlayer){
    const chance = Math.round(Math.random() * 12);

    if(chance >= 4){
      tackler.Ball.move(tackler.BlockPosition);
    } else {
      this.referee.foul(tackler);
    }

} 

};

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

