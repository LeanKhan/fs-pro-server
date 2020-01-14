import { Club } from './Club';
import { IClub } from '../interfaces/Club';
import { IFieldPlayer, IPlayer } from '../interfaces/Player';
import FieldPlayer from './FieldPlayer';
import { IBlock } from '../state/ImmutableState/FieldGrid';
import Ball from './Ball';
import { formations } from '../state/PersistentState/Formations';

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
  public Formation: any[] = [];
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

  public setFormation(formation: string, ball: Ball, fieldPlay: any) {
    this.Formation = formations[formation];

    this.StartingSquad = this.Players.map((p: IPlayer, i) => {
      const startingBlock = fieldPlay[this.Formation[i]];
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

  // TODO: Add a public function to change ScoringSide
  // after a half has passed.

  public setStartingSquad(starting: IFieldPlayer[]) {
    this.StartingSquad = starting;
  }

  public setSubstitutes(subs: any[]) {
    this.Substitutes = subs;
  }

  public matchSquad() {
    return null;
  }
}
