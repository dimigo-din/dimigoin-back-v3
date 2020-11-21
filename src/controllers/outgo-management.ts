import { Request, Response } from 'express';
import { OutgoRequestModel, UserModel } from '../models';
import { HttpException } from '../exceptions';
import { getUserIdentity } from '../resources/user';

export const getAllOutgoRequests = async (req: Request, res: Response) => {
  let outgoRequests = await OutgoRequestModel.find({});

  // todo: Populate function으로 리팩토링 해야 함
  // @ts-ignore
  outgoRequests = await Promise.all(outgoRequests.map(async (request) => {
    request = request.toJSON();
    const applier = await Promise.all(
      request.applier.map(async (applier_) => await UserModel.findById(applier_)),
    );
    const approver = await UserModel.findById(request.approver);
    return {
      ...request,
      applier,
      approver,
    };
  }));
  res.json({ outgoRequests });
};

export const getOutgoRequest = async (req: Request, res: Response) => {
  const outgoRequest = await OutgoRequestModel.findById(req.params.outgoRequestId);
  if (!outgoRequest) throw new HttpException(404, '해당 외출 신청을 찾을 수 없습니다.');

  res.json({
    outgoRequest: {
      ...outgoRequest.toJSON(),
      applier: await Promise.all(
        outgoRequest.applier.map(async (applier) =>
          await UserModel.findById(applier)),
      ),
      approver: await UserModel.findById(outgoRequest.approver),
    },
  });
};

export const toggleOutgoRequestStatus = async (req: Request, res: Response) => {
  const outgoRequest = await OutgoRequestModel.findById(req.params.outgoRequestId);
  if (!outgoRequest) throw new HttpException(404, '해당 외출 신청을 찾을 수 없습니다.');

  const user = await getUserIdentity(req);
  if (!outgoRequest.approver.equals(user._id)) {
    throw new HttpException(403, '권한이 없습니다.');
  }

  outgoRequest.status = req.body.status;
  await outgoRequest.save();

  res.json({
    outgoRequest: {
      ...outgoRequest.toJSON(),
      applier: await Promise.all(
        outgoRequest.applier.map(async (applier) =>
          await UserModel.findById(applier)),
      ),
      approver: await UserModel.findById(outgoRequest.approver),
    },
  });
};
