import Joi from 'joi';
import { Controller } from '../classes';
import { validator, checkUserType } from '../middlewares';
import {
  getAllMeals,
  createMeal,
  getMealByDate,
} from '../controllers/meal';

class MealController extends Controller {
  public basePath = '/meal';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('*'), getAllMeals);

    this.router.get('/:date', checkUserType('*'), getMealByDate);

    this.router.post('/', checkUserType('T'), validator(Joi.object({
      date: Joi.date().required(),
      breakfast: Joi.array().items(Joi.string()).required(),
      lunch: Joi.array().items(Joi.string()).required(),
      dinner: Joi.array().items(Joi.string()).required(),
    })), createMeal);
  }
}

export default MealController;
