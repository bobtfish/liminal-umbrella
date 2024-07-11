import { Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { GameSystem, PlannedGame } from '../lib/database/model.js';
import type { SchemaBundle } from 'common/schema';
import { CR } from '../lib/api/CRUD.js';
import { GameSchema } from 'common/schema';
import { AuthenticatedWithRole } from '../lib/api/decorators.js';

export class ApiGameList extends CR {
	public constructor(context: Route.LoaderContext, options: Route.Options) {
		super(context, {
			...options,
			route: 'api/game'
		});
	}

	getModel() {
		return PlannedGame;
	}
	getSchema(): SchemaBundle {
		return GameSchema;
	}

	@AuthenticatedWithRole('Dungeon Master', true)
	override async auth_CREATE() {}

	override async CREATE_coerce(request: ApiRequest, response: ApiResponse, data: any): Promise<any> {
		const gamesystem = await GameSystem.findOne({ where: { name: data.gamesystem } });
		if (!gamesystem) {
			return response.badRequest('Cannot find game system');
		}
		return {
			...data,
			owner: request.auth!.id,
			gamesystem: gamesystem.key
		};
	}
}
