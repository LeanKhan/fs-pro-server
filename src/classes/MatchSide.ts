import { Club } from './Club';
import { IClub } from '../interfaces/Club';
import { IFieldPlayer, IPlayer } from '../interfaces/Player';
import FieldPlayer from './FieldPlayer';
import { IBlock } from '../state/ImmutableState/FieldGrid';
import Ball from './Ball';
// import {formations} from '../GameState/PersistentState/Formations';
// tslint:disable-next-line: no-var-requires
// const formations = require('../GameState/PersistentState/Formations');
import { formations } from '../state/PersistentState/Formations';

/** MatchSide
 *
 * Represents a team playing in a match.
 * @extends Club
 */

export class MatchSide extends Club implements IClub {
  public AttackingForm: number = 0;
  public DefensiveForm: number = 0;
  public ProbalityNumber: number = 0;
  public ChancesCreatedRate: number = 0;
  public ChancesCreatedNumber: number = 0;
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

  // Class methods

  public calculateForm(): void {
    this.AttackingForm = Math.round(Math.random() * 11) + 1;
    this.DefensiveForm = Math.round(Math.random() * 11) + 1;
  }

  public calculateCCN(): void {
    this.ChancesCreatedNumber = this.AttackingClass * this.ChancesCreatedRate;
  }

  /**
   * Calculate Chances Created Rate
   *
   * @param {number} _DC - Defensive Class of other team
   * @param {number} _DF - Defensive Form of other team
   */
  public calculateCCR(_DC: number, _DF: number): void {
    this.ChancesCreatedRate =
      (this.AttackingClass + this.AttackingForm) / (_DC + _DF);
  }

  public calculateProbalityNumber() {
    this.ProbalityNumber = Math.round(Math.random() * 11) + 1;
  }

  /** Calculate Goals team scored
   * @param {number} _DF - Defensive Form of other team
   */
  public calculateGoalsScored(_DF: number) {
    this.GoalsScored =
      ((this.ProbalityNumber - _DF) / 12) * this.ChancesCreatedNumber < 1
        ? 0
        : Math.round(
            ((this.ProbalityNumber - _DF) / 12) * this.ChancesCreatedNumber
          );
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
