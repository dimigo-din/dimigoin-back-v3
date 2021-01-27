import { Request, Response } from 'express';
import { getUserIdentity } from '../../resources/user';
import { AfterschoolModel } from '../../models';

export const getAllAfterschools = async (req: Request, res: Response) => {
  const { userType, grade, class: klass } = await getUserIdentity(req);
  const afterschools = await AfterschoolModel.find(
    userType === 'T' ? {} : {
      grade: { $all: [grade] },
      class: { $all: [klass] },
    },
  );

  res.json({ afterschools });
};

export const getAfterschool = async (req: Request, res: Response) => {
  const afterschool = await AfterschoolModel.findById(req.params.afterschoolId);
  res.json({ afterschool });
};

export const createAfterschool = async (req: Request, res: Response) => {
  const afterschool = new AfterschoolModel(req.body);
  await afterschool.save();
  res.json({ afterschool });
};
