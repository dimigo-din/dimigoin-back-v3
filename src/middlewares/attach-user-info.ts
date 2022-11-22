import { NextFunction, Request, Response } from 'express';
import { ConfigKeys } from '../types';
import { HttpException } from '../exceptions';
import { getConfig } from '../resources/config';
import { verify as verifyToken } from '../resources/token';

const attachUserInfo = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.token) { return next(); }
  const { token } = req;
  try {
    const identity = await verifyToken(token);
    const tokenVersion = await getConfig(ConfigKeys.tokenVersion);
    if (tokenVersion !== identity.tokenVersion) throw new HttpException(403, '업데이트된 서비스를 이용하기 위해 재로그인이 필요합니다. (MISMATCH_TOKEN_VERSION)');
    req.user = identity;
    next();
  } catch (error) {
    return next(error);
  }
};

export default attachUserInfo;
