import { Request, Response } from 'express';
import { join as pathJoin } from 'path';
import iconv from 'iconv-lite';
import mime from 'mime';
import fs from 'fs';
import config from '../../config';
import { FileModel } from '../../models';
import { HttpException } from '../../exceptions';

const convertFileName = (fileName: string, req: Request) => {
  const userAgent = req.headers['user-agent'];

  if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
    return encodeURIComponent(fileName).replace(/\\+/gi, '%20');
  }
  return iconv.decode(iconv.encode(fileName, 'UTF-8'), 'ISO-8859-1');
};

// downloadFile 핸들러와 구분하기 위해서 네이밍을 다른 서비스와 조금 다르게 함
export const getMyFileList = async (req: Request, res: Response) => {
  const files = await FileModel.find({ owner: req.user._id });
  res.json({ files });
};

export const downloadFile = async (req: Request, res: Response) => {
  const { fileId } = req.params;
  const file = await FileModel.findById(fileId);

  if (!file) throw new HttpException(404, '요청하신 파일을 찾을 수 없습니다.');
  if (file.downloadLimit && file.downloadLimit <= file.downloadCount) {
    throw new HttpException(403, '다운로드 횟수를 초과한 파일입니다.');
  }

  const filePath = pathJoin(config.fileStoragePath, fileId);
  const rawFileName = `${file.name}.${file.extension}`;
  const fileName = convertFileName(rawFileName, req);
  if (!fs.existsSync(filePath)) {
    throw new HttpException(500, '요청하신 파일을 찾을 수 없습니다.');
  }

  file.downloadCount += 1;
  await file.save();

  const stream = fs.createReadStream(filePath);
  res.setHeader('Content-disposition', `attachment; fileName=${fileName}`);
  res.setHeader('Content-Type', mime.getType(rawFileName));
  stream.pipe(res);
};

export const uploadFile = async (req: Request, res: Response) => {

};
