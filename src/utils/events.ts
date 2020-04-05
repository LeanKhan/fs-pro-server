import { EventEmitter } from 'events';
import { IMatchEvent } from '../classes/Match';

const ballMove = new EventEmitter();

const matchEvents = new EventEmitter();

ballMove.setMaxListeners(24);
matchEvents.setMaxListeners(24);

function createMatchEvent(message: IMatchEvent['message'], type: IMatchEvent['type'], playerID?: IMatchEvent['playerID']) {
    matchEvents.emit('event', {message, type, playerID} as IMatchEvent);
}

export { ballMove, matchEvents, createMatchEvent };
