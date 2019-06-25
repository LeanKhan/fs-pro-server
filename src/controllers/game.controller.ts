import { Match } from '../classes/Match';
import ClubModel, { Club } from '../models/club.model';
import Ball, { ICoordinate } from '../classes/Ball';
import { PlayingField } from '../GameState/ImmutableState/FieldGrid';
import { findClosestPlayer, findPath } from '../utils/coordinates';
import { IFieldPlayer } from '../interfaces/Player';

let Clubs: Club[] = [];

let match: Match;

const centerBlock = PlayingField[42];

const gameLoop = 90;

let AS: any;

let DS: any;

const MatchBall: Ball = new Ball('#ffffff', centerBlock);

console.log('Stating match...');

ClubModel.find({ ClubCode: { $in: ['RP', 'DR'] } }, (err, clubs) => {
  if (!err) {
    Clubs = clubs;
    match = new Match(Clubs[0], Clubs[1]);

    match.Home.setFormation('HOME-433', MatchBall, PlayingField);

    match.Away.setFormation('AWAY-433', MatchBall, PlayingField);

    // console.log('Home Starting Squad', match.Away.StartingSquad);
  }
});

function startMatch() {
  // match.Home.StartingSquad[4].move({ x: 0, y: 1 });
  // console.log(
  //   `Ball is at ${JSON.stringify(MatchBall.Position)}`,
  //   `Closest player in ${match.Away.Name} is ${
  //     findClosestPlayer(MatchBall.Position, match.Away.StartingSquad).LastName
  //   }`
  // );
  for (let i = 0; i < 6; i++) {
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
  let activePlayerAS: IFieldPlayer;
  let activePlayerDS: IFieldPlayer;

  if (AS === undefined || DS === undefined) {
    // findClosestPlayer(MatchBall.Position, match.Home.StartingSquad);

    activePlayerAS = findClosestPlayer(
      MatchBall.Position,
      match.Away.StartingSquad
    );

    activePlayerAS.move(
      findPath(MatchBall.Position, activePlayerAS.BlockPosition)
    );

    console.log(
      `Ball is at ${JSON.stringify(MatchBall.Position)}`,
      `Closest player in ${match.Away.Name} is ${JSON.stringify(
        activePlayerAS.BlockPosition
      )}`
    );

    activePlayerDS = findClosestPlayer(
      MatchBall.Position,
      match.Home.StartingSquad
    );

    activePlayerDS.move(
      findPath(MatchBall.Position, activePlayerDS.BlockPosition)
    );

    console.log(
      `Ball is at ${JSON.stringify(MatchBall.Position)}`,
      `Closest player in ${match.Home.Name} is at ${JSON.stringify(
        activePlayerDS.BlockPosition
      )}`
    );
  }
}

function setPlayingSides() {
  if (
    match.Home.StartingSquad.find(p => {
      return p.WithBall;
    })
  ) {
    AS = match.Home;
    DS = match.Away;
  } else if (
    match.Away.StartingSquad.find(p => {
      return p.WithBall;
    })
  ) {
    AS = match.Away;
    DS = match.Home;
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
