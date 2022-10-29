import fs from 'fs';
import Joi from 'joi';
import {
  Router, RequestHandler, Request, Response, NextFunction,
} from 'express';
import { join as pathJoin } from 'path';
import { HTTPMethod } from '../types';
import { validator } from '../middlewares';
import checkPermission from '../middlewares/check-permission';

interface KeyValue<T> {
  [key: string]: T;
}

export interface Route {
  method: HTTPMethod;
  path: string;
  middlewares?: RequestHandler[];
  handler: RequestHandler;
  validateSchema?: KeyValue<Joi.Schema>;
  needAuth: boolean; // 인증이 필요한지
  needPermission: boolean; // 관리자 권한이 필요한지
  studentOnly?: boolean; // 학생만 접근할 수 있는 라우트인지 (신청 관련)
  teacherOnly?: boolean; // 선생님만 접근할 수 있는 라우트 (신청 허가)
  departmentTOnly?: boolean; // 학과 선생님만 접근할 수 있는 라우트
  dormitoryTOnly?: boolean; // 사감 선생님만 접근할 수 있는 라우트
}

// 임포트 된 서비스 (서비스 디렉토리 명 추가)
export interface Service {
  code?: string;
  name: string;
  baseURL: string;
  routes: Route[];
}

// 각 서비스 정의 시 사용되는 인터페이스
interface ServiceSchema {
  name: string;
  baseURL: string;
  routes: Route[];
}

const wrapper = (asyncFn: any) =>
  (
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        return await asyncFn(req, res, next);
      } catch (error) {
        return next(error);
      }
    }
  );

export const createService = (serviceSchema: ServiceSchema) => serviceSchema;

const createRouter = (services: Service[]) => {
  const router = Router();

  services.forEach((service) => {
    service.routes.forEach((route) => {
      router[route.method](
        pathJoin(service.baseURL, route.path),
        ...(route.middlewares
          ? route.middlewares.map(wrapper) : []),
        wrapper(checkPermission(service.code, route)),
        ...(route.validateSchema
          ? [validator(Joi.object(route.validateSchema))] : []),
        wrapper(route.handler),
      );
    });
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

const createSwaggerDocs = (services: Service[]) => {
  const schemaMapper = (validateSchema: KeyValue<Joi.AnySchema>) => {
    const keys = Object.keys(validateSchema);
    const result: KeyValue<String> = {};
    keys.forEach((key) => {
      result[key] = validateSchema[key].type;
    });
    return result;
  };

  const createSwagger = (route: Route, service: Service): object => {
    const routeDocs: KeyValue<Object> = {};
    routeDocs[route.method] = {
      tags: [service.baseURL.replace('/', '')],
      responses: {
        200: {
          description: 'OK',
          schema: route.validateSchema ? schemaMapper(route.validateSchema) : {},
        },
      },
    };
    return routeDocs;
  };

  const path: KeyValue<Object> = {};
  const tag: Array<object> = [];

  services.forEach((service) => {
    tag.push({ name: service.baseURL.replace('/', ''), description: service.name });
    service.routes.forEach((route) => {
      path[(service.baseURL + route.path).replace(/\/$/, '')] = createSwagger(route, service);
    });
  });

  return {
    paths: path,
    tags: tag,
  };
};

export const services = fs.readdirSync(__dirname)
  .filter((s) => !s.startsWith('index'));

export const importedServices = services.map((s) => ({
  code: s,
  // eslint-disable-next-line
  ...(require(`${__dirname}/${s}`).default),
}));

export const serviceRouter = createRouter(importedServices);
export const serviceDocsRouter = createDocsRouter(importedServices);
export const swaggerOptions = createSwaggerDocs(importedServices);
