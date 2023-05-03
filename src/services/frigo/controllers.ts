import { Request, Response } from 'express';
import { FrigoModel } from '../../models';
import { HttpException } from '../../exceptions';

export const getAllFrigo = async (req: Request, res: Response) => {
  const frigo = await FrigoModel.find({});

  res.json({ frigo });
};

export const getMyFrigo = async (req: Request, res: Response) => {
  const myFrigo = await FrigoModel.findOne({ userId: req.user.user_id });

  res.json({ myFrigo });
};

export const applyFrigo = async (req: Request, res: Response) => {
  const {
    // eslint-disable-next-line camelcase
    grade, user_id, name,
  } = req.user;

  // 신청가능학년 필터링 추가
  const existingRequest = await FrigoModel.findOne({ userId: user_id });
  if (existingRequest) {
    throw new HttpException(400, '이미 금요귀가를 요청했습니다.');
  }

  const frigoReqest = await FrigoModel.create({
    userId: user_id, name, grade, class: req.user.class, ...req.body, accepted: false,
  });
  res.json({ frigoReqest });
};

export const acceptFrigo = async (req: Request, res: Response) => {
  const frigoRequest = await FrigoModel.findOne({ userId: req.body.userId });

  frigoRequest.accepted = true;
  frigoRequest.save();

  res.json({ error: false, message: 'Success' });
};

export const cancelFrigo = async (req: Request, res: Response) => {
  const frigoRequest = await FrigoModel.findOne({ userId: req.body.userId });

  frigoRequest.accepted = false;
  frigoRequest.save();

  res.json({ error: false, message: 'Success' });
};
