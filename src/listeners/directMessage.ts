import { Listener, container } from '@sapphire/framework';
import { DirectMessage } from '../lib/events/index.js';
import { CUSTOM_EVENTS } from '../lib/events.js';
import { getMessage } from '../lib/message.js';

const ignoreForTime = 5 * 60; // 5 mins

export class directMessageListener extends Listener {
    userCache: Map<string, number>
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            name: 'directMessage',
            emitter: container.events,
            event: CUSTOM_EVENTS.DirectMessage
        });
        this.userCache = new Map();
    }
    async run(e: DirectMessage) {
        if (this.userCache.has(e.discordMessage.author.id)) {
            const lastTime = this.userCache.get(e.discordMessage.author.id);
            if (lastTime) {
                const diff = Date.now() - lastTime;
                if (diff < ignoreForTime * 1000) {
                    return;
                }
            }
        }
        this.userCache.set(e.discordMessage.author.id, Date.now());
        await this.doMsg(e);
        return;
    }
    async doMsg(e: DirectMessage) {
        const reply = await getMessage('DM_REPLY_MEMBER', {});
        await e.discordMessage.reply(reply);
        return

    }
}
