import express from 'express';
import clubModel, { Club } from '../models/club.model';

const clubRouter = express.Router();

clubRouter.get('/all', (req, res) => {
  clubModel.find({}, (err, doc) => {
    if (!err) {
      res
        .status(200)
        .send(
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

export default clubRouter;
