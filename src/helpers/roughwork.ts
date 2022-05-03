/** ROUGHWORK -> You can keep code you don't want to lose here idk :) thank you Jesus! */

// Thank you Jesus!

/**
 * db.getCollection('PlayerMatchDetails').aggregate([
  {
   $lookup: {
      from: 'Fixtures',
      localField: 'Fixture',
      foreignField: '_id',
      as: 'fixture',
    },
  },
  { $unwind: '$fixture' },
  {
    $lookup: {
      from: 'Seasons',
      localField: 'fixture.Season',
      foreignField: '_id',
      as: 'season',
    },
  },
  { $unwind: '$season' },
  { $match: { 'season.Year': 'CUU-2021' } }
])
 */

// ALL TOGETHER NOW //

/**
 * db.getCollection('PlayerMatchDetails').aggregate([
  {
   $lookup: {
      from: 'Fixtures',
      localField: 'Fixture',
      foreignField: '_id',
      as: 'fixture',
    },
  },
  { $unwind: '$fixture' },
  {
    $lookup: {
      from: 'Seasons',
      localField: 'fixture.Season',
      foreignField: '_id',
      as: 'season',
    },
  },
  { $unwind: '$season' },
  { $match: { 'season.Year': 'CUU-2021' } }, // Filter by the Year
  {
    $group: { _id: '$Player', goals: {$sum:'$Goals'},
    saves: {$sum:'$Saves'},
    passes: {$sum:'$Passes'},
    tackles: {$sum:'$Tackles'},
    assists: {$sum:'$Assists'},
    clean_sheets: {$sum: '$CleanSheets'},
    dribbles: {$sum:'$Dribbles'},
    points: {$avg:'$Points'},
    form: {$avg:'$Form'}
}},
 {
    $lookup: {
      from: 'Players',
      localField: '_id',
      foreignField: '_id',
      as: 'player',
    },
  }, // Get the Player's details
  { $unwind: '$player' }
])
 */

 function arrange(matches_in_week, Fixture, Day) {
      debugger;
      if (matches_in_week > 0 && matches_in_week <= 3){
      for (let a = 0;a < matches_in_week; a++){
        console.log(`Putting Fixture ${Fixture} in Day ${Day}`);
        Fixture++;
      }

      matches_in_week -= matches_in_week;
    }

    if (matches_in_week >= 5){
      // Fixture += 2;
      for (let b = 0;b < 5; b++){
        console.log(`Putting Fixture ${Fixture} in Day ${Day}`);
        Fixture++;
      }

      matches_in_week -= 5;
    }

    // finished arranging in current Day.
    Day += 1;

    if (Day % 2 == 0) {
      Day += 1; // skip a day
    }

    console.log(`Skipping Day ${Day}...`);

    console.log(`--- Now in Day ${Day} ---`);

    if (matches_in_week != 0){
      return arrange(matches_in_week, Fixture, Day);      
    }

    return {Fixture, Day};
 }

const MatchesInWeek = 7;
const NumberOfWeeks = 3;

function setupDays() {
  let Day = 1;
  let Fixture = 1;

  let TotalFixtures = MatchesInWeek * NumberOfWeeks;
  let TotalDays = 20;

  while (Fixture <= TotalFixtures) {
    let matches_in_week = MatchesInWeek;

    ({Fixture, Day} = arrange(matches_in_week, Fixture, Day));

  }
}