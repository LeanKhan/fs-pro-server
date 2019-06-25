import { EventEmitter } from 'events';

const ballMove = new EventEmitter();

ballMove.setMaxListeners(24);

export { ballMove };
