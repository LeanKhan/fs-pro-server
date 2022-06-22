/* eslint-disable @typescript-eslint/restrict-template-expressions */
import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     log(req);
//     cb(null, path.join(__dirname, "../../../assets/img"));
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });

// export const upload = multer({
//   storage
// });

export function uploader(request: Request, res: Response, next: NextFunction) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(
        null,
        path.join(__dirname, `../../../assets/img${request.query.filepath}`)
      );
    },
    filename: (req, file, cb) => {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      cb(null, request.query.filename + path.extname(file.originalname));
    },
  });

  const upload = multer({
    storage,
  }).single('image');

  upload(request, res, (err) => {
    if (!err) {
     return next();
    }

    console.log('Error uploading file!');
    console.error(err);
    return res.status(400).send(err);
  });
}

export function tmp_uploader(
  request: Request,
  res: Response,
  next: NextFunction
) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null,
        path.join(__dirname, `../../../tmp/uploads`)
      );
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname.split('.')[0] + path.extname(file.originalname));
    },
  });

  const upload = multer({
    storage,
  }).single('file');

  upload(request, res, (err) => {
    if (!err) {
      return next();
    }

    console.log('Error uploading file! => ', err);
    return res.status(400).send(err);
  });
}

//     "dev": "set NODE_ENV=dev && ts-node-dev --trace --respawn --transpileOnly ./src/server.ts",

// export const uploaderMiddlware = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   return uploader(req.query.club_code, req.query.path);
//   // next();
// };

// export const multerUpload = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   upload(req, res, err => {
//     if (!err) {
//       next();
//     } else {
//       res.status(400).send({
//         error: true,
//         message: 'Only .png, .jpg and .jpeg format allowed!',
//         result: err,
//       });
//     }
//   });
// };

/**
 fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, false);
    } else {
      cb(null, true);
      // req.fileTypeError = {error: true, message: "Only .png, .jpg and .jpeg format allowed!"}
      return cb(new Error('Only .png, .jpg and .jpeg formats allowed!'), false);
    }
  },
*/
