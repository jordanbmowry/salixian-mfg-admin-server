export class AppError extends Error {
  public readonly status: number;
  public readonly details?: any;

  constructor(status: number, message: string, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
