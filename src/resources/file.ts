import fs from 'fs';
import { join as pathJoin } from 'path';
import config from '../config';
import { FileModel } from '../models';
import { IUser } from '../interfaces';

export const writeFile = async (buffer: Buffer, name: string, extension: string, user: IUser, downloadLimit: number = 0) => {
  const file = await new FileModel({
    name, extension, downloadLimit, owner: user._id,
  }).save();
  const path = pathJoin(config.fileStoragePath, file._id.toString());
  fs.writeFileSync(path, buffer);
  return file;
};
