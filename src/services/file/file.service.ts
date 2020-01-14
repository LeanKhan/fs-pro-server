import { Router } from 'express';
import mongoose from 'mongoose';
import { multerUpload } from './multer.config';
import fs from 'fs';
import responseHandler from '../../helpers/responseHandler';

const router = Router();

router.post('/', multerUpload, (req, res) => {
  if (req.file) {
    // Save images to database
    const img = fs.readFileSync(req.file.path);
    const encodedImg = img.toString('base64');

    const imageToSave = {
      contentType: req.file.mimetype,
      name: req.file.originalname,
      type: req.query.file_type,
      owner: req.query.file_owner,
      image: new Buffer(encodedImg, 'base64'),
    };

    mongoose.connection.db
      .collection('uploads')
      .insertOne(imageToSave)
      .then(doc => {
        console.log('Doc =>', doc);
        responseHandler.success(res, 200, 'File uploaded successfully', doc);
      })
      .catch(err => {
        console.log('Error!', err);
        responseHandler.fail(res, 400, 'FaiL!');
      });
  } else {
    console.log('No file sent!');
    responseHandler.fail(res, 400, 'No file sent!');
  }
});

export const fileRouter = router;
