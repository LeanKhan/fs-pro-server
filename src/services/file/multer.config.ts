import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      // req.fileTypeError = {error: true, message: "Only .png, .jpg and .jpeg format allowed!"}
      return cb(new Error('Only .png, .jpg and .jpeg formats allowed!'), false);
    }
  },
}).single('image');

export const multerUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload(req, res, err => {
    if (!err) {
      next();
    } else {
      res.status(400).send({
        error: true,
        message: 'Only .png, .jpg and .jpeg format allowed!',
        result: err,
      });
    }
  });
};
