import axios from 'axios';
import config from '../config';
import {
  getYYYYMMDD,
  getWeekStart,
  getWeekEnd,
  getTomorrow,
} from '../resources/date';
import * as Timetable from '../models/timetable';

const TEMP_DATE = '2020-11-15';

/* eslint-disable */
const aliases: {
  [key: string]: string;
} = {
  '디자인 일반': '디일',
  '통합사회': '사회',
  '미술': '미술',
  '통합과학': '과학',
  '프로그래밍': '플밍',
  '컴퓨터 시스템 일반': '컴일',
  '수학Ⅰ': '수학Ⅰ',
  '회계 원리': '회계',
  '영어Ⅰ': '영어Ⅰ',
  '운동과 건강': '체육',
  '문화 콘텐츠 산업 일반': '문콘',
  '상업 경제': '상경',
  '중국어Ⅰ': '중국어',
  '정보 처리와 관리': '정처',
  '화학I': '화학',
  '물리학Ⅰ': '물리',
  '자료 구조': '자료구조',
  '문학': '문학',
  '성공적인 직업생활': '성직',
  '공업수학': '공수',
  '* 보안 장비 운용': '정보보호',
  '* 모의해킹': '정보보호',
  '정보 통신': '정통',
  '진로활동': '진로',
  '영어': '영어',
  '마케팅과 광고': '마케팅',
  '고전 읽기': '고전',
  '* 2D 애니메이션 레이아웃': '애콘',
  '미적분': '미적분',
  '비즈니스 영어': '비즈니스',
  '공업 일반': '공업 일반',
  '* 네트워크 보안 운영': '네트워크',
  '동아리활동': '동아리',
  '확률과 통계': '확통',
  '자율활동': '자율',
  '* 시스템 보안 운영': '시스템',
  '* 데이터베이스 구현': 'DB',
  '토요휴업일': '쉬는 날',
  '* 편곡': '음콘',
  '* 프로그래밍 언어 활용': '응프화',
  '* UI/UX 디자인': '응프화',
  '* UI 디자인': '응프화',
  '* 화면 구현': '응프화',
  // '* 사후관리': '* 사후관리',
  // '* 그래픽 제작': '* 그래픽 제작',
  // '* 캐릭터 디자인': '애콘',
  // '* 펌웨어 구현': '* 펌웨어 구현',
  // '* 네트워크 소프트웨어 개발 방법 수립': '* 네트워크 소프트웨어 개발 방법 수립',
  // '* 데이터베이스 요구사항 분석': '* 데이터베이스 요구사항 분석',
  // '* 자금관리': '자금관리',
  // '* 제작준비': '* 제작준비'
  // '* 시장환경분석': '* 시장환경분석',
  // '* 판매관리': '판매관리',
  // '* 작품 선정': '작품 선정',
};
/* eslint-enable */

const getAPIEndpoint = (grade: number, klass: number, date: Date) => (
  'https://open.neis.go.kr/hub/hisTimetable?'
  + `KEY=${config.neisAPIKey}&`
  + 'Type=json&'
  + 'pSize=1000&'
  + 'pIndex=1&'
  + 'ATPT_OFCDC_SC_CODE=J10&'
  + 'SD_SCHUL_CODE=7530560&'
  + `GRADE=${grade}&`
  + `CLASS_NM=${klass}&`
  + `TI_FROM_YMD=${getYYYYMMDD(date)}&`
  + `TI_TO_YMD=${getYYYYMMDD(date)}`
);

export const fetchWeeklyTimetable = async () => {
  const today = new Date(TEMP_DATE);
  const weekStart = getWeekStart(today);
  const weekEnd = getWeekEnd(today);

  const timetable = [];
  for (let date = weekStart; date < weekEnd; date = getTomorrow(date)) {
    for (let grade = 1; grade <= 3; grade += 1) {
      for (let klass = 1; klass <= 6; klass += 1) {
        const endpoint = getAPIEndpoint(grade, klass, date);

        // eslint-disable-next-line
        const { data } = await axios.get(endpoint);
        if ('hisTimetable' in data) {
          const { hisTimetable } = data;
          const { row: result } = hisTimetable[1];

          const dailyTimetable = {
            date,
            grade,
            class: klass,
            sequence: result
              .sort((a: any, b: any) => a.PERIO - b.PERIO)
              .map(
                (r: any) => (r.ITRT_CNTNT in aliases
                  ? aliases[r.ITRT_CNTNT] : r.ITRT_CNTNT),
              ),
          };

          timetable.push(dailyTimetable);
        }
      }
    }
  }
  return timetable;
};

export const refreshWeeklyTimetable = async () => {
  const weeklyTimetable = await fetchWeeklyTimetable();

  const today = new Date(TEMP_DATE);
  const weekStart = getWeekStart(today);
  const weekEnd = getWeekEnd(today);

  await Timetable.model.deleteMany({
    date: {
      $gte: weekStart,
      $lte: weekEnd,
    },
  });

  await Timetable.model.insertMany(weeklyTimetable);
};
