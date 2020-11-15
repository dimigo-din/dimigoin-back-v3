import { Request, Response } from 'express';
import { PlaceModel } from '../models';
import { HttpException } from '../exceptions';

export const createPlace = async (req: Request, res: Response) => {
  const payload = req.body;
  const place = new PlaceModel(payload);
  await place.save();

  res.json({ place });
};

export const getAllPlaces = async (req: Request, res: Response) => {
  const places = await PlaceModel.find({});

  res.json({ places });
};

export const getPlace = async (req: Request, res: Response) => {
  const place = await PlaceModel.findById(req.params.placeId);
  if (!place) throw new HttpException(404, '해당 장소가 없습니다.');
  res.json({ place });
};

export const editPlace = async (req: Request, res: Response) => {
  const place = await PlaceModel.findById(req.params.placeId);
  if (!place) throw new HttpException(404, '해당 장소가 없습니다.');

  const payload = req.body;
  Object.assign(place, payload);

  await place.save();
  res.json({ place });
};

export const deletePlace = async (req: Request, res: Response) => {
  const place = await PlaceModel.findById(req.params.placeId);
  if (!place) throw new HttpException(404, '해당 장소가 없습니다.');

  await place.remove();

  res.json({ place });
};
