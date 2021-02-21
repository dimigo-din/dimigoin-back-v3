import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import { MentoringModel } from '../../models';

export const getAllMentorings = async (req: Request, res: Response) => {
  const { userType, grade, class: klass } = req.user;
  const mentorings = await MentoringModel.find(
    userType === 'T' ? {} : {
      targetGrades: { $all: [grade] },
      targetClasses: { $all: [klass] },
    },
  )
    .populateTs('teacher');

  res.json({ mentorings });
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
