import { Listener } from '@sapphire/framework';
import { GuildMember } from 'discord.js';

export class GuildMemberUpdateEvent extends Listener {
	public override run(_ : GuildMember, newGuildMember : GuildMember) {
        console.log("RUNNING GUILD MEMBER UPDATE");
		return this.container.database.guildMemberUpdate(newGuildMember);
	}
}