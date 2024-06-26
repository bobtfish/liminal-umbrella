import { Listener, container } from '@sapphire/framework';
import { UserLeft } from '../../../lib/events/index.js';
import { getChannelAndEmbed } from '../utils.js';
import { userMention, EmbedBuilder } from 'discord.js';

export class logBotActionUserLeftListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'logBotActionUserLeft',
      emitter: container.events,
      event: 'userLeft'
    });
  }
  async run (e: UserLeft) {
    // Log user left (with nickname in bot_log)
    const exampleEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setAuthor({ name: 'Member Left', iconURL: e.avatarURL})
      .setDescription(userMention(e.id))
      .setThumbnail(e.avatarURL)
      .addFields(
        { name: 'Account name', value: e.username, inline: true },
        { name: 'Nickname', value: e.nickname, inline: true },
      )
      .setTimestamp()
      .setFooter({ text: `ID: ${e.id}` });

    await getChannelAndEmbed(exampleEmbed);
  }
}
