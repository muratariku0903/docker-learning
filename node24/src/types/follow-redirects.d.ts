declare module 'follow-redirects' {
  import * as http from 'http';
  import * as https from 'https';

  interface FollowRedirectsResponse extends http.IncomingMessage {
    responseUrl: string;
  }

  interface FollowRedirectsModule {
    get(
      url: string | URL,
      callback: (res: FollowRedirectsResponse) => void
    ): http.ClientRequest;
    get(
      options: http.RequestOptions,
      callback: (res: FollowRedirectsResponse) => void
    ): http.ClientRequest;
    request(
      url: string | URL,
      callback: (res: FollowRedirectsResponse) => void
    ): http.ClientRequest;
    request(
      options: http.RequestOptions,
      callback: (res: FollowRedirectsResponse) => void
    ): http.ClientRequest;
  }

  export const http: FollowRedirectsModule;
  export const https: FollowRedirectsModule;
}

declare module 'follow-redirects/package.json' {
  const content: {
    version: string;
    name: string;
  };
  export = content;
}

declare module 'axios/package.json' {
  const content: {
    version: string;
    name: string;
  };
  export = content;
}
