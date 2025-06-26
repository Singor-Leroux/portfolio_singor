import { IUser } from '../../models/user.model';
import { Server as IOServer } from 'socket.io';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      file?: Express.Multer.File;
      io?: IOServer;
    }
  }
}

export interface IRequestWithUser extends Request {
  user: IUser;
  file?: Express.Multer.File;
  io?: IOServer;
}
