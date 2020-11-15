import Joi from 'joi';
import { Controller } from '../classes';
import { validator, checkUserType } from '../middlewares';
import {
  createPlace,
  getAllPlaces,
  getPlace,
  editPlace,
  deletePlace,
} from '../controllers/place';

class PlaceController extends Controller {
  public basePath = '/place';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const payloadValidator = validator(Joi.object({
      name: Joi.string().required(),
      location: Joi.string().required(),
      description: Joi.string(),
    }));

    this.router.get('/', checkUserType('*'), getAllPlaces);
    this.router.patch('/:placeId', checkUserType('T'), payloadValidator, editPlace);
    this.router.post('/', checkUserType('T'), payloadValidator, createPlace);
    this.router.get('/:placeId', checkUserType('*'), getPlace);
    this.router.delete('/:placeId', checkUserType('T'), deletePlace);
  }
}

export default PlaceController;
