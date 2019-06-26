import { EventEmitter } from 'events';

const ballMove = new EventEmitter();

const moveEvents = new EventEmitter();

ballMove.setMaxListeners(24);
moveEvents.setMaxListeners(24);

export { ballMove, moveEvents };
