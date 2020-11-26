/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Coordinates from '../../utils/coordinates';
import Ball from '../../classes/Ball';
import Referee from '../../classes/Referee';
// import { IBlock } from '../../state/ImmutableState/FieldGrid';
import { matchEvents } from '../../utils/events';
import { fetchClubs } from '../clubs/club.service';
import Game from '../Game';

export default class App {
  public static instance: App;

  public static instances = 0;

  public static create() {
    if (!App.instance) {
      App.instance = new App();
    }
  }

  public static get _app() {
    return App.instance;
  }

  public Game: Game | undefined;

  constructor() {
    App.instances++;
  }

  /** Setup Game => Run this first */
  public async setupGame(
    clubs: string[],
    sides: { home: string; away: string }
  ) {
    try {
      const teams = await fetchClubs({ _id: { $in: clubs } });

      console.log('Teams => ', teams[0]._id, teams[1]._id);

      new Coordinates();

      const centerBlock = Game.FIELD.PlayingField[82];

      const ball = new Ball('#ffffff', centerBlock);

      const ref = new Referee('Anjus', 'Banjus', 'normal', ball);

      this.Game = new Game(
        teams,
        sides,
        // homePost,
        // awayPost,
        ball,
        ref,
        centerBlock
      );

      this.Game.refAssignMatch();

      this.Game.setClubPlayers();

      this.Game.setClubFormations('HOME-433', 'AWAY-433');

      this.listenForGameEvents();

      return this.Game;
    } catch (err) {
      console.log('Error setting up game! (in App) => ', err);
      throw new Error(err);
    }
  }

  /** Start Game => Run this after setting up Game */
  public startGame() {
    try {
      return this.Game!.startHalf();

      // After here, the game should start!
    } catch (error) {
      console.log('Error starting game!', error);
    }
  }

  /** [EXPERIMENTAL] Run this last! Thank you Jesus */
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
