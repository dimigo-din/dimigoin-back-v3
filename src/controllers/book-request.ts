import { Request, Response } from 'express';
import { BookRequestModel } from '../models';
import { getUserIdentity } from '../resources/user';

export const getBookNotice = async (req: Request, res: Response) => {
  // Config랑 연동
  res.json({
    notice: '반납을 재때재때 합시다.',
  });
};

export const getAllBookRequests = async (req: Request, res: Response) => {
  const { userType, _id: applier } = await getUserIdentity(req);
  const bookReqeusts = await BookRequestModel.find(
    userType === 'S' ? { applier } : {},
  );
  res.json({ bookReqeusts });
};
