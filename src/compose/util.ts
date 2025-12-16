export class UploadCancelledError extends Error {
  constructor(message: string = 'User cancelled dialog') {
    super(message);
    this.name = 'UploadCancelledError';
  }
}