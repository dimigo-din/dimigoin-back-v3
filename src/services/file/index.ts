import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '파일 다운로드 서비스',
  baseURL: '/file',
  routes: [
    {
      method: 'get',
      path: '/download/:fileId',
      needAuth: false,
      needPermission: false,
      handler: controllers.downloadFile,
    },
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: false,
      handler: controllers.getMyFileList,
    },
  ],
});
