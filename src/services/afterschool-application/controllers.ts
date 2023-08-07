import { Request, Response } from 'express';
import { getStudentInfo } from '../../resources/dimi-api';
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
    applier: req.user.user_id,
  }).populateTs('afterschool');
  res.json({ applications });
};

const checkOverlap = async (applierId: number, target: AfterschoolDoc): Promise<Boolean> => {
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
  const currentTime = new Date();
  const firstStart = new Date();
  const firstEnd = new Date();
  const secondEnd = new Date();

  firstStart.setHours(17, 10, 0);
  firstEnd.setHours(17, 30, 0);
  secondEnd.setHours(18, 0, 0);

  const afterschool = await AfterschoolModel.findById(req.params.afterschoolId);
  if (!afterschool) throw new HttpException(404, '해당 방과 후 수업이 존재하지 않습니다.');
  const { user_id: userId, grade, class: klass } = req.user;
  if (
    !afterschool.targetGrades.includes(grade)
    || !afterschool.targetClasses.includes(klass)
  ) throw new HttpException(403, '신청 대상 강좌가 아닙니다.');
  if (await checkOverlap(userId, afterschool)) {
    throw new HttpException(409, '중복 수강이 불가능한 강좌를 이미 신청했거나, 동시간대에 이미 신청한 강좌가 있습니다.');
  }

  const isTargetGradesValid = (afterschool.targetGrades.length === 1 && afterschool.targetGrades.includes(1))
    || (afterschool.targetGrades.length === 2 && afterschool.targetGrades.includes(1) && afterschool.targetGrades.includes(2));

  if (isTargetGradesValid) {
    if (currentTime < firstStart || currentTime > firstEnd) {
      throw new HttpException(404, '해당 방과후의 신청시간이 아닙니다.');
    }
  } else if (afterschool.targetGrades.length === 1 && afterschool.targetGrades.includes(2)) {
    if (currentTime < firstEnd || currentTime > secondEnd) {
      throw new HttpException(404, '해당 방과후의 신청시간이 아닙니다.');
    }
  }

  const appliers = await AfterschoolApplicationModel.find({
    afterschool: afterschool._id,
  });
  if (appliers.length < afterschool.capacity) {
    // 물리와 함께
    if (afterschool.name === '물리와 함께') {
      const gradeLimit = (grade === 1) ? 10 : 5;
      let firstGrade = 0;
      let secondGrade = 0;

      for (const applier of appliers) {
        const student = await getStudentInfo(applier.applier);
        if (student.grade === 1) {
          firstGrade += 1;
        } else {
          secondGrade += 1;
        }
      }

      if ((grade === 1 && firstGrade >= gradeLimit) || (grade === 2 && secondGrade >= gradeLimit)) {
        const errorMessage = (grade === 1) ? '1학년 수강신청인원이 마감되었습니다.' : '2학년 수강신청인원이 마감되었습니다.';
        throw new HttpException(404, errorMessage);
      }
    }

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
  // throw new HttpException(400, '추가모집 기간에는 방과후를 취소할 수 없습니다.');
  const { user_id: applier } = req.user;
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
