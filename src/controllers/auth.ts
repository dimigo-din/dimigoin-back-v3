import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { HttpException } from '../exceptions';
import { Controller } from '../classes';
import { IAccount } from '../interfaces/dimi-api';
import { UserModel } from '../models';
import DimiAPI from '../resources/dimi-api';
import Token from '../resources/Token';
import { IUser } from '../interfaces';
import { validator } from '../middlewares';

class AuthController extends Controller {
  public basePath = '/auth';

  private DimiAPIClient = new DimiAPI();

  private TokenManager = new Token();

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
      const { id: idx } = await this.DimiAPIClient.getIdentity(account);
      const identity = await UserModel.findByIdx(idx) as IUser;

      res.json({
        accessToken: this.TokenManager.issue(identity, false),
        refreshToken: this.TokenManager.issue(identity, true),
      });
    } catch (error) {
      throw new HttpException(401, '인증을 실패했습니다.');
    }
  }
}

export default AuthController;
