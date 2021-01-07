import { Request, Response } from 'express';
import { Controller } from '../classes';

class RootController extends Controller {
  public basePath = '/';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', this.getInfo);
  }

  private getInfo = async (req: Request, res: Response) => {
    res.json({
      name: 'DimigoIN Backend Server V3',
      documentation:
        'https://www.notion.so/DIMIGOin-API-c708cba8bd5749258b92c0aa4788a22e',
      repository:
        'http://github.com/dimigoin/dimigoin-back-v3',
    })
  };
}

export default RootController;
