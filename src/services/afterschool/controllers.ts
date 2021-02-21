import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import { AfterschoolModel, AfterschoolApplicationModel } from '../../models';

export const getAllAfterschools = async (req: Request, res: Response) => {
  const { userType, grade, class: klass } = req.user;
  const afterschools = await AfterschoolModel.find(
    userType === 'T' ? {} : {
      targetGrades: { $all: [grade] },
      targetClasses: { $all: [klass] },
    },
  )
    .populateTs('teacher')
    .populateTs('place');

  res.json({ afterschools });
};

export const getAfterschool = async (req: Request, res: Response) => {
  const afterschool = await AfterschoolModel.findById(
    req.params.afterschoolId,
  )
    .populateTs('teacher')
    .populateTs('place');
  if (!afterschool) {
    throw new HttpException(404, '해당 방과 후 수업을 찾을 수 없습니다.');
  }
  res.json({ afterschool });
};

export const createAfterschool = async (req: Request, res: Response) => {
  const afterschool = new AfterschoolModel(req.body);
  await afterschool.save();
  res.json({ afterschool });
};

export const deleteAfterschool = async (req: Request, res: Response) => {
  const afterschool = await AfterschoolModel.findById(req.params.afterschoolId);
  if (!afterschool) {
    throw new HttpException(404, '해당 방과 후 수업을 찾을 수 없습니다.');
  }
  await AfterschoolApplicationModel.deleteMany({
    afterschool: afterschool._id,
  });
  await afterschool.deleteOne();
  res.json({ afterschool });
};
