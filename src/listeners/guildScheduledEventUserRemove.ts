import { Listener } from '@sapphire/framework';
import { GuildScheduledEvent, User } from 'discord.js';
import { Sequential } from '../lib/utils.js';

export class GuildScheduledEventUserRemoveEvent extends Listener {
	@Sequential
	public override async run(guildScheduledEvent: GuildScheduledEvent, user: User) {
		await this.container.database.removeUserInterestedInGame(user, guildScheduledEvent);
	}
}
