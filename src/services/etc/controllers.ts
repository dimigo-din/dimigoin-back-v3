import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import config from '../../config';
import {
  manuallyRunCronJobs as runCronJobs,
} from '../../resources/cron';

export const manuallyRunCronJobs = async (req: Request, res: Response) => {
  if (req.params.password !== config.manualCronPassword) {
    throw new HttpException(401, '크론 패스워드가 올바르지 않습니다.');
  }
  await runCronJobs();
  res.json({ message: '모든 크론탭 작업이 실행되었습니다.' });
};
