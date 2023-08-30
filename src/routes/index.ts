import { Router } from 'express';
import { readdirSync } from 'fs';

const PATH_ROUTER = `${__dirname}`;

const router = Router();

/**
 * Clean the file name to be used as a route.
 *
 * @param fileName The file name to be cleaned.
 */
const cleanFileName = (fileName: string): string => {
  const file = fileName.split('.').shift();
  return file || '';
};

readdirSync(PATH_ROUTER).map((fileName) => {
  const cleanName = cleanFileName(fileName);
  if (cleanName !== 'index') {
    import(`./${cleanName}.routes`).then((moduleRouter) => {
      router.use(`/api/${cleanName}`, moduleRouter.router);
    })
  }
});

export { router };
