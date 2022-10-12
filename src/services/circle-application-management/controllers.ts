import { Request, Response } from 'express';
import { getStudentInfo } from '../../resources/dimi-api';
import {
  CircleApplicationModel,
  CircleApplicationQuestionModel,
} from '../../models';

export const updateApplicationForm = async (req: Request, res: Response) => {
  const { form } = req.body;
  await CircleApplicationQuestionModel.deleteMany({});
  await CircleApplicationQuestionModel.create(form);
  res.json({ form });
};

export const getAllApplications = async (req: Request, res: Response) => {
  const applications = await CircleApplicationModel.find()
    .populateTs('circle');
  applications.forEach(async (e, idx) => {
    (applications[idx].applier as any) = await getStudentInfo(e.applier);
  });
  res.json({ applications });
};
