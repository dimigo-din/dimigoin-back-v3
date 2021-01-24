import { Controller } from '../classes';
import {
  getWeeklyTimetable,
} from '../controllers/timetable';
import wrapper from '../resources/wrapper';

class TimetableController extends Controller {
  public basePath = '/timetable';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/weekly/grade/:grade/class/:class', wrapper(getWeeklyTimetable));
  }
}

export default TimetableController;
