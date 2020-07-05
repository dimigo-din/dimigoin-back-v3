import jwt, { TokenExpiredError } from 'jsonwebtoken';
import config from '../config';
import { User } from '../interfaces';

async function issue(identity: User, refresh: boolean = false) {
  const signOptions: jwt.SignOptions = {
    algorithm: 'HS256',
    expiresIn: refresh ? '1y' : '1w',
  };

  const token = jwt.sign(
    { identity, refresh },
    config.jwtSecret,
    signOptions,
  );

  return token;
}

export default {
  issue,
}
