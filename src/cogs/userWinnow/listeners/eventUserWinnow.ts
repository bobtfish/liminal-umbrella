import { Listener, container } from '@sapphire/framework';
import { UserWinnow } from '../../../lib/events/index.js';
import { CUSTOM_EVENTS } from '../../../lib/events.js';
import { getMessage } from '../../../lib/message.js';
import { GuildMember } from 'discord.js';
import { Sequential } from '../../../lib/utils.js';

export class userWinnowUserWinnowListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            name: 'userWinnowUserWinnow',
            emitter: container.events,
            event: CUSTOM_EVENTS.UserWinnow
        });
    }

    @Sequential
    async run(e: UserWinnow) {
        if (e.dbUser.bot) return;
        let guildMember: GuildMember | undefined;
        try {
            guildMember = await container.guild!.members.fetch(e.id);
        } catch { /* empty */ } // FIXME - catch only the fetch error.
        if (!guildMember) return;
        const userRoleNames = (await e.dbUser.getRoles()).map(role => role.name);
        if (userRoleNames.some(name => name === 'Admin' || name === 'Patron')) return;
        const knownMember = userRoleNames.some(name => name === 'Known Member');
        const msgId = knownMember ? 'KNOWN_MEMBER_WINNOW_KICK' : 'MEMBER_WINNOW_KICK';
        const msg = await getMessage(msgId, {});
        await (
            await this.container.database.getdb()
        ).transaction(async () => {
            e.dbUser.set({ kicked: true, winnowed: true });
            await guildMember.send(msg);
            await guildMember.kick(
                `RPGBot Kicked user ${e.dbUser.nickname} (${e.dbUser.name} : ${e.dbUser.key} due to Winnow event`
            );
            await e.dbUser.save();
        });
    }
}
