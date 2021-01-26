import { Router, RequestHandler } from 'express';
import { HTTPMethod, UserType } from '../types';
import { checkUserType } from '../middlewares';
import wrapper from '../resources/wrapper';
import fs from 'fs';

interface Route {
  method: HTTPMethod;
  path: string;
  middlewares?: RequestHandler[];
  handler: RequestHandler;
  allowedUserType?: (UserType | '*')[];
};

const createRouter = (routes: Route[]) => {
  const router = Router();

  routes.forEach((route) => {
    router[route.method](
      route.path,
      ...(route.allowedUserType ?
        [checkUserType(...route.allowedUserType)] : []),
      ...(route.middlewares ?
        route.middlewares : []),
      wrapper(route.handler),
    );
  });

  return router;
};

const services = fs.readdirSync(__dirname)
  .filter((s) => !s.startsWith('index'))
  .map((s) => require(__dirname + '/' + s + '/routes').default);

const routes = services.map((s) => {
  return s.routes.map((r: Route): Route => ({
    ...r,
    path: s.baseURL + r.path,
  }),
)}).reduce((a, s) => [...a, ...s]);

export const serviceRouter = createRouter(routes);
