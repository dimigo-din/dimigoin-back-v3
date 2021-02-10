import * as controllers from './controllers';

export default {
  name: '기타 엔드포인트',
  baseURL: '/etc',
  routes: [
    {
      method: 'get',
      path: '/cron/run/:password',
      handler: controllers.manuallyRunCronJobs,
    },
  ],
};
