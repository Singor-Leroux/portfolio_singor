import { IUser } from '../models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export interface IRequestWithUser extends Request {
  user: IUser;
}
