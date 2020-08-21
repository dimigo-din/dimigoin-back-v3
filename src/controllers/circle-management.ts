import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { HttpException } from '../exceptions';
import { Controller } from '../classes';
import { CircleModel, UserModel } from '../models';
import Upload from '../resources/upload';
import { validator } from '../middlewares';

class CircleManagementController extends Controller {
  public basePath = '/circle';

  private UploadClient = new Upload();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // T, S
    this.router.post('/', validator(Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      chair: Joi.string().required(),
      viceChair: Joi.string().required(),
      videoLink: Joi.string().required(),
    })), this.createCircle);

    // T
    this.router.delete('/:circleId', this.removeCircle);
  }

  private createCircle = async (req: Request, res: Response, next: NextFunction) => {
    const circle = Object.assign(req.body, {
      imageKey: `CIRCLE_PROFILE/${req.body.name}.png`,
    });

    const chair = await UserModel.findStudentById(circle.chair);
    const viceChair = await UserModel.findStudentById(circle.viceChair);
    if (!chair || !viceChair) throw new HttpException(404, '해당 학생을 찾을 수 없습니다.');

    const newCircle = await CircleModel.create(circle);

    res.json({ circle: newCircle });
  }

  private removeCircle = async (req: Request, res: Response, next: NextFunction) => {
    const circle = await CircleModel.findById(req.params.circleId);
    if (!circle) throw new HttpException(404, '해당 동아리를 찾을 수 없습니다.');
    await circle.remove();
    res.json({ circle });
  }
}

export default CircleManagementController;
