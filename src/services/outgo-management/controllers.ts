import { Request, Response } from 'express';
import { OutgoRequestModel } from '../../models';
import { HttpException } from '../../exceptions';
import { getOutgoResults } from '../../resources/outgo';
import { OutgoSearchResult } from '../../interfaces';

export const getAllOutgoRequests = async (req: Request, res: Response) => {
  const outgoRequests = await OutgoRequestModel
    .find({});

  const result: OutgoSearchResult[] = [];
  for (let i = 0; i < outgoRequests.length; i += 1) {
    result.push(await getOutgoResults(outgoRequests[i]));
  }

  res.json({ outgoRequests: result });
};

// objectID 넣어야함!!
export const getOutgoRequest = async (req: Request, res: Response) => {
  const outgoRequest = await OutgoRequestModel
    .findById(req.params.outgoRequestId);

  if (!outgoRequest) throw new HttpException(404, '해당 외출 신청을 찾을 수 없습니다.');

  const result = await getOutgoResults(outgoRequest);
  res.json({ outgoRequest: result });
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

  const result = await getOutgoResults(outgoRequest);
  res.json({ outgoRequest: result });
};
