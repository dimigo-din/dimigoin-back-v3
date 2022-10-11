import { Request, Response } from 'express';
import { DetsApplicationModel } from '../../models';
import { HttpException } from '../../exceptions';
import { DetsModel } from '../../models/dets';
import { getStudentInfo } from '../../resources/dimi-api';

export const getAllDetsClasses = async (req: Request, res: Response) => {
  const { userType, grade } = req.user;
  const detsClasses = await DetsModel.find(
    userType === 'T' ? {} : {
      targetGrade: grade,
    },
  )
    .populateTs('place');

  detsClasses.forEach(async (e, idx) => {
    (detsClasses[idx].speaker as any) = await getStudentInfo(e.speaker);
  });

  res.json({ detsClasses });
};

export const getDetsClass = async (req: Request, res: Response) => {
  const detsClass = await DetsModel.findById(
    req.params.detsClassId,
  )
    .populateTs('place');
  if (!detsClass) {
    throw new HttpException(404, '해당 DETS 수업을 찾을 수 없습니다.');
  }

  (detsClass.speaker as any) = await getStudentInfo(detsClass.speaker);

  res.json({ detsClass });
};

export const createDetsClass = async (req: Request, res: Response) => {
  const detsClass = new DetsModel(req.body);
  await detsClass.save();
  res.json({ detsClass });
};

export const deleteDetsClass = async (req: Request, res: Response) => {
  const detsClass = await DetsModel.findById(req.params.detsClassId);
  if (!detsClass) {
    throw new HttpException(404, '해당 DETS 수업을 찾을 수 없습니다.');
  }
  await DetsApplicationModel.deleteMany({
    dets: detsClass._id,
  });
  await detsClass.deleteOne();
  res.json({ detsClass });
};

export const editDetsClass = async (req: Request, res: Response) => {
  const detsClass = await DetsModel.findById(req.params.detsClassId);
  if (!detsClass) {
    throw new HttpException(404, '해당 DETS 수업을 찾을 수 없습니다.');
  }
  Object.assign(detsClass, req.body);
  await detsClass.save();
  res.json({ detsClass });
};
