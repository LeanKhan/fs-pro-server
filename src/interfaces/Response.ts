export interface IResponse {
  error: boolean;
  message: string;
  statusCode: number;
  results?: any;
}

export interface IUserLogin {
  Username: string;
  Password: string;
  Email?: string;
}
