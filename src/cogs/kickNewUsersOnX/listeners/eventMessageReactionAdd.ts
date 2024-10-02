import { Listener, Events } from '@sapphire/framework';
import { ChannelType, MessageReaction } from 'discord.js';
import { GreetingMessage } from '../../../lib/database/model.js';
import { getMessage } from '../../../lib/message.js';
import { getGuildMemberById } from '../../../lib/discord.js';
import { Sequential } from '../../../lib/utils.js';
import { User } from '../../../lib/database/model.js';

interface PartialFetchable {
    partial: boolean;
    fetch(): Promise<this>;
}

export class verboseLogBotStartedListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            name: 'kickNewUsersOnX',
            event: Events.MessageReactionAdd
        });
    }

    async fetchPartial(ob: PartialFetchable) {
        if (ob.partial) {
            try {
                await ob.fetch();
            } catch (error) {
                this.container.logger.error('Could not fetch partial object: ', error);
                return;
            }
        }
    }

    @Sequential
    async run(r: MessageReaction) {
        const greetingChannelName = process.env.GREET_USERS_CHANNEL;
        if (!greetingChannelName) return;

        await this.fetchPartial(r);
        await this.fetchPartial(r.message);
        await this.fetchPartial(r.message.channel);

        if (r.message.channel.type !== ChannelType.GuildText) return;
        if (r.message.channel.name !== greetingChannelName) return;

        const getRoles = async (key: string) => {
            const u = await User.findOne({
                where: { key },
                attributes: ['key', 'bot'],
                include: ['roles']
            });
            if (!u || u.left || u.bot) return false;
            return u.roles || [];
        };

        console.log('Emoji name ', r.emoji.name);

        let kickUser = false;
        for (const userId of (await r.users.fetch()).keys()) {
            const roles = await getRoles(userId);
            if (!roles) continue; // Skip reactions from bots
            // Remove any non-Admin reacts
            if (!roles.some((r) => r.name === 'Admin')) await r.users.remove(userId);
            // An admin X'd - so we want to kick this user
            if (r.emoji.name === '❌') kickUser = true;
        }
        console.log('kickuser ', kickUser);
        if (!kickUser) return;

        // Find the message in the DB that was reacted to, and from that find the user who's greeting message it was
        const messageId = r.message.id;
        const greeting = await GreetingMessage.findOne({ include: ['user'], where: { messageId } });

        console.log('greeting ', greeting);
        if (!greeting) return;
        const dbUser = greeting.user;
        const msg = await getMessage('USER_NO_NAME_CHANGE_KICK', {});
        const guildMember = await getGuildMemberById(dbUser.key);
        console.log('guildMember ', guildMember);
        if (!guildMember) return;

        await (
            await this.container.database.getdb()
        ).transaction(async () => {
            dbUser.set({ kicked: true });
            await guildMember.kick(msg);
            await dbUser.save();
        });
    }
}
