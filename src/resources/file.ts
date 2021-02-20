import fs from 'fs';
import exceljs from 'exceljs';
import { join as pathJoin } from 'path';
import config from '../config';
import { FileModel } from '../models';
import { IUser } from '../interfaces';

export const writeFile = async (buffer: Buffer | exceljs.Buffer, name: string, extension: string, user: IUser, downloadLimit: number = 0) => {
  const file = await new FileModel({
    name, extension, downloadLimit, owner: user._id,
  }).save();
  const path = pathJoin(config.fileStoragePath, file._id.toString());
  // @ts-ignore (Buffer Type 관련)
  fs.writeFileSync(path, buffer);
  return file;
};
