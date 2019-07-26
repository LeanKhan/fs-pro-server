import { EventEmitter } from 'events';

const ballMove = new EventEmitter();

const matchEvents = new EventEmitter();

ballMove.setMaxListeners(24);
matchEvents.setMaxListeners(24);

export { ballMove, matchEvents };
