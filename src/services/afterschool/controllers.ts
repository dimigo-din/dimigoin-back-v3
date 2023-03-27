import { Request, Response } from 'express';
import { getTeacherInfo, teacherSearch } from '../../resources/dimi-api';
import { HttpException } from '../../exceptions';
// import {
//   getAfterschoolApplierCount,
//   removeAfterschoolApplierCount,
// } from '../../resources/redis';
import { AfterschoolModel, AfterschoolApplicationModel } from '../../models';

const applierCountMapper = async (afterschool: any) => {
  const applierCount = await AfterschoolApplicationModel.count({
    afterschool: afterschool._id,
  });
  return {
    ...(typeof afterschool === 'object' ? afterschool : afterschool.toJSON()),
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
    .populateTs('place');

  const tids = afterschools.map((e) => e.teacher);
  const teachersIdx = tids.filter((v, i) => tids.indexOf(v) === i);

  const teachers = await teacherSearch({
    user_id: teachersIdx,
  });

  const processData: Array<any> = [];

  for (const afterschool of afterschools) {
    const idx = teachers.findIndex((v) => v.user_id === afterschool.teacher);
    const user = teachers[idx];
    delete (afterschool as any)._doc.teacher;
    processData.push({
      ...(afterschool as any)._doc,
      teacher: user,
    });
  }
  const mappedAfterschools = await Promise.all(
    processData.map(applierCountMapper),
  );

  res.json({ afterschools: mappedAfterschools });
};

export const getAfterschool = async (req: Request, res: Response) => {
  const afterschool = await AfterschoolModel.findById(
    req.params.afterschoolId,
  )
    .populateTs('place');
  if (!afterschool) {
    throw new HttpException(404, '해당 방과 후 수업을 찾을 수 없습니다.');
  }
  (afterschool.teacher as any) = await getTeacherInfo(afterschool.teacher);
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
  // await removeAfterschoolApplierCount(afterschool._id);
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
