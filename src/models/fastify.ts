export interface IQuerystring {
    username: string;
    password: string;
  }
  
export interface IHeaders {
    'h-Custom': string;
  }
export interface IReply {
    200: { success: boolean };
    302: { url: string };
    '4xx': { error: string };
  }