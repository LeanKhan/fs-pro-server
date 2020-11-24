import { Router } from 'express';
// import App from '../app';
import respond from '../../helpers/responseHandler';
import { restPlayGame, restUpdateStandings } from './game.controller';

const router = Router();

// const _App = new App();

router.post('/play', (req, res) => {
  //   const response = fetchOneById(req.params.id);
  const clubs = req.body.clubs || ['RP', 'IB'];

  const sides = req.body.sides;

  console.log('clubs => ', clubs);

  // const game = await _App.setupGame(clubs, sides);

  // game.getMatch().Events.forEach((event) => {
  //   setTimeout(() => {
  //     io.emit('match-event', event);
  //   }, 1200);
  // });

  // io.emit('match-ended', {
  //   details: game.getMatch().Details,
  //   home: game.getMatch().Home.ClubCode,
  //   away: game.getMatch().Away.ClubCode,
  // });

  respond.success(res, 200, 'Match played');
});

router.get('/kickoff', restPlayGame, restUpdateStandings);

// router.get('/kickoff', async (req, res) => {
//   const { fixture_id } = req.query;

//   const query = { 'Matches.Fixture': Types.ObjectId(fixture_id) };

//   findOne(query, false)
//     .then((day) => {
//       console.log('Day =>', day);

//       // Then find the array position...
//       const matchIndex = day.Matches.findIndex(
//         (m) => m.Fixture.toString() === fixture_id
//       );

//       console.log('Match =>', day.Matches[matchIndex]);

//       respond.success(res, 200, 'Day found :)', day);
//     })
//     .catch((err) => {
//       console.log('err =>', err);
//       respond.fail(res, 404, 'Day not found :(');
//     });
// });

// findOne(query, false).then(
//     day => {
// console.log('Day =>', day)
//     }
//   )
//   .catch(err => {
//     console.log('err =>',err);
//   });

export default router;
