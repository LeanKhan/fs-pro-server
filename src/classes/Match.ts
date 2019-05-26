import {Team} from './Team';
import {MatchSide} from './MatchSide';

export interface MatchDetails {
    Title: string,
    LeagueString: string,
    Draw: boolean,
    Played: boolean,
    Time: Date,
    HomeTeamScore: number,
    AwayTeamScore: number,
    Winner: string | null,
    Loser: string | null,
    HomeTeamDetails: {},
    AwayTeamDetails: {}
}

/**
 * Match Interface bro!
 */
export interface Match {
    Home: MatchSide,
    Away: MatchSide,
    Details: MatchDetails,
    Events: {},
    report():void,
    start():void
}

export class Match implements Match {
    public Home: MatchSide;
    public Away: MatchSide;

    constructor(home: Team, away: Team){
        this.Home = new MatchSide(home.Name, home.AttackingClass, home.DefensiveClass);
        this.Away = new MatchSide(away.Name, away.AttackingClass, away.DefensiveClass);
    }

    /** Create match report */
    public report(){
        if (this.Home.GoalsScored === this.Away.GoalsScored) {
            this.Details.Winner = null;
            this.Details.Loser = null;
            this.Details.Draw = true;
          } else if (this.Home.GoalsScored > this.Away.GoalsScored) {
            this.Details.Winner = this.Home.Name;
            this.Details.Loser = this.Away.Name;
          } else {
            this.Details.Winner = this.Away.Name;
            this.Details.Loser = this.Home.Name;
          }
        this.Details.Time = new Date();
        this.Details.Title = `${this.Home.Name} vs ${this.Away.Name} <-> ${this.Details.Time}`;
        this.Details.HomeTeamDetails = {
            ChancesCreatedRate: this.Home.ChancesCreatedRate,
            ChancesCreatedNumber: this.Home.ChancesCreatedNumber,
            ProbabilityNumber: this.Home.ProbalityNumber,
            DefensiveForm: this.Home.DefensiveForm,
            AttackingForm: this.Home.AttackingForm,
            DefensiveClass: this.Home.DefensiveClass,
            AttackingClass: this.Home.AttackingClass
          };
        this.Details.AwayTeamDetails = {
            ChancesCreatedRate: this.Away.ChancesCreatedRate,
            ChancesCreatedNumber: this.Away.ChancesCreatedNumber,
            ProbabilityNumber: this.Away.ProbalityNumber,
            DefensiveForm: this.Away.DefensiveForm,
            AttackingForm: this.Away.AttackingForm,
            DefensiveClass: this.Away.DefensiveClass,
            AttackingClass: this.Away.AttackingClass
        };
    }

    /** Start match */
    public start(){
        this.Home.calculateForm();
        this.Away.calculateForm();

        this.Home.calculateCCR(this.Away.DefensiveClass, this.Away.DefensiveForm);
        this.Away.calculateCCR(this.Home.DefensiveClass, this.Home.DefensiveForm);

        this.Home.calculateCCN();
        this.Away.calculateCCN();

        this.Home.calculateGoalsScored(this.Away.DefensiveForm);
        this.Away.calculateGoalsScored(this.Home.DefensiveForm);
    }

}

