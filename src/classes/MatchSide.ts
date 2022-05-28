import { Club } from './Club';
import { IFieldPlayer, PlayerInterface } from '../interfaces/Player';
import FieldPlayer from './FieldPlayer';
import { IBlock } from '../state/ImmutableState/FieldGrid';
import Ball from './Ball';
import { formations, FormationItem } from '../state/PersistentState/Formations';
import Player from './Player';
import { ClubInterface } from '../controllers/clubs/club.model';
import { sortFromKeeperDown } from '../utils/players';
import log from '../helpers/logger';

/** MatchSide
 *
 * Represents a team playing in a match.
 * @extends Club
 */

export class MatchSide extends Club {
  public AttackingForm = 0;
  public DefensiveForm = 0;
  public GoalsScored = 0;
  public StartingSquad: IFieldPlayer[] = [];
  public Substitutes: IFieldPlayer[] = [];
  public MatchSquad: Player[] = [];
  public Formation: FormationItem[] = [];
  /**
   * ScoringSide is where this team will be scoring
   * that is, it is the opponents post :p
   */
  public ScoringSide: IBlock;
  public KeepingSide: IBlock;
  /**
   *
   * @param club
   * @param scoringSide
   * @param KeepingSide
   */

  constructor(club: ClubInterface, scoringSide: IBlock, keepingSide: IBlock) {
    super(club);
    this.ScoringSide = scoringSide;
    this.KeepingSide = keepingSide;
  }

  public setPlayers() {
    this.MatchSquad = this.Players.map((p: PlayerInterface, i) => {
      return new Player(p);
    });
  }

  public setFormation(formation: string, ball: Ball, fieldPlay: IBlock[]) {
    this.Formation = formations[formation];

    log('Formation =>', formations);

    const currentFormation = [...formations[formation]];

    log('Current Formation =>', currentFormation);

    // Sort them here...
    this.MatchSquad = sortFromKeeperDown(this.MatchSquad);

    this.StartingSquad = this.MatchSquad.map((p: PlayerInterface, i) => {
      // const startingBlock = fieldPlay[this.Formation[i]];
      // Find the first starting block that is for this player's position
      // const startingBlock = fieldPlay.find(())

      const { block: startingBlock, index: foundIndex } = this.getBlock(
        fieldPlay,
        p,
        currentFormation
      );

      // Sort players by position! Thank you Jesus!

      // log(
      //   `currentFormation & player =>
      //   ${currentFormation.length},
      //   ${p.Position}`
      // ); REVERT?

      // log(`index => ${foundIndex}`); REVERT?

      currentFormation.splice(foundIndex, 1);

      // console.log(`${p.ClubCode} ${p.LastName} [${p.Position}] initial position => `, startingBlock);

      return new FieldPlayer(p, true, startingBlock, ball);
    });
  }

  public changeFormation(formation: string, fieldPlay: IBlock[], scoringSide: IBlock, keepingSide: IBlock) {

    this.ScoringSide = scoringSide;
    this.KeepingSide = keepingSide;

    this.Formation = formations[formation];

    log('Formation =>', formations);

    const currentFormation = [...formations[formation]];

    // console.log('Current Formation for =>', this.ClubCode, currentFormation);

    // Sort them here...
    this.StartingSquad = sortFromKeeperDown(this.StartingSquad);

    // just change each startingswaud player to the new block position

    this.StartingSquad.forEach((player: FieldPlayer, i) => {
      // const startingBlock = fieldPlay[this.Formation[i]];
      // Find the first starting block that is for this player's position
      // const startingBlock = fieldPlay.find(())

      const { block: newStartingBlock, index: foundIndex } = this.getBlock(
        fieldPlay,
        player,
        currentFormation
      );

      // Sort players by position! Thank you Jesus!

      // log(
      //   `currentFormation & player =>
      //   ${currentFormation.length},
      //   ${p.Position}`
      // ); REVERT?

      // log(`index => ${foundIndex}`); REVERT?

      currentFormation.splice(foundIndex, 1);

      // console.log(`${player.ClubCode} ${player.LastName} [${player.Position}] [${player.BlockPosition.key}] new position => `, newStartingBlock);

      player.changePosition(newStartingBlock);
      player.changeStartingPosition(newStartingBlock);
      // return new FieldPlayer(p, true, startingBlock, ball);
    });
  }

  public resetFormation() {
    this.StartingSquad.forEach((player) => {
      player.changePosition(player.StartingPosition);
    });
  }

  public rollCall() {
    log('------ ======== -----');

    log('ROLL-CALL WAS ERE - DELETE SOON :)');

    // TODO: revert some of that log() stuff so that objects can print

    // log(
    //   this.StartingSquad.map((p) => ({
    //     Name: p.FirstName + ' ' + p.LastName,
    //     Club: p.ClubCode,
    //     Position: p.Position,
    //     Block: p.BlockPosition.key,
    //   }), 'table')
    // ); REVERT

    log('-----------');
  }

  public setStartingSquad(starting: IFieldPlayer[]) {
    this.StartingSquad = starting;
  }

  public getPlayerStats() {
    return this.StartingSquad.map((p) => ({ ...p.GameStats, Player: p._id }));
  }

  public setSubstitutes(subs: IFieldPlayer[]) {
    this.Substitutes = subs;
  }

  public matchSquad() {
    return null;
  }

  public getBlock(
    fp: IBlock[],
    p: PlayerInterface,
    formation: FormationItem[]
  ) {
    // TODO: CLEAN THIS UP

    // Find the first position where the player's position is accomadated
    if (formation.length === 1) {
      return { block: fp[formation[0].block], index: 0 };
    }
    let index = -1;
    let formationBlock = formation.find((pick, id) => {
      index = id;
      return pick.positions.includes(p.Position);
    });

    if (!formationBlock) {
      // give him something...
      formationBlock = formation[0];
    }

    // log(`player => ${p.PlayerID}, ${formationBlock}, ${p.Position}`); REVERT

    return { block: fp[formationBlock.block], index };
  }
}
