import { Controller } from '../classes';

class AttendanceLogController extends Controller {
  public basePath = '/attendance-log';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {}
}

export default AttendanceLogController;
