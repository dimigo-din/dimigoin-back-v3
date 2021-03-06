import uploader from 'express-fileupload';
import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '파일 서비스',
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
    {
      method: 'post',
      path: '/',
      needAuth: true,
      needPermission: false,
      middlewares: [uploader({
        limits: { fileSize: 100 * 1024 * 1024 },
        abortOnLimit: true,
      })],
      handler: controllers.uploadFile,
    },
  ],
});
