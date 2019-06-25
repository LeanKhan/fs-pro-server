import {ICoordinate} from '../classes/Ball';
import {IFieldPlayer} from '../interfaces/Player';
/**
 * Returns the tile index of the given coordinates
 * 
 * @param x 
 * @param y 
 * @param mapWidth 
 */

function XYToIndex(x:number, y:number, mapWidth: number): number {
    return y * mapWidth + x;
}

/**
 * Returns the x and y coordinates of the tile
 * @param index 
 * @param mapWidth 
 */
function indexToXY(index: number, mapWidth:number): ICoordinate {
    const i = {x: 0 , y: 0};

    i.x = index / mapWidth;
    
    i.y = Math.floor(index/mapWidth);

    return i;
}


/**
 * Find closest player
 * @param ref 
 * @param players 
 */
function findClosestPlayer(ref: ICoordinate, players: IFieldPlayer[]) {
    const plyrs = players;
  
    plyrs.sort((a, b) => {
      return calculateDistance(ref, a.BlockPosition) <
        calculateDistance(ref, b.BlockPosition)
        ? -1
        : 1;
    });
    return plyrs[0];
}
/**
 * Find the absolute distance between two coordinates
 * less is better :)
 * 
 * @param {ICoordinate} ref  - Coordinate you are comparing with
 * @param {ICoordinate} pos - Coordinate you are comparing with reference
 */


 function calculateDistance(ref:ICoordinate, pos:ICoordinate): number{
    return Math.abs(pos.x - ref.x) + Math.abs(pos.y - ref.y);
 }

function findPath(ref: ICoordinate, pos:ICoordinate): ICoordinate{
    const path:ICoordinate = {x: 0, y: 0};
    const x = ref.x - pos.x;
    const y = ref.y - pos.y;

    if(x !== 0){
      path.x = x < 0 ? -1 : 1;
    }else if(y !== 0){
        path.y = y < 0 ? -1 : 1; 
    }

    return path;
}

export {XYToIndex, indexToXY, calculateDistance, findClosestPlayer, findPath}