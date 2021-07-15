// db.getCollection('PlayerMatchDetails').aggregate([{ $match: {Player: ObjectId("5f19972b3341d55e50a196b1")}},
// {
//     $group: { _id: '$Player', goals: {$sum:'$Goals'},
//     saves: {$sum:'$Saves'},
//     passes: {$sum:'$Passes'},
//     tackles: {$sum:'$Tackles'},
//     assists: {$sum:'$Assists'},
//     clean_sheets: {$sum: '$CleanSheets'},
//     dribbles: {$sum:'$Dribbles'},
//     points: {$avg:'$Points'},
//     form: {$avg:'$Form'}
// }}
// ])

// Thank you Jesus!
