import { IFieldPlayer } from '../interfaces/Player';
import {moveEvents} from '../utils/events';

export default class Referee {
    public FirstName: string;
    public LastName: string;
    // public RefID: string;
    public Difficulty: string;

    constructor(fname: string, lname: string, diff: string){
        this.FirstName = fname;
        this.LastName = lname;
        this.Difficulty = diff;
    }

    public foul(tackler: IFieldPlayer){
        const chance = Math.round(Math.random() * 12);
        let level = 0;
        switch (this.Difficulty) {
            case 'tough':
                level = 8;
                break;
        
            case 'lenient':
                level = 4
                break;
            case 'normal':
                level = 6
                break;
        }
          if(chance >= level){
            moveEvents.emit('yellow card', tackler);
          } else if(chance < level) {
            moveEvents.emit('red card', tackler);
          } else {
            moveEvents.emit('foul', tackler);
          }
      
      }
}

export interface IReferee {
    FirstName: string,
    LastName: string,
    Difficulty: string,
    foul(tackler: IFieldPlayer): void
}