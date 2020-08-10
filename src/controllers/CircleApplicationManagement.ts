import { NextFunction, Request, Response } from 'express';
import { Controller } from '../classes';
import { CircleApplicationModel, CircleApplicationQuestionModel } from '../models';
import Route from '../resources/RouteGenerator';

class CircleApplicationManagementController extends Controller {
  public basePath = '/circle';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/application/form',
      Route(['S', 'T'], this.requiredKeys.none, this.getApplicationForm));
    this.router.put('/application/form',
      Route(['T'], this.requiredKeys.updateApplicationForm, this.updateApplicationForm));
    this.router.get('/applier',
      Route(['T'], this.requiredKeys.none, this.getAllApplications));
  }

  private getApplicationForm = async (req: Request, res: Response, next: NextFunction) => {
    const form = await CircleApplicationQuestionModel.find();
    res.json({ form });
  }

  private updateApplicationForm = async (req: Request, res: Response, next: NextFunction) => {
    const { form } = req.body;
    await CircleApplicationQuestionModel.deleteMany({});
    await CircleApplicationQuestionModel.create(form);
    res.json({ form });
  }

  private getAllApplications = async (req: Request, res: Response, next: NextFunction) => {
    const applications = await CircleApplicationModel.find()
      .populate('circle', ['name'])
      .populate('applier', ['name', 'serial']);
    res.json({ applications });
  }
}

export default CircleApplicationManagementController;
