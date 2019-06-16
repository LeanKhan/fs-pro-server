import {IFieldPlayer} from '../interfaces/Player';
import Player from './Player';
import Ball from './Ball';
import {ICoordinate, IBlock} from './Ball';

export default class FieldPlayer extends Player implements IFieldPlayer {
    public Points: number = 0;
    public Starting: boolean;
    public Substitute: boolean;
    public BlockPosition: IBlock;
    public StartingPosition: ICoordinate | null;
    public BallPosition: ICoordinate;
    public WithBall: boolean;
    private Ball: Ball;

    constructor(player:any, starting: boolean, pos:IBlock, ball:Ball){
        super(player);
        this.Starting = starting;
        this.Ball = ball;
        this.BallPosition = this.Ball.Position;
        this.Substitute = !this.Starting;
        this.StartingPosition = pos;
        this.BlockPosition = pos;
        this.WithBall = this.BlockPosition.x === this.BallPosition.x && this.BlockPosition.y === this.BallPosition.y ? true : false
    }

    public pass(pos:ICoordinate){
        this.Ball.move(pos);
        this.WithBall = false;
    }

    public shoot(){
        this.WithBall = false;
    }

    public updateBallPosition(pos:ICoordinate){
        this.Ball.Position = pos;
    }

    public move(pos:ICoordinate):string{
        this.BlockPosition.x += pos.x;
        this.BlockPosition.y += pos.y;
        if(this.WithBall){
            this.Ball.move(pos);
        }
        return `${this.FirstName} ${this.LastName} moved here ${JSON.stringify(this.BlockPosition)}`;
    }

    public substitute(){
        this.Starting = false;
    }

    public start(){
        this.Starting = true;
    }
   
}