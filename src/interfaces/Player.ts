export interface FieldPlayer extends Player {
  Points: number;
  Starting: boolean;
  Substitute: boolean;
  BlockPosition: string | null;
  WithBall: boolean;
}

export interface Player {
  _id: string;
  FirstName: string;
  LastName: string;
  Age: string;
  Player_ID: string;
  Rating: number;
  GoalsScored: number;
  ShirtNumber: string;
  AttackingClass: number;
  DefensiveClass: number;
  GoalkeepingClass: number;
  Attributes: {};
  Value: number;
  ClubCode: string;
}
