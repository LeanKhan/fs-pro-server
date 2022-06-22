import { EventEmitter } from 'events';

class MatchManager extends EventEmitter {
    constructor() {
        super();
    }

    finish(fixture: any) {
        if(fixture.isFinalMatch) {
            // end the match
        }
    }
}