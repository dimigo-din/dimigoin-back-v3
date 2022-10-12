import { Request, Response } from 'express';
import moment from 'moment-timezone';
import { getTeacherInfo, studentSearch } from '../../resources/dimi-api';
import { HttpException } from '../../exceptions';
import { OutgoRequestModel, UserTypeModel } from '../../models';
import { OutgoRequestStatus } from '../../types';

export const getMyOutgoRequests = async (req: Request, res: Response) => {
  const { user } = req;
  const startDate = moment().subtract(2, 'weeks').toDate();
  const outgoRequests = await OutgoRequestModel
    .find({
      applier: { $all: [user.user_id] },
      createdAt: { $gte: startDate },
    });

  outgoRequests.forEach(async (e, idx) => {
    (outgoRequests[idx].applier as any) = await studentSearch({ user_id: e.applier });
    (outgoRequests[idx].approver as any) = await getTeacherInfo(e.approver);
  });

  res.json({ outgoRequests });
};

export const getOutgoRequest = async (req: Request, res: Response) => {
  const { user } = req;
  const outgoRequest = await OutgoRequestModel
    .findById(req.params.outgoRequestId);

  if (!outgoRequest) throw new HttpException(404, '해당 외출 신청이 없습니다.');

  if (user.userType === 'S' && !outgoRequest.applier.includes(user.user_id)) {
    throw new HttpException(403, '권한이 없습니다.');
  }

  (outgoRequest.applier as any) = await studentSearch({ user_id: outgoRequest.applier });
  (outgoRequest.approver as any) = await getTeacherInfo(outgoRequest.approver);
  res.json({ outgoRequest });
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
