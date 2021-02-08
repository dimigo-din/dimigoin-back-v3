import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import { DetsModel } from '../../models';

export const getDetsList = async (req: Request, res: Response) => {
  const { userType, grade } = req.user;
  const Dets = await DetsModel.find(
    userType === 'T' ? {} : { targetGrade: { $all: [grade] } },
  );
  res.json({ Dets });
};

export const getDets = async (req: Request, res: Response) => {
  const dets = await DetsModel.findById(req.params.detsId);
  res.json({ dets });
};

export const createDets = async (req: Request, res: Response) => {
  const detsData = req.body;
  detsData.speakerID = req.user._id;
  const dets = new DetsModel(detsData);
  await dets.save();
  res.json({ dets });
};

export const editDets = async (req: Request, res: Response) => {
  const dets = await DetsModel.findById(req.params.detsId);
  if (!dets) throw new HttpException(404, '해당 뎃츠를 찾을 찾을 수 없습니다.');
  if (dets.speakerID === req.user._id) {
    Object.assign(dets, req.body);
    await dets.save();
    res.json({ dets });
  }
  if (dets.speakerID !== req.user._id) {
    throw new HttpException(403, '해당 뎃츠의 소유자가 아닙니다.');
  }
};

export const removeDets = async (req: Request, res: Response) => {
  const dets = await DetsModel.findById(req.params.detsId);
  if (!dets) throw new HttpException(404, '해당 뎃츠를 찾을 찾을 수 없습니다.');
  if (dets.speakerID === req.user._id) {
    await dets.remove();
    res.json({ dets });
  }
  if (dets.speakerID !== req.user._id) {
    throw new HttpException(403, '해당 뎃츠의 소유자가 아닙니다.');
  }
};
