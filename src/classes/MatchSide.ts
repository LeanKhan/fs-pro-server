import { Club } from './Club';
import { IClub } from '../interfaces/Club';
import { IFieldPlayer, IPlayer } from '../interfaces/Player';
import FieldPlayer from './FieldPlayer';
import { IBlock } from '../state/ImmutableState/FieldGrid';
import Ball from './Ball';
import { formations, FormationItem } from '../state/PersistentState/Formations';

/** MatchSide
 *
 * Represents a team playing in a match.
 * @extends Club
 */

export class MatchSide extends Club implements IClub {
  public AttackingForm: number = 0;
  public DefensiveForm: number = 0;
  public GoalsScored: number = 0;
  public StartingSquad: IFieldPlayer[] = [];
  public Substitutes: IFieldPlayer[] = [];
  public MatchSquad: IFieldPlayer[] = [];
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

  constructor(club: Club, scoringSide: IBlock, keepingSide: IBlock) {
    super(club);
    this.ScoringSide = scoringSide;
    this.KeepingSide = keepingSide;
  }

  public setFormation(formation: string, ball: Ball, fieldPlay: IBlock[]) {
    this.Formation = formations[formation];

    const currentFormation = formations[formation];

    this.StartingSquad = this.Players.map((p: IPlayer, i) => {
      // const startingBlock = fieldPlay[this.Formation[i]];
      // Find the first starting block that is for this player's position
      // const startingBlock = fieldPlay.find(())

      const { block: startingBlock, index: foundIndex } = this.getBlock(
        fieldPlay,
        p,
        currentFormation
      );

      currentFormation.splice(foundIndex, 1);

      const player = new FieldPlayer(p, true, startingBlock, ball, this);
      return player;
    });
  }

  public resetFormation() {
    this.StartingSquad.forEach(player => {
      player.changePosition(player.StartingPosition);
    });
  }

  public rollCall() {
    console.log('------ ======== -----');

    console.table(
      this.StartingSquad.map(p => ({
        Name: p.FirstName + ' ' + p.LastName,
        Club: p.ClubCode,
        Position: p.Position,
        Block: p.BlockPosition.key,
      }))
    );

    console.log('-----------');
  }

  public setStartingSquad(starting: IFieldPlayer[]) {
    this.StartingSquad = starting;
  }

  public setSubstitutes(subs: any[]) {
    this.Substitutes = subs;
  }

  public matchSquad() {
    return null;
  }

  public getBlock(fp: IBlock[], p: IPlayer, formation: FormationItem[]) {
    // TODO: CLEAN THIS UP

    // Find the first position where the player's position is accomadated
    if (formation.length === 1) {
      return { block: fp[formation[0].block], index: 0 };
    }
    let index = -1;
    const formationBlock = formation.find((pick, id) => {
      index = id;
      return pick.positions.includes(p.Position);
    });

    return { block: fp[formationBlock!.block], index };
  }
}
