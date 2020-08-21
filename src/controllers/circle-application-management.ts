import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { Controller } from '../classes';
import {
  CircleApplicationModel,
  CircleApplicationQuestionModel,
} from '../models';
import { validator } from '../middlewares';

class CircleApplicationManagementController extends Controller {
  public basePath = '/circle';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // S, T
    this.router.get('/application/form', this.getApplicationForm);

    // T
    this.router.put('/application/form', validator(Joi.object({
      form: Joi.object().required(),
    })), this.updateApplicationForm);

    // T
    this.router.get('/applier', this.getAllApplications);
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
