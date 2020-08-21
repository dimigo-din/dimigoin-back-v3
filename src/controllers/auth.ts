import { Request, Response } from 'express';
import { HttpException } from '../exceptions';
import { IAccount } from '../interfaces/dimi-api';
import { UserModel } from '../models';
import { getIdentity } from '../resources/dimi-api';
import { issue as issueToken } from '../resources/token';
import { IUser } from '../interfaces';

export const identifyUser = async (req: Request, res: Response) => {
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
};
