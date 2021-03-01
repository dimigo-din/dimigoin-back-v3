import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '뎃츠 수강 신청 서비스',
  baseURL: '/dets-application',
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
      path: '/:detsClassId',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      handler: controllers.applyDetsClass,
    },
    {
      method: 'delete',
      path: '/:detsClassId',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      handler: controllers.cancelApplication,
    },
  ],
});
