import { Request } from 'express';
import { verify as verifyToken } from '../resources/token';
import { IUser } from '../interfaces';

export const getUserIdentity = async (req: Request) => {
  const { token } = req;
  const identity = await verifyToken(token);
  return identity as IUser;
};
