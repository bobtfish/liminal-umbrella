import { Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { PlannedGame } from '../lib/database/model.js';
import type { SchemaBundle } from 'common/schema';
import { UD } from '../lib/api/CRUD.js';
import { NewGameSchema } from 'common/schema';
import { DM } from '../lib/api/decorators.js';
import { isAdmin } from '../lib/api/auth.js';
import { doCoerce } from './api_game.js';

export class ApiGameEdit extends UD {
    public constructor(context: Route.LoaderContext, options: Route.Options) {
        super(context, {
            ...options,
            route: 'api/game/:key'
        });
    }

    getModel() {
        return PlannedGame;
    }
    getSchema(): SchemaBundle {
        return NewGameSchema;
    }

    @DM
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    override async auth_UPDATE() {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    override async UPDATE_coerce(request: ApiRequest, response: ApiResponse, data: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return doCoerce(request, response, data);
    }

    @DM
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    override async auth_DELETE() {}

    override async getRetrieveWhere(request: ApiRequest) {
        if (isAdmin(request)) {
            return Promise.resolve({});
        }
        return Promise.resolve({ owner: request.auth!.id });
    }
}
