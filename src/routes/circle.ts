import { Controller } from '../classes';
import { checkUserType } from '../middlewares';
import {
  getAllCircles,
  getOneCircle,
} from '../controllers/circle';

class CircleController extends Controller {
  public basePath = '/circle';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('S', 'T'), getAllCircles);

    this.router.get('/id/:circleId', checkUserType('S', 'T'), getOneCircle);
  }
}

export default CircleController;
