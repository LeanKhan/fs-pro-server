import express from 'express';
import playerModel, { IPlayerModel } from '../models/player.model';

const playerRouter = express.Router();

// Get all players
playerRouter.get('/all', (req, res) => {
  playerModel.find({}, (err, results) => {
    if (!err) {
      res
        .status(200)
        .send(
          JSON.stringify({
            error: false,
            message: `${results.length} players fetched successfully`,
            result: results,
          })
        );
    } else {
      res
        .status(500)
        .send({
          error: true,
          message: 'Error in fetching players',
          error_message: err,
        });
    }
  });
});

// Create a new player
playerRouter.post('/new', (req, res) => {
  const NEW_PLAYER: IPlayerModel = new playerModel(req.body);

  NEW_PLAYER.save()
    .then((player: IPlayerModel) =>
      res
        .status(200)
        .send(
          JSON.stringify({
            error: false,
            message: `${player.FirstName} ${
              player.LastName
            } created successfully!`,
          })
        )
    )
    .catch(err =>
      res
        .status(500)
        .send(
          JSON.stringify({
            error: true,
            message: `Error in creating player`,
            err_message: err,
          })
        )
    );
});

export default playerRouter;
