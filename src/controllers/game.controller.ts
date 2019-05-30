import { Match } from '../classes/Match';
import ClubModel, { Club } from '../models/club.model';

let Clubs: Club[] = [];

ClubModel.find({ ClubCode: { $in: ['RP', 'DR'] } }, (err, clubs) => {
  if (!err) {
    Clubs = clubs;
    const match: Match = new Match(Clubs[0], Clubs[1]);

    match.Home.setFormation('HOME-433');

    match.Away.setFormation('AWAY-433');

    console.log('Home Starting Squad', match.Home.StartingSquad);

    // match.start();
    // console.log('From db', clubs);
    // console.log('From class', Clubs);
  }
});

/**
 * TODO:
 *
 * Remove any mention of 'Players' and replace with 'Squad' after testing! - LeanKhan
 */
