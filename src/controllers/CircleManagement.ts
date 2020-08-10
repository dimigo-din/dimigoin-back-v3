import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions';
import { Controller } from '../classes';
import { CircleModel, UserModel } from '../models';
import Upload from '../resources/Upload';
import Route from '../resources/RouteGenerator';

class CircleManagementController extends Controller {
  public basePath = '/circle';

  private UploadClient = new Upload();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/',
      Route(['T', 'S'], this.requiredKeys.createCircle, this.createCircle));
    this.router.delete('/:circleId',
      Route(['T'], this.requiredKeys.none, this.removeCircle));
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
