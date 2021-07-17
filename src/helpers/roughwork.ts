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
