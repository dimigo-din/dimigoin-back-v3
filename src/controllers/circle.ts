import { NextFunction, Request, Response } from 'express';
import { Controller } from '../classes';
import { CircleModel, CircleApplicationModel } from '../models';
import { checkUserType } from '../middlewares';

class CircleController extends Controller {
  public basePath = '/circle';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('S', 'T'), this.getAllCircles);

    this.router.get('/id/:circleId', checkUserType('S', 'T'), this.getOneCircle);
  }

  private getAllCircles = async (req: Request, res: Response, next: NextFunction) => {
    const user = await this.getUserIdentity(req);
    const applications = await CircleApplicationModel.findByApplier(user._id);
    const appliedIds = await Promise.all(
      applications.map((application) => application.circle.toString()),
    );
    const circleModels = await CircleModel.find()
      .populate('chair', ['name', 'serial'])
      .populate('viceChair', ['name', 'serial']);
    const circles = await Promise.all(circleModels.map((circle) => {
      if (appliedIds.includes(circle._id.toString())) {
        circle.applied = true;
      }
      return circle;
    }));
    res.json({ circles });
  }

  private getOneCircle = async (req: Request, res: Response, next: NextFunction) => {
    const { circleId } = req.params;
    const circle = await CircleModel.findById(circleId)
      .populate('chair', ['name', 'serial'])
      .populate('viceChair', ['name', 'serial']);
    res.json({ circle });
  }
}

export default CircleController;
