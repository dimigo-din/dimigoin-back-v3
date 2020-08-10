import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { HttpException } from '../exceptions';
import IUser from '../interfaces/User';

dotenv.config();

export default class Token {
  private secretKey = process.env.JWT_SECRET;

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
      const token = jwt.sign({ identity }, process.env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: '1w',
      });
      return token;
    }
    const token = jwt.sign({
      idx: identity.idx, refresh: true,
    }, process.env.JWT_SECRET);
    return token;
  }
}
