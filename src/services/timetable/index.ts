import * as controllers from './controllers';

export default {
  name: '시간표 서비스',
  baseURL: '/timetable',
  routes: [
    {
      method: 'get',
      path: '/weekly/grade/:grade/class/:class',
      handler: controllers.getWeeklyTimetable,
    },
  ],
};
