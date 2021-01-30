import { Request, Response } from 'express';
import { PlaceModel } from '../../models';
import { HttpException } from '../../exceptions';

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
  Object.assign(place, req.body);
  await place.save();
  res.json({ place });
};

export const deletePlace = async (req: Request, res: Response) => {
  const place = await PlaceModel.findById(req.params.placeId);
  if (!place) throw new HttpException(404, '해당 장소가 없습니다.');

  await place.remove();

  res.json({ place });
};

export const getPrimaryPlaces = async (req: Request, res: Response) => {
  const { grade, class: klass, gender } = req.user;
  const gp = async (name: string) =>
    (await PlaceModel.findOne({ name })).toJSON();

  const primaryPlaces = [
    { label: '교실', ...await gp(`${grade}학년 ${klass}반`) },
    { label: '안정실', ...await gp('안정실') },
    {
      label: '세탁',
      ...({
        M: await gp('학봉관'),
        F: await gp('우정학사'),
      }[gender]),
    },
    {
      label: '인강실',
      ...([
        await gp('영어 전용 교실'),
        await gp('비즈쿨실'),
        await gp('열람실'),
      ][grade - 1]),
    },
  ];

  res.json({ places: primaryPlaces });
};
