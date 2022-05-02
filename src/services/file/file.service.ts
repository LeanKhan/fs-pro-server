import { Router } from 'express';
import mongoose from 'mongoose';
import { uploader, tmp_uploader } from './multer.config';
import fs from 'fs';
import respond from '../../helpers/responseHandler';
import log from '../../helpers/logger';
import { createManyClubsFromCSV } from '../../controllers/clubs/club.controller';

const router = Router();

router.post('/', (req, res) => {
  if (req.file) {
    // Save images to database
    const img = fs.readFileSync(req.file.path);
    const encodedImg = img.toString('base64');

    const imageToSave = {
      contentType: req.file.mimetype,
      name: req.file.originalname,
      type: req.query.file_type,
      owner: req.query.file_owner,
      image: Buffer.from(encodedImg, 'base64'),
    };

    mongoose.connection.db
      .collection('uploads')
      .insertOne(imageToSave)
      .then((doc) => {
        log('Doc =>', doc);
        respond.success(res, 200, 'File uploaded successfully', doc);
      })
      .catch((err) => {
        log(`Error! => ${err}`);
        respond.fail(res, 400, 'FaiL!');
      });
  } else {
    log('No file sent!');
    respond.fail(res, 400, 'No file sent!');
  }
});

router.post('/upload', uploader, (req, res) => {
  return res.status(200).send(req.file);
});

router.post('/upload-clubs', tmp_uploader, createManyClubsFromCSV);

export default router;
