import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { AfterschoolModel, AfterschoolApplicationModel, AfterschoolDoc } from '../../models';
import { HttpException } from '../../exceptions';
import { Grade } from '../../types';
import { getKoreanTodayFullString } from '../../resources/date';
import { createAfterschoolApplierBook } from '../../resources/exporter';
import { writeFile } from '../../resources/file';
import {
  mutateAfterschoolApplierCount,
} from '../../resources/redis';

export const getMyAllApplications = async (req: Request, res: Response) => {
  const applications = await AfterschoolApplicationModel.find({
    applier: req.user._id,
  }).populateTs('afterschool');
  res.json({ applications });
};

const checkOverlap = async (applierId: ObjectId, target: AfterschoolDoc): Promise<Boolean> => {
  const overlapped = (await AfterschoolApplicationModel
    .find({ applier: applierId })
    .populateTs('afterschool'))
    .filter(({ afterschool }) => {
      // 중복 수강 불가한 강좌인지
      if (target.key && target.key === afterschool.key) return true;
      // 겹치는 요일이 존재하는 동시에 타임까지 겹치는지
      return (
        afterschool.days.filter((day) => target.days.includes(day)).length
        && afterschool.times.filter((time) => target.times.includes(time)).length
      );
    });
  return overlapped.length > 0;
};

export const applyAfterschool = async (req: Request, res: Response) => {
  const afterschool = await AfterschoolModel.findById(req.params.afterschoolId);
  if (!afterschool) throw new HttpException(404, '해당 방과 후 수업이 존재하지 않습니다.');
  const { _id: userId, grade, class: klass } = req.user;
  if (
    !afterschool.targetGrades.includes(grade)
    || !afterschool.targetClasses.includes(klass)
  ) throw new HttpException(403, '신청 대상 강좌가 아닙니다.');
  if (await checkOverlap(userId, afterschool)) {
    throw new HttpException(409, '중복 수강이 불가능한 강좌를 이미 신청했거나, 동시간대에 이미 신청한 강좌가 있습니다.');
  }
  const applierCount = await AfterschoolApplicationModel.count({
    afterschool: afterschool._id,
  });
  if (applierCount < afterschool.capacity) {
    const afterschoolApplication = new AfterschoolApplicationModel({
      applier: userId,
      afterschool: afterschool._id,
    });
    await afterschoolApplication.save();
    await mutateAfterschoolApplierCount(
      afterschool._id,
      1,
    );
    res.json({ afterschoolApplication });
  }
  else {
    throw new HttpException(400, '이미 정원을 초과한 방과후 입니다.');
  }
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
  const afterschool = await AfterschoolModel.findById(
    afterschoolApplication.afterschool,
  );
  await afterschoolApplication.remove();
  await mutateAfterschoolApplierCount(
    afterschool._id,
    -1,
  );
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
