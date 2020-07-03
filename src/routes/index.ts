import { Router, Response } from 'express';

const router = Router();

// Use imported routes

router.use('/', (_, res: Response) => {
  res.status(200).send('👋 DIMIGOin Backnd Server');
});

export default router;
