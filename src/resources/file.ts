import fs from 'fs';
import exceljs from 'exceljs';
import { join as pathJoin } from 'path';
import config from '../config';
import { FileModel } from '../models';
import { User } from '../interfaces';

export const writeFile = async (buffer: Buffer | exceljs.Buffer, name: string, extension: string, user: User, downloadLimit: number | string = 0) => {
  const file = await new FileModel({
    name,
    extension,
    owner: user._id,
    downloadLimit: typeof downloadLimit === 'number'
      ? downloadLimit : parseInt(downloadLimit),
  }).save();
  const path = pathJoin(config.fileStoragePath, file._id.toString());
  // @ts-ignore (Buffer Type 관련)
  fs.writeFileSync(path, buffer);
  return file;
};
