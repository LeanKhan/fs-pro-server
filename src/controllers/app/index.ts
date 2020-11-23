import Ball from '../../classes/Ball';
import Referee from '../../classes/Referee';
import { IBlock } from '../../state/ImmutableState/FieldGrid';
import * as co from '../../utils/coordinates';
import { matchEvents } from '../../utils/events';
import { fetchClubs } from '../clubs/club.service';
import Game from '../game.controller';

const homePost: IBlock = co.coordinateToBlock({ x: 0, y: 5 });
const awayPost: IBlock = co.coordinateToBlock({ x: 14, y: 5 });

export default class App {
  public Game: Game | undefined;

  public async setupGame(
    clubs: string[],
    sides: { home: string; away: string }
  ) {
    try {
      const teams = await fetchClubs({ _id: { $in: clubs } });

      console.log('Teams => ', teams[0]._id);

      const centerBlock = Game.FIELD.PlayingField[82];

      const ball = new Ball('#ffffff', centerBlock);

      const ref = new Referee('Anjus', 'Banjus', 'normal', ball);

      this.Game = new Game(
        teams,
        sides,
        homePost,
        awayPost,
        ball,
        ref,
        centerBlock
      );

      this.Game.refAssignMatch();

      this.Game.setClubPlayers();

      this.Game.setClubFormations('HOME-433', 'AWAY-433');

      return this.Game;
    } catch (err) {
      console.log('Error setting up game! => ', err);
      throw new Error(err);
    }
  }

  public startGame() {
    try {
      this.Game!.startHalf();

      // After here, the game should start!
    } catch (error) {
      console.log('Error starting game!', error);
    }
  }

  public endGame() {
    try {
      this.Game = undefined;

      // After here, the game should start!
    } catch (error) {
      console.log('Error ending game!', error);
    }
  }

  public listenForGameEvents() {
    matchEvents.on('set-playing-sides', () => {
      const playingSides = this.Game!.setPlayingSides();

      matchEvents.emit('setting-playing-sides', playingSides);
    });
  }
}

// export const setupGame = async (
//     clubs: string[],
//     sides: { home: string; away: string }
//   ) => {
//     try {
//       const teams = await fetchClubs({ _id: { $in: clubs } });

//       console.log('Teams => ', teams[0]._id);

//    const centerBlock = Game.FIELD.PlayingField[82];

//       const ball = new Ball('#ffffff', centerBlock);

//       const ref = new Referee('Anjus', 'Banjus', 'normal', ball);

//       CurrentGame = new Game(
//         teams,
//         sides,
//         homePost,
//         awayPost,
//         ball,
//         ref,
//         centerBlock
//       );

//       CurrentGame.refAssignMatch();

//       CurrentGame.setClubPlayers();

//       CurrentGame.setClubFormations('HOME-433', 'AWAY-433');

//       return CurrentGame;
//     } catch (err) {
//       console.log('Error setting up game! => ', err);
//       throw new Error(err);
//     }
//   };

// export const startGame = async () => {
//     try {
//       CurrentGame.startHalf();

//       // After here, the game should start!
//     } catch (error) {
//       console.log('Error starting game!', error);
//     }
//   };

//   export const endGame = async () => {
//     try {
//       CurrentGame = null;

//       // After here, the game should start!
//     } catch (error) {
//       console.log('Error ending game!', error);
//     }
//   };

//   // Getting clubs
//   // getClubs();

//   function listenForMatchEvents() {
//     matchEvents.on('set-playing-sides', () => {
//       const playingSides = CurrentGame.setPlayingSides();

//       matchEvents.emit('setting-playing-sides', playingSides);
//     });
//   }

//   // function attackingAction() {
//   //   MatchActions.takeAction(activePlayerAS, AS, DS, activePlayerDS);
//   // }

//   // function defendingAction() {
//   //   // After every attempt by the AttackingSide the defensive side should move towards the ball
//   //   MatchActions.move(activePlayerDS, 'towards ball', MatchBall.Position);

//   //   pushForward(AS);
//   // }

//   listenForMatchEvents();
