import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '인강실 신청 서비스',
  baseURL: '/ingang-application',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      handler: controllers.getTodayIngangApplications,
    },
    {
      method: 'get',
      path: '/entire',
      needAuth: true,
      needPermission: true,
      handler: controllers.getTodayEntireIngangApplications,
    },
    {
      method: 'get',
      path: '/export/grade/:grade',
      needAuth: true,
      needPermission: true,
      handler: controllers.exportTodayIngangApplications,
    },
    {
      method: 'get',
      path: '/status',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      handler: controllers.getIngangApplicationStatus,
    },
    {
      method: 'post',
      path: '/time/:time',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      handler: controllers.createIngangApplication,
    },
    {
      method: 'delete',
      path: '/time/:time',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      handler: controllers.removeIngangApplication,
    },
  ],
});
