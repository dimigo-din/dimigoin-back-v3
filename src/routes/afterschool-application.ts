import { Controller } from '../classes';
import {
  applyAfterschool,
  cancelApplication,
} from '../controllers/afterschool-application';
import wrapper from '../resources/wrapper';
import { checkUserType } from '../middlewares';

class AfterschoolController extends Controller {
  public basePath = '/afterschool-application';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/:afterschoolId', checkUserType('S'), wrapper(applyAfterschool));
    this.router.delete('/:afterschoolId', checkUserType('S'), wrapper(cancelApplication));
  }
}

export default AfterschoolController;
