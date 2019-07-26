import { IFieldPlayer } from '../interfaces/Player';
import {matchEvents} from '../utils/events';

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

    public foul(subject: IFieldPlayer, object: IFieldPlayer){
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
            matchEvents.emit('game halt', {reason: 'yellow card', subject, object, interruption: true });
          } else if(chance < level) {
            matchEvents.emit('game halt', {reason: 'red card', subject, object, interruption: true });
          } else {
            matchEvents.emit('game halt', {reason: 'foul', subject, object, interruption: true });
          }
      
      }
}

export interface IReferee {
    FirstName: string,
    LastName: string,
    Difficulty: string,
    foul(subject: IFieldPlayer, object: IFieldPlayer): void
}