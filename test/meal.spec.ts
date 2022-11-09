import request from 'supertest';
import App from '../src/app';

const { app } = new App();

describe('식단표 서비스 테스트', () => {
  const today = new Date();
  const dateString = `${today.getFullYear()}-`
    + `${(today.getMonth() + 1).toString().padStart(2, '0')}-`
    + `${today.getDate()}`;

  // TODO: 식단 등록 서비스 테스트 구현
  // TODO: 토큰 발급 구현

  test('주간 식단표가 정상적으로 반환되는지 확인합니다', async (done) => {
    const response = await request(app).get('/meal/weekly');
    expect(response.status).toBe(200);
    done();
  });

  // test('일별 식단표가 정상적으로 반환되는지 확인합니다', async (done) => {
  //   const response = await request(app).get(`/meal/date/${dateString}`);
  //   expect(response.status).toBe(200);
  //   done();
  // });
});
