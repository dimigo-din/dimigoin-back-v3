import { Request, Response } from 'express';
import { HttpException } from '../exceptions';
import { Controller } from '../classes';
import { IngangApplicationModel } from '../models';
import Route from '../resources/RouteGenerator';
import { getOnlyDate } from '../resources/date';

class CircleApplicationController extends Controller {
  public basePath = '/ingang/application';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/',
      Route(['T', 'S'], this.requiredKeys.none, this.getAllIngangApplications));

    this.router.post('/',
      Route(['S'], this.requiredKeys.none, this.createIngangApplication));

    this.router.delete('/',
      Route(['S'], this.requiredKeys.none, this.removeIngangApplication));
  }

  private getIngangStatus = async (req: Request, res: Response) => {
    // Config랑 연동
    res.json({
      ticketCount: 3,
    });
  }

  private getAllIngangApplications = async (req: Request, res: Response) => {
    const { userType, _id: applier } = this.getUserIdentity(req);
    if (userType === 'T') {
      const ingangApplications = await IngangApplicationModel.find({});
      res.json({ ingangApplications });
    } else if (userType === 'S') {
      const ingangApplications = await IngangApplicationModel.find({
        applier,
      });
      res.json({ ingangApplications });
    } else {
      throw new HttpException(403, '권한이 없습니다.');
    }
  }

  private createIngangApplication = async (req: Request, res: Response) => {
    const { _id: applier, class: _class } = this.getUserIdentity(req);
    const date = getOnlyDate();
    const { time } = req.body;
    const existing = await IngangApplicationModel.findOne({
      applier,
      date,
      time,
    });
    if (existing) throw new HttpException(409, '이미 해당 시간 인강실을 신청했습니다.');

    const todayAll = await IngangApplicationModel.find({
      date,
      time,
    }).populate('applier');

    // @ts-ignore
    if (todayAll.filter((v) => v.applier.class === _class).length >= 9) {
      throw new HttpException(403, '최대 인강실 인원을 초과했습니다.');
    }

    const ingangApplication = new IngangApplicationModel();
    Object.assign(ingangApplication, {
      ...req.body,
      applier,
    });
    await ingangApplication.save();
    res.json({ ingangApplication });
  }

  private removeIngangApplication = async (req: Request, res: Response) => {
    const { _id: applier } = this.getUserIdentity(req);
    const date = getOnlyDate();
    const ingangApplication = await IngangApplicationModel.findOne({
      applier,
      date,
      time: req.body.time,
    });
    if (!ingangApplication) throw new HttpException(404, '해당 시간 신청한 인강실이 없습니다.');
    await ingangApplication.remove();
    res.json({ ingangApplication });
  }
}

export default CircleApplicationController;
