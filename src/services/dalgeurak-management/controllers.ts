import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import { UserModel } from '../../models';

export const addPermission = async (req: Request, res: Response) => {
  const { sid } = req.body;

  const student = await UserModel.findById(sid)
    .select('permissions')
    .select('serial')
    .select('name');
  if (!student) throw new HttpException(404, '유저를 찾을 수 없습니다.');

  if (student.permissions.indexOf('dalgeurak') !== -1) throw new HttpException(401, '이미 권한을 가지고 있습니다.');

  const permissions = [...student.permissions, 'dalgeurak'];
  await UserModel.updateOne({ _id: sid }, { permissions });

  res.json({ student });
};

export const removePermission = async (req: Request, res: Response) => {
  const { sid } = req.body;

  const student = await UserModel.findById(sid)
    .select('permissions')
    .select('serial')
    .select('name');
  if (!student) throw new HttpException(404, '유저를 찾을 수 없습니다.');

  const permissions = student.permissions.filter((s) => s !== 'dalgeurak');
  await UserModel.updateOne({ _id: sid }, { permissions });

  res.json({ student });
};

export const mandate = async (req: Request, res: Response) => {
  const { sid } = req.body;

  const student = await UserModel.findById(sid)
    .select('permissions')
    .select('serial')
    .select('name');
  if (!student) throw new HttpException(404, '유저를 찾을 수 없습니다.');

  await UserModel.updateOne({ _id: sid }, { permissions: [...student.permissions, 'dalgeurak-management'] });

  const user = await UserModel.findById(req.user._id).select('permissions');
  const permissions = user.permissions.filter((s) => s !== 'dalgeurak-management');

  Object.assign(user, { permissions });
  await user.save();

  res.json({ student });
};
