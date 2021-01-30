import request from 'supertest';
import App from '../src/app';
const { app } = new App();

describe('서버 앱 구동 테스트', () => {
  test('서버 어플리케이션 문서가 정상적으로 반환되는지 확인합니다', async (done) => {
    const response = await request(app).get('/docs');
    expect(response.status).toBe(200);
    done();
  });
});
