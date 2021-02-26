import { Request, Response } from 'express';
import { getWeekStartString, getWeekEndString, getDateFromDay } from '../../resources/date';
import { HttpException } from '../../exceptions';
import { MentoringModel, MentoringApplicationModel } from '../../models';

export const getAllMentorings = async (req: Request, res: Response) => {
  const { userType, grade } = req.user;
  const mentorings = await MentoringModel.find(
    userType === 'T' ? {} : {
      targetGrades: { $all: [grade] },
    },
  )
    .populateTs('teacher');

  res.json({ mentorings });
};

export const getRequestableMentorings = async (req: Request, res: Response) => {
  const { grade } = req.user;
  const mentorings = await MentoringModel.find({
    targetGrade: grade,
  })
    .populateTs('teacher');
  const applications = await MentoringApplicationModel.find({
    date: {
      $gte: getWeekStartString(),
      $lte: getWeekEndString(),
    },
  }).populateTs('mentoring');

  const weekStart = getWeekStartString();
  const requestableMentorings = [];
  for (const mentoring of mentorings) {
    for (const day of mentoring.days) {
      const date = getDateFromDay(weekStart, day);
      requestableMentorings.push({
        date,
        applied: applications.filter((a) => (
          a.mentoring._id.equals(mentoring._id)
          && a.date === date
        )).length > 0,
        ...(mentoring.toJSON()),
      });
    }
  }

  res.json({ mentorings: requestableMentorings });
};

export const getMentoring = async (req: Request, res: Response) => {
  const mentoring = await MentoringModel.findById(
    req.params.mentoringId,
  )
    .populateTs('teacher');
  if (!mentoring) {
    throw new HttpException(404, '해당 멘토링 수업을 찾을 수 없습니다.');
  }
  res.json({ mentoring });
};

export const createMentoring = async (req: Request, res: Response) => {
  const mentoring = new MentoringModel(req.body);
  await mentoring.save();
  res.json({ mentoring });
};

export const deleteMentoring = async (req: Request, res: Response) => {
  const mentoring = await MentoringModel.findById(req.params.mentoringId);
  if (!mentoring) {
    throw new HttpException(404, '해당 멘토링 수업을 찾을 수 없습니다.');
  }
  await mentoring.deleteOne();
  res.json({ mentoring });
};

export const editMentoring = async (req: Request, res: Response) => {
  const mentoring = await MentoringModel.findById(req.params.mentoringId);
  if (!mentoring) {
    throw new HttpException(404, '해당 멘토링 수업을 찾을 수 없습니다.');
  }
  Object.assign(mentoring, req.body);
  await mentoring.save();
  res.json({ mentoring });
};
