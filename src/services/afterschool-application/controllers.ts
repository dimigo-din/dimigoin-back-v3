import { Request, Response } from 'express';
import { AfterschoolModel, AfterschoolApplicationModel } from '../../models';
import { HttpException } from '../../exceptions';
import { Grade } from '../../types';
import { getKoreanTodayFullString } from '../../resources/date';
import { createAfterschoolApplierBook } from '../../resources/exporter';
import { writeFile } from '../../resources/file';

export const getMyAllApplications = async (req: Request, res: Response) => {
  const applications = await AfterschoolApplicationModel.find({
    applier: req.user._id,
  }).populateTs('afterschool');
  res.json({ applications });
};

export const applyAfterschool = async (req: Request, res: Response) => {
  const afterschool = await AfterschoolModel.findById(req.params.afterschoolId);
  if (!afterschool) throw new HttpException(404, '해당 방과 후 수업이 존재하지 않습니다.');
  const { _id: userId, grade, class: klass } = req.user;
  if (
    !afterschool.targetGrades.includes(grade)
    || !afterschool.targetClasses.includes(klass)
  ) throw new HttpException(403, '신청 대상 강좌가 아닙니다.');
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

export const exportAfterschoolApplications = async (req: Request, res: Response) => {
  const grade = parseInt(req.params.grade) as Grade;
  const buffer = await createAfterschoolApplierBook(grade);
  const today = getKoreanTodayFullString();
  const fileName = `${grade}학년 방과 후 수강 신청 현황 (${today} 기준)`;
  const file = await writeFile(buffer, fileName, 'xlsx', req.user);

  res.json({ exportedFile: file });
};
