import { Request, Response } from 'express';
import { HttpException } from '../exceptions';
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
  if (userType === 'T') {
    const bookReqeusts = await BookRequestModel.find({});
    res.json({ bookReqeusts });
  } else if (userType === 'S') {
    const bookReqeusts = await BookRequestModel.find({
      applier,
    });
    res.json({ bookReqeusts });
  } else {
    throw new HttpException(403, '권한이 없습니다.');
  }
};
