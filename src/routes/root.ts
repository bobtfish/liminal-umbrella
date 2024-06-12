import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import fs from 'fs';

export class RootRoute extends Route {
  public constructor(context: Route.LoaderContext, options: Route.Options) {
    super(context, {
      ...options,
      route: ''
    });
  }

  public [methods.GET](_request: ApiRequest, response: ApiResponse) {
    fs.readFile('frontend/dist/index.html', function(error, content) {
      if (error) {
        response.writeHead(500);
        response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
      }
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end(content, 'utf-8');
    })
  }
}
