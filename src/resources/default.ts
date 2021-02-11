import {
  PlaceType, ConfigKeys, CirclePeriod, Grade, Class,
} from '../types';

export const defaultPlaces = (() => {
  // 기본 장소들
  const places = [
    { name: '비즈쿨실', location: '본관 1층', type: PlaceType.ingang },
    { name: '안정실', location: '본관 1층' },
    { name: '큐브', location: '본관 2층' },
    { name: '시청각실', location: '신관 1층' },
    { name: '세미나실', location: '신관 1층' },
    { name: '학봉관', location: '학봉관' },
    { name: '우정학사', location: '우정학사' },
    { name: '영어 전용 교실', location: '신관 1층', type: PlaceType.ingang },
    { name: '열람실', location: '신관 3층' },
    { name: '외출', location: '교외 외출' },
    { name: '기타', location: '기타' },
  ];

  const getClassLocation = (grade: Grade, klass: Class) => {
    if (grade === 3) return '신관 2층';
    if (grade === 2) return '본관 2층';
    if (klass <= 4) return '본관 1층';
    return '본관 2층';
  };

  // 교실 추가
  for (let grade = 1; grade <= 3; grade += 1) {
    for (let klass = 1; klass <= 6; klass += 1) {
      places.push({
        name: `${grade}학년 ${klass}반`,
        location: getClassLocation(
          grade as Grade,
          klass as Class,
        ),
        type: PlaceType.classroom,
      });
    }
  }

  // 동아리실 추가
  for (let index = 1; index <= 6; index += 1) {
    places.push({
      name: `동아리 ${index}실`,
      location: '본관 3층',
      type: PlaceType.circle,
    });
  }

  return places;
})();

export const defaultConfigs = {
  [ConfigKeys.circlePeriod]: CirclePeriod.application,
  [ConfigKeys.circleMaxApply]: 3,
  [ConfigKeys.circleCategory]: ['IT(프로젝트)', '음악', '경영'],
  [ConfigKeys.imageExtension]: ['png', 'jpg', 'jpeg', 'heif'],
  [ConfigKeys.weeklyIngangTicketCount]: 6,
  [ConfigKeys.ingangMaxAppliers]: [0, 8, 6, 0],
  [ConfigKeys.ingangApplyPeriod]: {
    start: { hour: 7, minute: 0 },
    end: { hour: 8, minute: 15 },
  },
};
