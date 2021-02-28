import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '멘토링 수강 신청 서비스',
  baseURL: '/mentoring-application',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: false,
      handler: controllers.getMyAllApplications,
    },
    {
      method: 'post',
      path: '/export',
      needAuth: true,
      needPermission: true,
      handler: controllers.exportWeeklyMentoringApplications,
    },
    {
      method: 'post',
      path: '/:mentoringId/date/:date',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      handler: controllers.applyMentoring,
    },
    {
      method: 'delete',
      path: '/:mentoringId/date/:date',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      handler: controllers.cancelApplication,
    },
  ],
});
