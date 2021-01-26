import * as controllers from './controllers';

export default {
  baseURL: '/timetable',
  routes: [
    {
      method: 'get',
      path: '/weekly/grade/:grade/class/:class',
      handler: controllers.getWeeklyTimetable,
    },
  ],
};
