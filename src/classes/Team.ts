export interface Team {
    Name: string,
    AttackingClass: number,
    DefensiveClass: number,
    Squad: []
}

export class Team {
    public Name: string;
    public AttackingClass: number;
    public DefensiveClass: number;
    public Squad: [] = [];
    constructor(name: string, aC: number, dC: number){
        this.Name = name;
        this.AttackingClass = aC;
        this.DefensiveClass = dC;
    }
}