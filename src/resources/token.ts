import jwt from 'jsonwebtoken';
import config from '../config';
import { IUser } from '../interfaces';
import { HttpException } from '../exceptions';

export default class Token {
  private secretKey = config.jwtSecret;

  public verify(token: string): IUser {
    try {
      const { identity }: any = jwt.verify(token, this.secretKey);
      return identity;
    } catch (error) {
      throw new HttpException(401, error.message);
    }
  }

  public issue(identity: IUser, refresh: boolean) {
    if (!refresh) {
      const token = jwt.sign({ identity }, this.secretKey, {
        algorithm: 'HS256',
        expiresIn: '1w',
      });
      return token;
    }
    const token = jwt.sign({
      idx: identity.idx, refresh: true,
    }, this.secretKey);
    return token;
  }
}
