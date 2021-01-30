import { Request, Response } from 'express';
import * as Afterschool from '../../models/afterschool';

export const getAllAfterschools = async (req: Request, res: Response) => {
  const { userType, grade, class: klass } = req.user;
  const afterschools = await Afterschool.model.find(
    userType === 'T' ? {} : {
      grade: { $all: [grade] },
      class: { $all: [klass] },
    },
  );

  res.json({ afterschools });
};

export const getAfterschool = async (req: Request, res: Response) => {
  const afterschool = await Afterschool.model.findById(req.params.afterschoolId);
  res.json({ afterschool });
};

export const createAfterschool = async (req: Request, res: Response) => {
  const afterschool = new Afterschool.model(req.body);
  await afterschool.save();
  res.json({ afterschool });
};
