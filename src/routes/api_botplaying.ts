import { methods, Route, type ApiRequest, type ApiResponse, HttpCodes } from '@sapphire/plugin-api';
import { ActivityCacheClear } from '../lib/events/index.js';
import { Activity } from '../lib/database/model.js';
import { createSchema } from '../lib/database/model/Activity.js';
import { Authenticated } from '../lib/api/decorators.js';

//TODO - Add decorators to require authentication
export class ApiBotplayingList extends Route {
    public constructor(context: Route.LoaderContext, options: Route.Options) {
      super(context, {
        ...options,
        route: 'api/botplaying'
      });
    }

    // Get current list
    @Authenticated()
    public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
        const activities = await Activity.findAll({ where: { type: 'playing'}});
        const playing = activities.map(activity => {return {key: activity.key, type: activity.type, name: activity.name}});
        response.json({playing})
    }

    // Add a new one
    @Authenticated()
    public async [methods.POST](request: ApiRequest, response: ApiResponse) {
        const { success, error, data } = createSchema.safeParse(request.body);
        if (!success) {
            response.status(HttpCodes.BadRequest).json({status: "error", error: error.issues });
            return;
        }
        const activity = await Activity.create(data);
        this.container.events.emit('activityCacheClear', new ActivityCacheClear());
        response.status(HttpCodes.Created).json({status: "ok", activity: {"key": activity.key, type: activity.type, name: activity.name}});
    }
}
