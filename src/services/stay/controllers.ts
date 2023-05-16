import { Request, Response } from 'express';
import { StayApplicationModel, StayModel } from '../../models';
import { HttpException } from '../../exceptions';

export const getAllStays = async (req: Request, res: Response) => {
  const stays = await StayModel.find({});

  res.json({ stays });
};

export const getStay = async (req: Request, res: Response) => {
  const stay = await StayModel.findById(req.params.stayId);

  if (!stay) throw new HttpException(404, '해당 잔류일정을 찾을 수 없습니다.');
  res.json({ stay });
};

export const getCurrentStay = async (req: Request, res: Response) => {
  const stay = await StayModel.findOne({ disabled: false, deleted: false });

  res.json({ stay });
};

export const createStay = async (req: Request, res: Response) => {
  const existingStay = await StayModel.findOne({ disabled: false, deleted: false });
  if (existingStay) throw new HttpException(404, '이미 활성화된 잔류일정이 있습니다.');

  const data = await StayModel.create({ ...req.body });

  res.json({ data });
};

export const manageStatus = async (req: Request, res: Response) => {
  const stay = await StayModel.findById(req.params.stayId);

  if (!stay) throw new HttpException(404, '해당 잔류일정을 찾을 수 없습니다.');

  stay.disabled = req.body.status;
  stay.save();

  res.json({ stay });
};

export const deleteStay = async (req: Request, res: Response) => {
  const stay = await StayModel.findById(req.params.stayId);

  if (!stay) throw new HttpException(404, '해당 잔류일정을 찾을 수 없습니다.');

  stay.disabled = true;
  stay.deleted = true;
  stay.save();

  res.json({ stay });
};

export const getMyStay = async (req: Request, res: Response) => {
  const stay = await StayModel.findOne({ disabled: false, deleted: false });
  const stayApply = await StayApplicationModel.findOne({ stay: stay._id });

  if (!stayApply) throw new HttpException(404, '잔류를 신청하지 않았습니다.');

  res.json({ stayApply });
};

export const applyStay = async (req: Request, res: Response) => {
  const stay = await StayModel.findOne({ disabled: false, deleted: false });
  const now = new Date();
  if (new Date(stay.startline) > now || new Date(stay.deadline) < now) throw new HttpException(404, '잔류 신청기간이 아닙니다.');

  const existingApply = await StayApplicationModel.findOne({ user: req.user.user_id, stay: stay._id });
  if (existingApply) throw new HttpException(404, '잔류를 이미 신청했습니다.');

  const stayApply = await StayApplicationModel.create({
    ...req.body, stay: stay._id, user: req.user.user_id,
  });

  res.json({ stayApply });
};

export const cancelStay = async (req: Request, res: Response) => {
  const stay = await StayModel.findOne({ disabled: false, deleted: false });
  const now = new Date();
  if (new Date(stay.startline) > now || new Date(stay.deadline) < now) throw new HttpException(404, '잔류 신청기간이 아닙니다.');

  const result = await StayApplicationModel.updateOne({ user: req.user.user_id }, { $set: { deleted: true } });
  if (result.nModified === 0) throw new HttpException(404, '잔류신청을 하지 않았습니다.');
  else res.json({ success: true });
};
