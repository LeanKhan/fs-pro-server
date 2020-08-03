import { Club } from './Club';
import { IFieldPlayer, IPlayer } from '../interfaces/Player';
import FieldPlayer from './FieldPlayer';
import { IBlock } from '../state/ImmutableState/FieldGrid';
import Ball from './Ball';
import { formations, FormationItem } from '../state/PersistentState/Formations';
import Player from './Player';
import { ClubInterface } from '../controllers/clubs/club.model';
import { sortFromKeeperDown } from '../utils/players';

/** MatchSide
 *
 * Represents a team playing in a match.
 * @extends Club
 */

export class MatchSide extends Club {
  public AttackingForm: number = 0;
  public DefensiveForm: number = 0;
  public GoalsScored: number = 0;
  public StartingSquad: IFieldPlayer[] = [];
  public Substitutes: IFieldPlayer[] = [];
  public MatchSquad: IPlayer[] = [];
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
    this.MatchSquad = this.Players.map((p: IPlayer, i) => {
      return new Player(p);
    });
  }

  public setFormation(formation: string, ball: Ball, fieldPlay: IBlock[]) {
    this.Formation = formations[formation];

    const currentFormation = [...formations[formation]];

    // Sort them here...
    this.MatchSquad = sortFromKeeperDown(this.MatchSquad);

    this.StartingSquad = this.MatchSquad.map((p: IPlayer, i) => {
      // const startingBlock = fieldPlay[this.Formation[i]];
      // Find the first starting block that is for this player's position
      // const startingBlock = fieldPlay.find(())

      const { block: startingBlock, index: foundIndex } = this.getBlock(
        fieldPlay,
        p,
        currentFormation
      );

      // Sort players by position! Thank you Jesus!

      console.log(
        'currentFormation & player => ',
        currentFormation.length,
        p.Position
      );

      console.log('index => ', foundIndex);

      currentFormation.splice(foundIndex, 1);

      return new FieldPlayer(p, true, startingBlock, ball);
    });
  }

  public resetFormation() {
    this.StartingSquad.forEach((player) => {
      player.changePosition(player.StartingPosition);
    });
  }

  public rollCall() {
    console.log('------ ======== -----');

    console.table(
      this.StartingSquad.map((p) => ({
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

  public getPlayerStats() {
    return this.StartingSquad.map((p) => ({ ...p.GameStats, _id: p._id }));
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
    let formationBlock = formation.find((pick, id) => {
      index = id;
      return pick.positions.includes(p.Position);
    });

    if (!formationBlock) {
      // give him something...
      formationBlock = formation[0];
    }

    console.log('player =>', p.PlayerID, formationBlock, p.Position);

    return { block: fp[formationBlock!.block], index };
  }
}
