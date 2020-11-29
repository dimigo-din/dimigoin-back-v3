import { Request, Response } from 'express';
import { HttpException } from '../exceptions';
import { DetsModel } from '../models';
// import {IDetsInput,IDets} from '../interfaces/dets'

export const getDetsList = async (req: Request, res: Response) => {
  const Dets = await DetsModel.find({});
  res.json({ Dets });
};

export const getDets = async (req: Request, res: Response) => {
  const dets = await DetsModel.findById(req.params.detsID);
  res.json({ dets });
};

export const createDets = async (req: Request, res: Response) => {
  const dets = new DetsModel();
  Object.assign(dets, req.body);

  await dets.save();

  res.json({ dets });
};

export const editDets = async (req: Request, res: Response) => {
  const dets = await DetsModel.findById(req.params.noticeId);
  if (!dets) throw new HttpException(404, '해당 뎃츠를 찾을 찾을 수 없습니다.');
  Object.assign(dets, req.body);
  await dets.save();
  res.json({ dets });
};
