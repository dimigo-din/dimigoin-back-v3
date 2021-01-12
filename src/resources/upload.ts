import aws from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

export default class Upload {
  private client: aws.S3;

  constructor() {
    aws.config.update({
      accessKeyId: process.env.AWS_KEY_ID,
      secretAccessKey: process.env.AWS_ACCESS_KEY,
    });
    this.client = new aws.S3();
  }

  public async upload(key: string, body: string) {
    await this.client.putObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: body,
    }, (error, data) => {
      if (error) throw error;
      return data;
    });
  }
}
