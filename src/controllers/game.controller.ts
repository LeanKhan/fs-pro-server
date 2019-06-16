import { Match } from '../classes/Match';
import ClubModel, { Club } from '../models/club.model';
import Ball from '../classes/Ball';
import { PlayingField } from '../GameState/ImmutableState/FieldGrid';

let Clubs: Club[] = [];

let match: Match;

const centerBlock = PlayingField[42];

const MatchBall: Ball = new Ball('#ffffff', centerBlock);

console.log('Stating match...');

ClubModel.find({ ClubCode: { $in: ['RP', 'DR'] } }, (err, clubs) => {
  if (!err) {
    Clubs = clubs;
    match = new Match(Clubs[0], Clubs[1]);

    match.Home.setFormation('HOME-433', MatchBall, PlayingField);

    match.Away.setFormation('AWAY-433', MatchBall, PlayingField);

    console.log('Home Starting Squad', match.Home.StartingSquad);
  }
});

function startMatch(){
  console.log(match.Home.StartingSquad[4].move({x:0, y:1}));
}

setTimeout(()=>{
  console.log("Match Starting...");

  startMatch();
}, 5000)

// match.start();
// console.log('From db', clubs);
// console.log('From class', Clubs);

/**
 * TODO:
 *
 * Remove any mention of 'Players' and replace with 'Squad' after testing! - LeanKhan
 */
