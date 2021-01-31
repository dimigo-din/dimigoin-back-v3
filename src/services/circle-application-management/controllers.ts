import { Request, Response } from 'express';
import * as CircleApplication from '../../models/circle-application';
import * as CircleApplicationQuestion
  from '../../models/circle-application-question';

export const updateApplicationForm = async (req: Request, res: Response) => {
  const { form } = req.body;
  await CircleApplicationQuestion.model.deleteMany({});
  await CircleApplicationQuestion.model.create(form);
  res.json({ form });
};

export const getAllApplications = async (req: Request, res: Response) => {
  const applications = await CircleApplication.model.find()
    .populate('circle', ['name'])
    .populate('applier', ['name', 'serial']);
  res.json({ applications });
};
