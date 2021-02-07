import * as controllers from './controllers';

export default {
  name: '파일 다운로드 서비스',
  baseURL: '/file',
  routes: [
    {
      method: 'get',
      path: '/:fileId',
      handler: controllers.downloadFile,
    },
    {
      method: 'get',
      path: '/',
      handler: controllers.getMyFileList,
    },
  ],
};
