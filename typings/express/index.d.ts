// import { Request } from 'express';
import { Server } from 'socket.io';

declare module 'express-serve-static-core' {
  interface Request {
    io?: Server;
  }

  interface Router {
    [key: string]: any;
  }
}
