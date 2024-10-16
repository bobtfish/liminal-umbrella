import { Listener, container } from '@sapphire/framework';
import { BotStarted } from '../../../lib/events/index.js';
import { setRandomActivity } from '../activity.js';
import { CUSTOM_EVENTS } from '../../../lib/events.js';

export class randomActivityBotStartedListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            name: 'randomActivityBotStarted',
            emitter: container.events,
            event: CUSTOM_EVENTS.BotStarted
        });
    }

    run(_: BotStarted) {
        const logger = this.container.logger;
        // Set when we restart the bot + 1 second. (This just means that usually/mostly we'll get the 'RPGBot restarted' notice first... Done like this as it's simple and not critical the order.)
        setTimeout(() => { setRandomActivity().catch((e: unknown) => { logger.error('Error in setRandomActivity(): ', e)}); }, 1000);
    }
}
