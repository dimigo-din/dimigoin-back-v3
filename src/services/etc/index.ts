import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '기타 엔드포인트',
  baseURL: '/etc',
  routes: [
    {
      method: 'get',
      path: '/cron/run/:password',
      needAuth: false,
      needPermission: false,
      handler: controllers.manuallyRunCronJobs,
    },
  ],
});
