export class CustomError extends Error {
  constructor(
    message: string,
    public code: number,
    public additionalInfo?: string,
  ) {
    super(message);
  }
}
