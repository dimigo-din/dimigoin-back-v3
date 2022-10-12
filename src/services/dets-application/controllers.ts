import { Request, Response } from 'express';
import { DetsApplicationModel, DetsModel } from '../../models';
import { HttpException } from '../../exceptions';

export const getMyAllApplications = async (req: Request, res: Response) => {
  const applications = await DetsApplicationModel.find({
    applier: req.user.user_id,
  }).populateTs('dets');
  res.json({ applications });
};

export const applyDetsClass = async (req: Request, res: Response) => {
  const dets = await DetsModel.findById(req.params.detsClassId);
  if (!dets) throw new HttpException(404, '해당 DETS 수업이 존재하지 않습니다.');

  const { user_id: userId, grade } = req.user;
  if (dets.targetGrade !== grade) throw new HttpException(403, '신청 대상 수업이 아닙니다.');

  const alreadyApplied = await DetsApplicationModel.count({
    dets: dets._id,
    applier: userId,
  }) > 0;
  if (alreadyApplied) {
    throw new HttpException(409, '이미 신청한 DETS 수업입니다.');
  }

  const applyCount = await DetsApplicationModel.count({
    dets: dets._id,
  });
  if (dets.capacity <= applyCount) {
    throw new HttpException(403, '최대 수강 신청 인원에 도달했습니다.');
  }

  const detsApplication = await new DetsApplicationModel({
    applier: userId,
    dets: dets._id,
  }).save();

  res.json({ detsApplication });
};

export const cancelApplication = async (req: Request, res: Response) => {
  const { user_id: applier } = req.user;
  const detsApplication = await DetsApplicationModel.findOne({
    dets: req.params.detsClassId,
    applier,
  });
  if (!detsApplication) {
    throw new HttpException(404, '해당 강좌를 신청한 이력이 없습니다.');
  }
  await detsApplication.remove();
  res.json({ detsApplication });
};
