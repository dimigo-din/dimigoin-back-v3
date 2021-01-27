import { Request, Response } from 'express';
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
    .populate('circle', ['name'])
    .populate('applier', ['name', 'serial']);
  res.json({ applications });
};
