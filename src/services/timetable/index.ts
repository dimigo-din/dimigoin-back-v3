import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '시간표 서비스',
  baseURL: '/timetable',
  routes: [
    {
      method: 'get',
      path: '/weekly/grade/:grade/class/:class',
      needAuth: false,
      needPermission: false,
      handler: controllers.getWeeklyTimetable,
    },
  ],
});
