import { Listener, Events } from '@sapphire/framework';
import { Message } from 'discord.js';
import { Sequential } from '../lib/utils.js';

export class MessageDeleteEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: Events.MessageDelete
        });
    }

    @Sequential
    public override async run(message: Message) {
        if (!message.guildId) {
            return;
        }
        await this.container.database.deleteMessage(message);
        return;
    }
}
