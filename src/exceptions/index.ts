export class HttpException extends Error {
  public status: number;
  public message: string;

  constructor(
    status: number = 500,
    message: string = '알 수 없는 서버 오류가 발생했습니다.',
  ) {
    super(message);
    this.status = status;
    this.message = message;
  }
}
