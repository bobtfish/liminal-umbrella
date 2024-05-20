import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { StringSelectMenuInteraction } from 'discord.js';
import { PlannedGame } from '../lib/database/model.js';

export class SelectsPostGamenHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.MessageComponent
    });
  }

  public override parse(interaction: StringSelectMenuInteraction) {
    for (const field_name of ['post-game-system', 'post-game-month', 'post-game-day']) {
      if (interaction.customId == field_name) {
        return this.some();
      }
    }
    return this.none();
  }

  public async run(interaction: StringSelectMenuInteraction) {
    const gamerow = await PlannedGame.findGameFromInteraction(interaction);
    if (interaction.customId == 'post-game-system') {
      gamerow?.set({'system': interaction.values[0]});
    }
    if (interaction.customId == 'post-game-month') {
      gamerow?.set({'datetime': interaction.values[0]});
    }
    if (interaction.customId == 'post-game-day') {
      gamerow?.set({'datetime': interaction.values[0]});
    }
    gamerow?.save();
    const pingMessage = await gamerow?.showEditForm(interaction);
    return gamerow?.handleEditForm(interaction, pingMessage!);
  }
}
