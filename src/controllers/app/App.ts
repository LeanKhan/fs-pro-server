/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Coordinates from '../../utils/coordinates';
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

  private Coordinates!: Coordinates;

  constructor() {
    // this.Coordinates = new Coordinates();
    App.instances++;
  }

  /** Setup Game => Run this first */
  public async setupGame(
    clubs: string[],
    sides: { home: string; away: string }
  ) {
    try {
      this.Coordinates = new Coordinates();

      const teams = await fetchClubs({ _id: { $in: clubs } });

      const centerBlock = this.Coordinates.Field.PlayingField[82];

      this.Game = new Game(
        teams,
        sides,
        // homePost,
        // awayPost,
        { color: '#ffffff', cb: centerBlock },
        { fname: 'Anjus', lname: 'Banjus', level: 'normal' },
        centerBlock,
        this.Coordinates.Field.PlayingField,
        this.Coordinates
      );

      this.Game.refAssignMatch();

      this.Game.setClubPlayers();

      this.Game.setClubFormations('HOME-433', 'AWAY-433');

      this.listenForGameEvents();

      return this.Game;
    } catch (err) {
      console.log('Error setting up game! (in App) =>', err);
      throw new Error(err);
    }
  }

  /** Start Game => Run this after setting up Game */
  public startGame() {
    try {
      return this.Game!.startHalf();

      // After here, the game should start!
    } catch (error) {
      // TODO: !!! SEARCH FOR THIS log(..., any) in the code
      // Done! RegExp used: log\(.*, [a-zA-Z]*\) this finds expressions
      // that look like log(..., ...)
      console.log('Error starting game! =>', error);
    }
  }

  /** [EXPERIMENTAL] Run this last! Thank you Jesus */
  public endGame() {
    try {
      this.Game = undefined;

      // After here, the game should start!
    } catch (error) {
      console.log('Error ending game! =>', error);
    }
  }

  public listenForGameEvents() {
    matchEvents.on(`${this.Game.Match.id}-set-playing-sides`, () => {
      const playingSides = this.Game!.setPlayingSides();

      matchEvents.emit(`${this.Game!.Match.id}-setting-playing-sides`, playingSides);
    });
  }
}
