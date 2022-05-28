import { EventEmitter } from 'events';
import { IMatchEvent } from '../classes/Match';

const ballMove = new EventEmitter();

const matchEvents = new EventEmitter();

ballMove.setMaxListeners(24);
matchEvents.setMaxListeners(24);

/**
 * CreateMatchEvent...
 * TODO: use an object as parameter instead...
 * @param message
 * @param type
 * @param playerID
 * @param playerTeamID
 */

function createMatchEvent(
  match_id: string,
  message: IMatchEvent['message'],
  type: IMatchEvent['type'],
  playerID?: IMatchEvent['playerID'],
  playerTeamID?: IMatchEvent['playerTeamID']
) {
  matchEvents.emit(match_id + '-event', {
    message,
    type,
    playerID,
    playerTeamID,
  } as IMatchEvent);
}

export { ballMove, matchEvents, createMatchEvent };
