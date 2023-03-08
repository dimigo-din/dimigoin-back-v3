import axios from 'axios';
import cheerio from 'cheerio';
import { MealModel } from '../models';
import { mealsIF } from '../interfaces';
import { getWeekCalcul } from './date';

const mealApi = 'https://www.dimigo.hs.kr/index.php?mid=school_cafeteria';

const getTargetDay = (add: number) => {
  const targetDate = getWeekCalcul(add);
  const targetDay = targetDate.format('M-D').split('-');

  return {
    month: targetDay[0],
    day: targetDay[1],
    date: targetDate.format('YYYY-MM-DD'),
  };
};

const getMealPostNum = async (month: string, day: string) => {
  const { data } = await axios.get(mealApi, {
    params: {
      page: 1,
    },
  });

  const idx = data.indexOf(`${month}월${day}일 식단입니다`);
  const postUrl = data.substring(data.indexOf('https', idx - 125), idx - 2);

  return postUrl.split('document_srl=')[1];
};

export const updateMeal = async () => {
  const meals: mealsIF = {};

  for (let i = 0; i < 7; i += 1) {
    const { month, day, date } = getTargetDay(i);

    const mealCheck = await MealModel.findOne({
      date,
    });
    // eslint-disable-next-line no-continue
    if (mealCheck) continue;

    try {
      const { data } = await axios.get(mealApi, {
        params: {
          document_srl: await getMealPostNum(month, day),
        },
      });

      const $ = cheerio.load(data);

      const context = $('#siDoc')
        .children('ul:nth-child(5)')
        .children('li')
        .children('div.scConDoc.clearBar')
        .children('div')
        .text();

      meals[date] = {
        breakfast: [],
        lunch: [],
        dinner: [],
      };
      meals[date].breakfast.push(
        ...context.substring(context.indexOf('조식: ') + 5, context.indexOf('*중식')).split('\n').filter((v) => v.trim())[0].split('/').filter((m: string) => m),
      );
      meals[date].lunch.push(
        ...context.substring(context.indexOf('중식: ') + 5, context.indexOf('*석식')).split('\n').filter((v) => v.trim())[0].split('/').filter((m: string) => m),
      );
      meals[date].dinner.push(
        ...context.substring(context.indexOf('석식: ') + 5).split('\n').filter((v) => v.trim())[0].split('/').filter((m: string) => m),
      );
    } catch (err) {
      if (!meals[date]) { meals[date] = {
        breakfast: [],
        lunch: [],
        dinner: [],
      }; }
      if (!meals[date].breakfast) meals[date].breakfast.push('급식 정보가 없습니다.');
      if (!meals[date].lunch) meals[date].lunch.push('급식 정보가 없습니다.');
      if (!meals[date].dinner) meals[date].dinner.push('급식 정보가 없습니다.');
    }
  }

  Object.keys(meals).forEach(async (date) => {
    await MealModel.deleteOne({ date });
    new MealModel({
      date,
      breakfast: meals[date].breakfast,
      lunch: meals[date].lunch,
      dinner: meals[date].dinner,
    }).save();
  });
};
