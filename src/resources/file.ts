import fs from 'fs';
import config from '../config';
import { join as pathJoin } from 'path';
import { FileModel } from '../models';
import { IUser } from '../interfaces';

export const writeFile = async (buffer: Buffer, name: string, extension: string, user: IUser) => {
    const file = await new FileModel({ name, extension, owner: user._id }).save();
    const path = pathJoin(config.fileStoragePath, file._id.toString());
    fs.writeFileSync(path, buffer);
    return file;
};
