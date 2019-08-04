import express from 'express';
import clubModel, { IClubModel } from '../models/club.model';

const clubRouter = express.Router();

clubRouter.get('/all', (req, res) => {
  clubModel.find({}, (err, doc) => {
    if (!err) {
      res.status(200).send(
        JSON.stringify({
          error: false,
          message: 'Clubs retrieved successfully!',
          result: doc,
        })
      );
    } else {
      res.status(400).send(JSON.stringify({ error: true, message: err }));
    }
  });
});

clubRouter.post('/new', (req, res) => {
  const NEW_CLUB: IClubModel = new clubModel(req.body);

  NEW_CLUB.save()
    .then((club: IClubModel) => {
      res.status(200).send(
        JSON.stringify({
          error: false,
          message: `${club.Name} created successfully!`,
          result: club,
        })
      );
    })
    .catch((err: any) =>
      res.status(500).send(
        JSON.stringify({
          error: true,
          message: 'Error in creating Club',
          err_message: err,
        })
      )
    );
});

clubRouter.get('/get/:id', (req, res) => {
  clubModel.findById(req.params.id, (err, club) => {
    if (!err) {
      res.status(200).send(
        JSON.stringify({
          error: false,
          message: 'Club fetched successfully',
          result: club,
        })
      );
    } else {
      res.status(404).send(
        JSON.stringify({
          error: true,
          message: 'Error in fetching club',
          error_message: err,
        })
      );
    }
  });
});

export default clubRouter;
