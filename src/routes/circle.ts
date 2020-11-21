import { Controller } from '../classes';
import { checkUserType } from '../middlewares';
import {
  getAllCircles,
  getOneCircle,
} from '../controllers/circle';
import wrapper from '../resources/wrapper';

class CircleController extends Controller {
  public basePath = '/circle';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('S', 'T'), wrapper(getAllCircles));

    this.router.get('/id/:circleId', checkUserType('S', 'T'), wrapper(getOneCircle));
  }
}

export default CircleController;
