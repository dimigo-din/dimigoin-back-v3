import { Request, Response } from 'express';
import { HttpException } from '../exceptions';
import { getUserIdentity } from '../resources/user';
import { OutgoRequestModel } from '../models';
import { OutgoRequestStatus } from '../types';

export const getMyOutgoRequests = async (req: Request, res: Response) => {
  const user = await getUserIdentity(req);
  const outgoRequests = await OutgoRequestModel.find({
    applier: { $all: [user._id] },
  });
  res.json({ outgoRequests });
};

export const createOutgoRequest = async (req: Request, res: Response) => {
  const request = req.body;
  const user = await getUserIdentity(req);
  if (!request.applier.includes(user._id)) {
    throw new HttpException(403, '자신의 외출만 신청할 수 있습니다.');
  }

  const now = new Date();
  if (request.duration.start <= now || now <= request.duration.end) {
    throw new HttpException(400, '외출 신청 시간을 확인해 주세요.');
  }

  const outgoRequest = new OutgoRequestModel();
  Object.assign(outgoRequest, {
    ...request,
    status: OutgoRequestStatus.applied,
  });

  await outgoRequest.save();

  res.json({ outgoRequest });
};
