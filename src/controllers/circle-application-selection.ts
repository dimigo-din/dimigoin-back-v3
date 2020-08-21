import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { HttpException } from '../exceptions';
import { Controller } from '../classes';
import { CircleApplicationModel, CircleModel, UserModel } from '../models';
import { ConfigKeys, CirclePeriod, CircleApplicationStatusValues } from '../types';
import { validator, checkUserType } from '../middlewares';

class CircleApplierSelection extends Controller {
  public basePath = '/circle/selection/applier';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('S'), this.getApplications);

    this.router.patch('/:applierId', checkUserType('S'), validator(Joi.object({
      status: Joi.string().valid(...CircleApplicationStatusValues).required(),
    })), this.setApplierStatus);
  }

  private getApplications = async (req: Request, res: Response, next: NextFunction) => {
    const user = await this.getUserIdentity(req);
    const circle = await CircleModel.findByChairs(user._id);

    const applications = await CircleApplicationModel
      .findPopulatedByCircle(circle._id);

    res.json({ applications });
  }

  private setApplierStatus = async (req: Request, res: Response, next: NextFunction) => {
    const applier = await UserModel.findById(req.params.applierId);
    if (!applier) throw new HttpException(404, '해당 학생을 찾을 수 없습니다.');

    const user = await this.getUserIdentity(req);
    const circle = await CircleModel.findByChairs(user._id);
    if (!circle) throw new HttpException(403, '권한이 없습니다.');

    const application = await CircleApplicationModel.findByCircleApplier(circle._id, applier._id);
    if (!application) throw new HttpException(404, '해당 지원서를 찾을 수 없습니다.');

    const { status } = req.body;
    const period = (await this.config)[ConfigKeys.circlePeriod];

    if ((period === CirclePeriod.application && !status.includes('document'))
        || (period === CirclePeriod.interview && !status.includes('interview'))
        || (period === CirclePeriod.final)) {
      throw new HttpException(400, '현재 해당 상태로 지원서를 변경할 수 없습니다.');
    }
    application.status = status;
    await application.save();
    res.json({ application });
  }
}

export default CircleApplierSelection;
