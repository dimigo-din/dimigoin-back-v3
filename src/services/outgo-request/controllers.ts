import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import * as User from '../../models/user';
import { OutgoRequestModel } from '../../models';
import { OutgoRequestStatus } from '../../types';

export const getMyOutgoRequests = async (req: Request, res: Response) => {
  const user = req.user;
  let outgoRequests = await OutgoRequestModel
    .find({ applier: { $all: [user._id] } });

  // todo: Populate function으로 리팩토링 해야 함
  // @ts-ignore
  outgoRequests = await Promise.all(outgoRequests.map(async (request) => {
    request = request.toJSON();
    const applier = await Promise.all(
      request.applier.map(async (applier_) => await User.model.findById(applier_)),
    );
    const approver = await User.model.findById(request.approver);
    return {
      ...request,
      applier,
      approver,
    };
  }));
  res.json({ outgoRequests });
};

export const getOutgoRequest = async (req: Request, res: Response) => {
  const user = req.user;
  const outgoRequest = await OutgoRequestModel
    .findById(req.params.outgoRequestId)
    .populateTs('approver');
  if (!outgoRequest) throw new HttpException(404, '해당 외출 신청이 없습니다.');
  if (user.userType === 'S' && !outgoRequest.applier.includes(user._id)) {
    throw new HttpException(403, '권한이 없습니다.');
  }
  res.json({
    outgoRequest: {
      ...outgoRequest.toJSON(),
      applier: await Promise.all(
        outgoRequest.applier.map(async (applier) =>
          await User.model.findById(applier)),
      ),
      // approver: await User.model.findById(outgoRequest.approver),
    },
  });
};

export const createOutgoRequest = async (req: Request, res: Response) => {
  const request = req.body;
  const user = req.user;
  if (!request.applier.includes(user._id)) {
    throw new HttpException(403, '자신의 외출만 신청할 수 있습니다.');
  }

  const { userType: approverType } = await User.model.findById(request.approver);
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

  res.json({
    outgoRequest: {
      ...outgoRequest.toJSON(),
      applier: await Promise.all(
        outgoRequest.applier.map(async (applier) =>
          await User.model.findById(applier)),
      ),
    },
  });
};
