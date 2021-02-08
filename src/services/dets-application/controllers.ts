import { Request, Response } from 'express';
import { DetsModel, DetsApplicationModel } from '../../models';
import { HttpException } from '../../exceptions';

export const applyAfterschool = async (req: Request, res: Response) => {
  const dets = await DetsModel.findById(req.params.detsId);
  if (!dets) throw new HttpException(404, '해당 뎃츠가 존재하지 않습니다.');
  const { _id: userId, grade } = req.user;
  if (
    !dets.targetGrade.includes(grade)
  ) throw new HttpException(403, '신청 대상이 아닙니다.');
  if (await DetsModel.checkOverlap(userId, dets._id)) {
    throw new HttpException(409, '중복 수강이 불가능한 강좌를 이미 신청했거나, 동시간대에 이미 신청한 강좌가 있습니다.');
  }

  const detsApplication = new DetsApplicationModel({
    applier: userId,
    dets: dets._id,
  });
  await detsApplication.save();

  res.json({ detsApplication });
};

export const cancelApplication = async (req: Request, res: Response) => {
  const { _id: applier } = req.user;
  const detsApplication = await DetsApplicationModel.findOne({
    dets: req.params.detsId,
    applier,
  });
  if (!detsApplication) {
    throw new HttpException(404, '해당 강좌를 신청한 이력이 없습니다.');
  }
  await detsApplication.remove();
  res.json({ detsApplication });
};
