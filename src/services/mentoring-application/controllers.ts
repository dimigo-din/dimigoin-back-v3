import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { MentoringModel, MentoringApplicationModel } from '../../models';
import { HttpException } from '../../exceptions';
import {
  getDayCode, getKoreanTodayFullString, getWeekEndString, getWeekStartString,
} from '../../resources/date';
import { createMentoringApplierBook } from '../../resources/exporter';
import { writeFile } from '../../resources/file';

export const getMyAllApplications = async (req: Request, res: Response) => {
  const applications = await MentoringApplicationModel.find({
    applier: req.user._id,
    date: {
      $gte: getWeekStartString(),
      $lte: getWeekEndString(),
    },
  }).populateTs('mentoring');
  res.json({ applications });
};

const checkDuplicate = async (mentoringId: ObjectId, date: string) => await MentoringApplicationModel.exists({
  date,
  mentoring: mentoringId,
});

export const applyMentoring = async (req: Request, res: Response) => {
  const mentoring = await MentoringModel.findById(req.params.mentoringId);
  if (!mentoring) throw new HttpException(404, '해당 멘토링 수업이 존재하지 않습니다.');

  const { date } = req.body;

  // 이번주 멘토링을 신청하는 것인지 검사
  const weekStart = getWeekStartString();
  const weekEnd = getWeekEndString();
  if (date < weekStart || weekEnd < date) {
    throw new HttpException(403, '이번주 멘토링 수업만 신청할 수 있습니다.');
  }

  // 신청하려는 날짜가 진행하는 요일인지 검사
  if (!mentoring.days.includes(getDayCode(date))) {
    throw new HttpException(404, '신청하려는 날짜에 진행되지 않는 멘토링 수업입니다.');
  }

  // 신청 대상 학년인지 검사
  const { _id: userId, grade } = req.user;
  if (mentoring.targetGrade !== grade) {
    throw new HttpException(403, '신청 대상 학년이 아닙니다.');
  }

  // 다른 사람이 신청한 멘토링인지 검사
  if (await checkDuplicate(mentoring._id, req.body.date)) {
    throw new HttpException(409, '해당 날짜 이미 신청된 멘토링 수업입니다.');
  }

  const mentoringApplication = new MentoringApplicationModel({
    date: req.body.date,
    applier: userId,
    mentoring: mentoring._id,
  });
  await mentoringApplication.save();
  res.json({ mentoringApplication });
};

export const cancelApplication = async (req: Request, res: Response) => {
  const { _id: applier } = req.user;
  const mentoringApplication = await MentoringApplicationModel.findOne({
    mentoring: req.params.mentoringId,
    applier,
    date: {
      $gte: getWeekStartString(),
      $lte: getWeekEndString(),
      $eq: req.body.date,
    },
  });
  if (!mentoringApplication) {
    throw new HttpException(404, '해당 멘토링을 신청한 이력이 없습니다.');
  }
  await mentoringApplication.remove();
  res.json({ mentoringApplication });
};

export const exportWeeklyMentoringApplications = async (req: Request, res: Response) => {
  const buffer = await createMentoringApplierBook();
  const today = getKoreanTodayFullString();
  const fileName = `금주 멘토링 수업 신청 현황 (${today} 기준)`;
  const file = await writeFile(buffer, fileName, 'xlsx', req.user);

  res.json({ exportedFile: file });
};
