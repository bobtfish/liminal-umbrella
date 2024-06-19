import { methods, Route, type ApiRequest, type ApiResponse, HttpCodes } from '@sapphire/plugin-api';
import { ActivityCacheClear } from '../lib/events/index.js';
import { Activity } from '../lib/database/model.js';
import { ActivitySchema } from "common/schema";
import { AuthenticatedAdmin } from '../lib/api/decorators.js';
import { Sequential } from '../lib/utils.js';

export class ApiBotplayingEdit extends Route {
    public constructor(context: Route.LoaderContext, options: Route.Options) {
      super(context, {
        ...options,
        route: 'api/botplaying/:key'
      });
    }

    private async findActivity(params: ApiRequest['params'], response: ApiResponse): Promise<Activity | null> {
      const { success, error, data } = ActivitySchema.delete.safeParse(params);
      if (!success) {
          response.status(HttpCodes.BadRequest).json({status: "error", error: error.issues });
          return null;
      }
      const activity = await Activity.findOne({where: data});
      if (!activity) {
          response.status(HttpCodes.NotFound).json({status: "error", error: "Activity not found"});
          return null;
      }
      return activity;
    }

    @AuthenticatedAdmin()
    @Sequential
    public async [methods.POST](request: ApiRequest, response: ApiResponse) {
      const activity = await this.findActivity(request.params, response);
      if (!activity) {
          return;
      }
      const { success, error, data } = ActivitySchema.update.safeParse(request.body);
        if (!success) {
            response.status(HttpCodes.BadRequest).json({status: "error", error: error.issues });
            return;
        }
        // TODO - No XSS
        activity.set(data);
        await activity.save();
        this.container.events.emit('activityCacheClear', new ActivityCacheClear());
        response.json({status: "ok", activity: data});
    }

    @AuthenticatedAdmin()
    @Sequential
    public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
      const activity = await this.findActivity(request.params, response);
      if (!activity) {
          return;
      }
        await activity.destroy();
        this.container.events.emit('activityCacheClear', new ActivityCacheClear());
        response.json({status: "deleted", activity: request.params});
    }
}