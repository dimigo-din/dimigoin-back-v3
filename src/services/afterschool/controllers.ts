/* eslint-disable array-callback-return */
/* eslint-disable no-unused-expressions */
import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import {
  getAfterschoolApplierCount,
  removeAfterschoolApplierCount,
} from '../../resources/redis';
import { AfterschoolModel, AfterschoolApplicationModel } from '../../models';

const applierCountMapper = async (afterschool: any) => {
  const applierCount = await getAfterschoolApplierCount(
    afterschool._id,
  );
  return {
    ...(afterschool.toJSON()),
    applierCount,
  };
};

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
  const myAfterschoolApplicationList:string[] = [];

  await AfterschoolApplicationModel.find(
    userType === 'T' ? {} : {
      applier: req.user._id,
    },
  ).map((v:any) => (myAfterschoolApplicationList.push(v.afterschool)));

  const mappedAfterschools = await Promise.all(
    afterschools.map((v:any) => {
      v = applierCountMapper(v);
      myAfterschoolApplicationList.includes(v._id) ? v.isApplied = true : v.isApplied = false;
    }),
  );
  res.json({ afterschools: mappedAfterschools });
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
  const mappedAfterschool = await applierCountMapper(afterschool);
  res.json({ afterschool: mappedAfterschool });
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
  await removeAfterschoolApplierCount(afterschool._id);
  res.json({ afterschool });
};

export const editAfterschool = async (req: Request, res: Response) => {
  const afterschool = await AfterschoolModel.findById(req.params.afterschoolId);
  if (!afterschool) {
    throw new HttpException(404, '해당 방과 후 수업을 찾을 수 없습니다.');
  }
  Object.assign(afterschool, req.body);
  await afterschool.save();
  res.json({ afterschool });
};
