/* eslint-disable no-restricted-syntax */
import Router from 'koa-router';

const FOLDERS = await Promise.all([import('./users/index.js')]);

const ROUTER = new Router();

export default async () => {
  for await (const routeFolder of FOLDERS) {
    if (routeFolder?.default) {
      for await (const version of routeFolder.default) {
        ROUTER.use(version?.default?.routes());
      }
    }
  }
  return ROUTER.routes();
};
