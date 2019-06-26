import { Match } from '../classes/Match';
import ClubModel, { Club } from '../models/club.model';
import Ball, { ICoordinate } from '../classes/Ball';
import { PlayingField } from '../GameState/ImmutableState/FieldGrid';
import {
  findClosestPlayer,
  findPath,
  calculateDifference,
} from '../utils/coordinates';
import { IFieldPlayer } from '../interfaces/Player';
import { MatchSide } from '../classes/MatchSide';
import Referee, {IReferee} from '../classes/Referee';

let Clubs: Club[] = [];

let match: Match;

const centerBlock = PlayingField[42];

const gameLoop = 90;

let AS: MatchSide;

let DS: MatchSide;

let activePlayerAS: IFieldPlayer;
let activePlayerDS: IFieldPlayer;

ClubModel.find({ ClubCode: { $in: ['RP', 'DR'] } }, (err, clubs) => {
  if (!err) {
    Clubs = clubs;
    match = new Match(Clubs[0], Clubs[1]);

    match.Home.setFormation('HOME-433', MatchBall, PlayingField);

    match.Away.setFormation('AWAY-433', MatchBall, PlayingField);

    // console.log('Home Starting Squad', match.Away.StartingSquad);
  }
});

const MatchBall: Ball = new Ball('#ffffff', centerBlock);

const MathReferee: IReferee = new Referee('Anjus', 'Banjus', 'normal');

function startMatch() {
  // match.Home.StartingSquad[4].move({ x: 0, y: 1 });
  // console.log(
  //   `Ball is at ${JSON.stringify(MatchBall.Position)}`,
  //   `Closest player in ${match.Away.Name} is ${
  //     findClosestPlayer(MatchBall.Position, match.Away.StartingSquad).LastName
  //   }`
  // );

  for (let i = 0; i < 8; i++) {
    console.log(`------------Loop Position ${i + 1}---------`);
    loop();
  }
}

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

function loop() {
  setPlayingSides();

  if (AS === undefined || DS === undefined) {
    // findClosestPlayer(MatchBall.Position, match.Home.StartingSquad);

    activePlayerAS = findClosestPlayer(
      MatchBall.Position,
      match.Away.StartingSquad
    );

    activePlayerAS.move(
      findPath(MatchBall.Position, activePlayerAS.BlockPosition)
    );

    // console.log(
    //   `Ball is at ${JSON.stringify(MatchBall.Position)}`,
    //   `Closest player in ${match.Away.Name} is ${JSON.stringify(
    //     activePlayerAS.BlockPosition
    //   )}`
    // );

    activePlayerDS = findClosestPlayer(
      MatchBall.Position,
      match.Home.StartingSquad
    );

    activePlayerDS.move(
      findPath(MatchBall.Position, activePlayerDS.BlockPosition)
    );

    // console.log(
    //   `Ball is at ${JSON.stringify(MatchBall.Position)}`,
    //   `Closest player in ${match.Home.Name} is at ${JSON.stringify(
    //     activePlayerDS.BlockPosition
    //   )}`
    // );
    console.log(`Ball is at ${JSON.stringify({
      x: MatchBall.Position.x,
      y: MatchBall.Position.y,
      occupant: MatchBall.Position.occupant
    })}
    ActivePlayerAS is ${activePlayerAS.FirstName} ${
      activePlayerAS.LastName
    } at ${JSON.stringify({
      x: activePlayerAS.BlockPosition.x,
      y: activePlayerAS.BlockPosition.y,
    })}
    ActivePlayerDS is ${activePlayerDS.FirstName} ${
      activePlayerDS.LastName
    } at ${JSON.stringify({
      x: activePlayerDS.BlockPosition.x,
      y: activePlayerDS.BlockPosition.y,
    })}
    `);
  } else {
    attackingAction(activePlayerAS);
    defendingAction(activePlayerDS);
    console.log(`Ball is at ${JSON.stringify({
      x: MatchBall.Position.x,
      y: MatchBall.Position.y,
    })}
    ActivePlayerAS is ${activePlayerAS.FirstName} ${
      activePlayerAS.LastName
    } at ${JSON.stringify({
      x: activePlayerAS.BlockPosition.x,
      y: activePlayerAS.BlockPosition.y,
    })}
    ActivePlayerDS is ${activePlayerDS.FirstName} ${
      activePlayerDS.LastName
    } at ${JSON.stringify({
      x: activePlayerDS.BlockPosition.x,
      y: activePlayerDS.BlockPosition.y,
    })}
    `);
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
    activePlayerDS = findClosestPlayer(MatchBall.Position, DS.StartingSquad);
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
    activePlayerDS = findClosestPlayer(MatchBall.Position, DS.StartingSquad);
  }
}

function attackingAction(activePlayer: IFieldPlayer) {
  const chance = Math.round(Math.random() * 100);

  if (chance > 50) {
    console.log(
      'Top the player',
      activePlayer.checkNextBlocks().top
    );
    console.log(
      'Left the player',
      activePlayer.checkNextBlocks().left
    );
    console.log(
      'Right the player',
      activePlayer.checkNextBlocks().right
    );
    console.log(
      'Bottom the player',
      activePlayer.checkNextBlocks().bottom
    );

    activePlayer.move({ x: 2, y: 0 });
  } else if (chance <= 50) {
    const teammate = findClosestPlayer(
      activePlayer.BlockPosition,
      AS.StartingSquad
    );

    activePlayer.pass(
      calculateDifference(teammate.BlockPosition, activePlayer.BlockPosition)
    );
  }
}

function defendingAction(activePlayer: IFieldPlayer) {
  const chance = Math.round(Math.random() * 100);

  if (chance > 50) {
    activePlayer.move({ x: 0, y: 0 });
  } else if (chance <= 50) {
    activePlayerDS = findClosestPlayer(MatchBall.Position, DS.StartingSquad);

    activePlayerDS.move(
      findPath(MatchBall.Position, activePlayerDS.BlockPosition)
    );
  }
}

setTimeout(() => {
  console.log('Match Starting...');

  startMatch();
}, 5000);

// match.start();
// console.log('From db', clubs);
// console.log('From class', Clubs);

/**
 * TODO:
 *
 * Remove any mention of 'Players' and replace with 'Squad' after testing! - LeanKhan
 */
