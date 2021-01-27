import * as controllers from './controllers';

export default {
  baseURL: '/circle',
  routes: [
    {
      method: 'get',
      path: '/',
      allowedUserTypes: ['S', 'T'],
      handler: controllers.getAllCircles,
    },
    {
      method: 'get',
      path: '/:circleId',
      allowedUserTypes: ['S', 'T'],
      handler: controllers.getOneCircle,
    },
  ],
};
