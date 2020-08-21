import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { HttpException } from '../exceptions';
import { Controller } from '../classes';
import { IAccount } from '../interfaces/dimi-api';
import { UserModel } from '../models';
import { getIdentity } from '../resources/dimi-api';
import { issue as issueToken } from '../resources/token';
import { IUser } from '../interfaces';
import { validator } from '../middlewares';

class AuthController extends Controller {
  public basePath = '/auth';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', validator(Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
    })), this.identifyUser);
  }

  private identifyUser = async (req: Request, res: Response, next: NextFunction) => {
    const account: IAccount = req.body;

    try {
      const { id: idx } = await getIdentity(account);
      const identity = await UserModel.findByIdx(idx) as IUser;

      res.json({
        accessToken: issueToken(identity, false),
        refreshToken: issueToken(identity, true),
      });
    } catch (error) {
      throw new HttpException(401, '인증을 실패했습니다.');
    }
  }
}

export default AuthController;
