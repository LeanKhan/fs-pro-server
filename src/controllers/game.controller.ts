import { Match } from '../classes/Match';
import ClubModel, { IClubModel } from '../models/club.model';
import Ball, { IBlock } from '../classes/Ball';
import { PlayingField } from '../state/ImmutableState/FieldGrid';
import * as co from '../utils/coordinates';
import { IFieldPlayer } from '../interfaces/Player';
import { MatchSide } from '../classes/MatchSide';
import Referee, { IReferee } from '../classes/Referee';
import { Actions } from '../state/ImmutableState/Actions/Actions';
import { matchEvents } from '../utils/events';
// import { EventEmitter } from 'events';

let Clubs: IClubModel[] = [];

let match: Match;

const centerBlock = PlayingField[42];

// const gameLoop = 90;

let AS: MatchSide;

let DS: MatchSide;

let activePlayerAS: IFieldPlayer;
let activePlayerDS: IFieldPlayer;

// let matchInterruption: any;

// Sides

const homePost: IBlock = co.coordinateToBlock({ x: 11, y: 3 });
const awayPost: IBlock = co.coordinateToBlock({ x: 0, y: 3 });

ClubModel.find({ ClubCode: { $in: ['RP', 'DR'] } }, (err, clubs) => {
  if (!err) {
    Clubs = clubs;

    console.log(Clubs);

    match = new Match(Clubs[0], Clubs[1], awayPost, homePost);

    match.Home.setFormation('HOME-433', MatchBall, PlayingField);

    match.Away.setFormation('AWAY-433', MatchBall, PlayingField);

    MatchReferee.assignMatch(match);

    // console.log('Home Starting Squad', match.Home.StartingSquad);
  }
});

const MatchBall: Ball = new Ball('#ffffff', centerBlock);

const MatchReferee: IReferee = new Referee('Anjus', 'Banjus', 'normal');

const MatchActions: Actions = new Actions(MatchReferee);

function startMatch() {
  gamePlay();
}

async function gamePlay() {
  // match.Home.StartingSquad[4].move({ x: 0, y: 1 });
  // console.log(
  //   `Ball is at ${JSON.stringify(MatchBall.Position)}`,
  //   `Closest player in ${match.Away.Name} is ${
  //     findClosestPlayer(MatchBall.Position, match.Away.StartingSquad).LastName
  //   }`
  // );

  for (let i = 0; i < 24; i++) {
    /*
 * The game loop works in a way whereby each loop presents an opportunity
 for either side to make an action. Each action has a reaction.
 
 key:
 [n] where n is loop location
 Attacking Side (AS) is the side with the ball
 Defensive Side (DS) is the side without the ball

 [1] 
  - AS action: move ball 1 block
  - DS reaction: move defender 1 block

 [2] 
  - AS action: pass ball 2 blocks right
  - DS reaction: move defender 2 blocks right or something :3

 */
    // Set Match time in Match

    console.log(`------------Loop Position ${i + 1}---------`);
    setPlayingSides();

    match.setCurrentTime(i);

    if (AS === undefined || DS === undefined) {
      moveTowardsBall();
    } else {
      MatchActions.takeAction(activePlayerAS, AS, DS, activePlayerDS);
      // setPlayingSides();
      // console.log(interruption);
    }

    matchComments();

    // loop();
  }
}

function setPlayingSides() {
  if (
    match.Home.StartingSquad.find(p => {
      return p.WithBall;
    })
  ) {
    AS = match.Home as MatchSide;

    // Set the activePlayer in the attacking team to be the player with
    // the ball
    activePlayerAS = match.Home.StartingSquad.find(p => {
      return p.WithBall;
    }) as IFieldPlayer;

    DS = match.Away as MatchSide;

    // Set the activePlayer in the defending team to be the player closest to
    // the ball
    activePlayerDS = co.findClosestFieldPlayer(
      MatchBall.Position,
      DS.StartingSquad
    );
    // return {activePlayerAS, AS, activePlayerDS, DS};
  } else if (
    match.Away.StartingSquad.find(p => {
      return p.WithBall;
    })
  ) {
    AS = match.Away as MatchSide;

    // Set the activePlayer in the attacking team to be the player with
    // the ball
    activePlayerAS = match.Away.StartingSquad.find(p => {
      return p.WithBall;
    }) as IFieldPlayer;

    DS = match.Home as MatchSide;

    // Set the activePlayer in the defending team to be the player closest to
    // the ball
    activePlayerDS = co.findClosestFieldPlayer(
      MatchBall.Position,
      DS.StartingSquad
    );
    // return {activePlayerAS, AS, activePlayerDS, DS};
  }
  // MatchActions.setSides(activePlayerAS, AS, activePlayerDS, DS);
  return { activePlayerAS, AS, activePlayerDS, DS };
}

/**
 * Here, everyone moves towards the ball
 */
function moveTowardsBall() {
  activePlayerAS = co.findClosestFieldPlayer(
    MatchBall.Position,
    match.Home.StartingSquad
  );

  MatchActions.move(activePlayerAS, 'towards ball', MatchBall.Position);

  activePlayerDS = co.findClosestFieldPlayer(
    MatchBall.Position,
    match.Away.StartingSquad
  );

  MatchActions.move(activePlayerDS, 'towards ball', MatchBall.Position);

  // matchComments();
}

function listenForMatchEvents() {
  matchEvents.on('set-playing-sides', () => {
    console.log('*---- setting playing sides ----*');

    const playingSides = setPlayingSides();

    matchEvents.emit('setting-playing-sides', playingSides);
  });
}

// function attackingAction() {
//   MatchActions.takeAction(activePlayerAS, AS, DS, activePlayerDS);
// }

// function defendingAction() {
//   // After every attempt by the AttackingSide the defensive side should move towards the ball
//   MatchActions.move(activePlayerDS, 'towards ball', MatchBall.Position);

//   pushForward(AS);
// }

function matchComments() {
  console.log(`Ball is at ${JSON.stringify({
    x: MatchBall.Position.x,
    y: MatchBall.Position.y,
    key: MatchBall.Position.key,
  })}
  ActivePlayerAS is ${activePlayerAS.FirstName} ${
    activePlayerAS.LastName
  } at ${JSON.stringify({
    x: activePlayerAS.BlockPosition.x,
    y: activePlayerAS.BlockPosition.y,
    key: activePlayerAS.BlockPosition.key,
  })}
  ActivePlayerDS is ${activePlayerDS.FirstName} ${
    activePlayerDS.LastName
  } at ${JSON.stringify({
    x: activePlayerDS.BlockPosition.x,
    y: activePlayerDS.BlockPosition.y,
    key: activePlayerDS.BlockPosition.key,
  })}
  `);
}

// listenForMatchEvents();

// // setTimeout(() => {
// //   console.log('Match Starting...');

// //   startMatch();
// // }, 5000);

// match.start();
// console.log('From db', clubs);
// console.log('From class', Clubs);

/**
 * TODO:
 *
 * Remove any mention of 'Players' and replace with 'Squad' after testing! - LeanKhan
 */
