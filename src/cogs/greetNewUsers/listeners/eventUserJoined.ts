import { Listener, container } from '@sapphire/framework';
import { UserJoined } from '../../../lib/events/index.js';
import { getChannelAndSend } from '../utils.js';
import { Sequential } from '../../../lib/utils.js';

export class GreetNewUsersUserJoinedListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    container.logger.info("greetNewUsers cog - construct UserJoinedListener");
    super(context, {
      ...options,
      name: 'greetNewUsersUserJoined',
      emitter: container.events,
      event: 'userJoined'
    });
  }

  @Sequential
  async run (e: UserJoined) {
    container.logger.info("greetNewUsers cog - userJoined arg ", e);
    const id = await getChannelAndSend(this.container, `<@${e.id}> Welcome to Preston DnD 5e community.  If you have read the rules and altered your name as asked then an Admin will be along shortly to give access to the rest of the server.`);
    if (id) {
      this.container.database.greetingMessageAdd(id, e.id);
    }
  }
}