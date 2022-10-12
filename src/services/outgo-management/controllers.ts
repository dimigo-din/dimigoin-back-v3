import { Request, Response } from 'express';
import { OutgoRequestModel } from '../../models';
import { HttpException } from '../../exceptions';
import { getStudentInfo, studentSearch } from '../../resources/dimi-api';

export const getAllOutgoRequests = async (req: Request, res: Response) => {
  const outgoRequests = await OutgoRequestModel
    .find({});
  outgoRequests.forEach(async (outgoRequest, idx) => {
    (outgoRequests[idx].approver as any) = await getStudentInfo(outgoRequests[idx].approver);
    (outgoRequests[idx].applier as any) = await studentSearch({ user_id: outgoRequests[idx].applier });
  });
  res.json({ outgoRequests });
};

export const getOutgoRequest = async (req: Request, res: Response) => {
  const outgoRequest = await OutgoRequestModel
    .findById(req.params.outgoRequestId);

  (outgoRequest.approver as any) = await getStudentInfo(outgoRequest.approver);
  (outgoRequest.applier as any) = await studentSearch({ user_id: outgoRequest.applier });
  if (!outgoRequest) throw new HttpException(404, '해당 외출 신청을 찾을 수 없습니다.');
};

export const toggleOutgoRequestStatus = async (req: Request, res: Response) => {
  const outgoRequest = await OutgoRequestModel
    .findById(req.params.outgoRequestId);
  if (!outgoRequest) throw new HttpException(404, '해당 외출 신청을 찾을 수 없습니다.');

  const { user } = req;
  if (outgoRequest.approver !== user.user_id) {
    throw new HttpException(403, '권한이 없습니다.');
  }

  outgoRequest.status = req.body.status;
  await outgoRequest.save();

  (outgoRequest.approver as any) = await getStudentInfo(outgoRequest.approver);
  (outgoRequest.applier as any) = await studentSearch({ user_id: outgoRequest.applier });

  res.json({ outgoRequest });
};
