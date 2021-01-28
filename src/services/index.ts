import fs from 'fs';
import Joi from 'joi';
import {
  Router, RequestHandler, Request, Response, NextFunction,
} from 'express';

import { HTTPMethod, UserType } from '../types';
import { checkUserType, validator } from '../middlewares';

interface KeyValue<T> {
  [key: string]: T;
}

export interface Route {
  method: HTTPMethod;
  path: string;
  middlewares?: RequestHandler[];
  handler: RequestHandler;
  validateSchema?: any;
  allowedUserTypes?: (UserType | '*')[];
}

export interface Service {
  name: string;
  baseURL: string;
  routes: Route[];
}

const wrapper = (asyncFn: any) =>
  (async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await asyncFn(req, res, next);
    } catch (error) {
      return next(error);
    }
  }
  );

const createRouter = (routes: Route[]) => {
  const router = Router();

  routes.forEach((route) => {
    router[route.method](
      route.path,
      ...(route.allowedUserTypes
        ? [checkUserType(...route.allowedUserTypes)] : []),
      ...(route.middlewares
        ? route.middlewares : []),
      ...(route.validateSchema
        ? [validator(Joi.object(route.validateSchema))] : []),
      wrapper(route.handler),
    );
  });

  return router;
};

const createDocsRouter = (services: Service[]) => {
  const router = Router();

  const schemaMapper = (validateSchema: KeyValue<Joi.AnySchema>) => {
    const keys = Object.keys(validateSchema);
    const result: KeyValue<String> = {};
    keys.forEach((key) => {
      result[key] = validateSchema[key].type;
    });
    return result;
  };

  const routeMapper = (service: Service) => (
    service.routes.map((r) => ({
      ...r,
      path: (service.baseURL + r.path).replace(/\/$/, ''),
      validateSchema: (r.validateSchema
        ? schemaMapper(r.validateSchema) : {}),
    }))
  );

  const mappedServices = services.map((s: Service) =>
    ({ ...s, routes: routeMapper(s) }));

  router.get('/', (req, res) => {
    res.json({ services: mappedServices });
  });

  return router;
};

export const services = fs.readdirSync(__dirname)
  .filter((s) => !s.startsWith('index'))
  // eslint-disable-next-line
  .map((s) => require(`${__dirname}/${s}`).default);

export const routes = services.map((s) => s.routes.map((r: Route): Route => ({
  ...r,
  path: s.baseURL + r.path,
}))).reduce((a, s) => [...a, ...s]);

export const serviceRouter = createRouter(routes);
export const serviceDocsRouter = createDocsRouter(services);
