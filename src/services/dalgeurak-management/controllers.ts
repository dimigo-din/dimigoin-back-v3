import { Request, Response } from 'express';
import { getStudentInfo } from '../../resources/dimi-api';
import { HttpException } from '../../exceptions';
import { PermissionModel } from '../../models';

export const addPermission = async (req: Request, res: Response) => {
  const { sid } = req.body;

  const student = await getStudentInfo(sid);
  if (!student) throw new HttpException(404, '유저를 찾을 수 없습니다.');

  const { permissions } = await PermissionModel.findOne({ userId: sid });

  if (permissions.indexOf('dalgeurak') !== -1) throw new HttpException(401, '이미 권한을 가지고 있습니다.');

  await PermissionModel.updateOne(
    { userId: sid },
    { permissions: [...permissions, 'dalgeurak'] },
  );

  res.json({ student });
};

export const removePermission = async (req: Request, res: Response) => {
  const { sid } = req.body;

  const student = await getStudentInfo(sid);
  if (!student) throw new HttpException(404, '유저를 찾을 수 없습니다.');

  const { permissions } = await PermissionModel.findOne({ userId: sid });

  // const permissions = student.permissions.filter((s) => s !== 'dalgeurak');
  // await UserModel.updateOne({ _id: sid }, { permissions });
  await PermissionModel.updateOne(
    { userId: sid },
    { permissions: permissions.filter((s) => s !== 'dalgeurak') },
  );

  res.json({ student });
};

export const mandate = async (req: Request, res: Response) => {
  const { sid } = req.body;

  const student = await getStudentInfo(sid);
  if (!student) throw new HttpException(404, '유저를 찾을 수 없습니다.');

  const { permissions } = await PermissionModel.findOne({ userId: sid });

  await PermissionModel.updateOne(
    { userId: sid },
    { permissions: [...permissions, 'dalgeurak-management'] },
  );

  const user = await getStudentInfo(req.user.user_id);
  const userPermissions = await PermissionModel.findOne({ userId: user.user_id });

  await PermissionModel.updateOne(
    { userId: req.user.user_id },
    { permissions: userPermissions.permissions.filter((s) => s !== 'dalgeurak-management') },
  );

  res.json({ student });
};
