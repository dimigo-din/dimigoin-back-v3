import { Request, Response } from 'express';
import { OutgoRequestModel } from '../../models';
import { HttpException } from '../../exceptions';

export const getAllOutgoRequests = async (req: Request, res: Response) => {
  const outgoRequests = await OutgoRequestModel
    .find({})
    .populateTs('approver')
    .populateTs('applier');
  res.json({ outgoRequests });
};

export const getOutgoRequest = async (req: Request, res: Response) => {
  const outgoRequest = await OutgoRequestModel
    .findById(req.params.outgoRequestId)
    .populateTs('approver')
    .populateTs('applier');
  if (!outgoRequest) throw new HttpException(404, '해당 외출 신청을 찾을 수 없습니다.');
};

export const toggleOutgoRequestStatus = async (req: Request, res: Response) => {
  const outgoRequest = await OutgoRequestModel
    .findById(req.params.outgoRequestId)
    .populateTs('approver')
    .populateTs('applier');
  if (!outgoRequest) throw new HttpException(404, '해당 외출 신청을 찾을 수 없습니다.');

  const user = req.user;
  if (outgoRequest.approver._id !== user._id) {
    throw new HttpException(403, '권한이 없습니다.');
  }

  outgoRequest.status = req.body.status;
  await outgoRequest.save();

  res.json({ outgoRequest });
};
