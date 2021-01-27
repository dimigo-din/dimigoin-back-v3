import { Request, Response } from 'express';
import { AfterschoolModel, AfterschoolApplicationModel } from '../../models';
import { HttpException } from '../../exceptions';

export const applyAfterschool = async (req: Request, res: Response) => {
  const afterschool = await AfterschoolModel.findById(req.params.afterschoolId);
  if (!afterschool) throw new HttpException(404, '해당 방과 후 수업이 존재하지 않습니다.');
  const { _id: userId, grade, class: klass } = req.user;
  if (
    !afterschool.grade.includes(grade)
    || !afterschool.class.includes(klass)
  ) throw new HttpException(403, '신청 대상이 아닙니다.');
  if (await AfterschoolModel.checkOverlap(userId, afterschool._id)) {
    throw new HttpException(409, '중복 수강이 불가능한 강좌를 이미 신청했거나, 동시간대에 이미 신청한 강좌가 있습니다.');
  }

  const afterschoolApplication = new AfterschoolApplicationModel({
    applier: userId,
    afterschool: afterschool._id,
  });
  await afterschoolApplication.save();

  res.json({ afterschoolApplication });
};

export const cancelApplication = async (req: Request, res: Response) => {
  const { _id: applier } = req.user;
  const afterschoolApplication = await AfterschoolApplicationModel.findOne({
    afterschool: req.params.afterschoolId,
    applier,
  });
  if (!afterschoolApplication) {
    throw new HttpException(404, '해당 강좌를 신청한 이력이 없습니다.');
  }
  await afterschoolApplication.remove();
  res.json({ afterschoolApplication });
};
