import { Router } from 'express';
import { ingangModel } from '../models';

const router = Router();

/**
 * @description 자신의 신청 현황을 불러옵니다.
 */
router.get('/', async ({}, { json }) => {
  const ingangs = await ingangModel.find({});
  json({ ingangs });
});

/**
 * @description 인강실을 신청합니다.
 */
router.post('/', async ({ body }, { json }) => {
  const ingang = await ingangModel.create(body);
  json(ingang);
});

/**
 * @description 인강실을 취소합니다.
 */
router.delete('/', (req, res, next) => {});

export default router;
