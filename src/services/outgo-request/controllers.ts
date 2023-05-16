import { Request, Response } from 'express';
import moment from 'moment-timezone';
import { getOutgoResults } from '../../resources/outgo';
import { HttpException } from '../../exceptions';
import { OutgoRequestModel, UserTypeModel } from '../../models';
import { OutgoRequestStatus } from '../../types';
import { OutgoSearchResult } from '../../interfaces';

export const getMyOutgoRequests = async (req: Request, res: Response) => {
  const { user } = req;
  const startDate = moment().subtract(2, 'weeks').toDate();
  const outgoRequests = await OutgoRequestModel
    .find({
      applier: { $all: [user.user_id] },
      createdAt: { $gte: startDate },
    });

  const result: OutgoSearchResult[] = [];
  for (let i = 0; i < outgoRequests.length; i += 1) {
    result.push(await getOutgoResults(outgoRequests[i]));
  }

  res.json({ outgoRequests: result });
};

export const getOutgoRequest = async (req: Request, res: Response) => {
  const { user } = req;
  const outgoRequest = await OutgoRequestModel
    .findById(req.params.outgoRequestId);

  if (!outgoRequest) throw new HttpException(404, '해당 외출 신청이 없습니다.');

  if (user.userType === 'S' && !outgoRequest.applier.includes(user.user_id)) {
    throw new HttpException(403, '권한이 없습니다.');
  }

  const result = await getOutgoResults(outgoRequest);
  res.json({ outgoRequest: result });
};

export const createOutgoRequest = async (req: Request, res: Response) => {
  const request = req.body;
  const { user } = req;
  if (!request.applier.includes(user.user_id)) {
    throw new HttpException(403, '자신의 외출만 신청할 수 있습니다.');
  }

  const { type: approverType } = await UserTypeModel.findOne({ userId: request.approver });
  if (approverType !== 'T') {
    throw new HttpException(403, '승인자는 교사여야 합니다.');
  }

  const now = new Date();
  if (new Date(request.duration.start) <= now || now >= new Date(request.duration.end)) {
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
