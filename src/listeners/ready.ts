import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import type { Client } from 'discord.js';
import type { StoreRegistryValue } from '@sapphire/pieces';
import { blue, gray, green, magenta, magentaBright, white, yellow } from 'colorette';
import {Sequential} from '../lib/utils.js';
const dev = process.env.NODE_ENV !== 'production';

@ApplyOptions<Listener.Options>({ once: true })
export class ReadyEvent extends Listener {
	private readonly style = dev ? yellow : blue;

	@Sequential
	public override async run(client: Client) {
		await client.guilds.fetch(process.env.DISCORD_GUILD_ID).then(async (guild) => {
			const start = Date.now();
			await this.container.database.sync(guild);
			console.log(`Watermark from DB is ${this.container.database.highwatermark} start is ${start}`);
			//await this.container.database.syncChannelAvailableGames(guild, 'available_games');
			await this.container.database.syncChannelAvailableGames(guild, 'available_games');
			const channel_name = process.env.GREET_USERS_CHANNEL || 'new_members';
			await this.container.database.syncChannelNewMembers(guild, channel_name);
				//console.log(id);
				//console.log();
				//console.log(guildMember);
			this.container.database.setHighestWatermark(start);
		});
		this.printBanner();
		this.printStoreDebugInformation();

		this.container.ticker.start();
	}

	private printBanner() {
		const success = green('+');

		const llc = dev ? magentaBright : white;
		const blc = dev ? magenta : blue;

		const line01 = llc('');
		const line02 = llc('');
		const line03 = llc('');

		// Offset Pad
		const pad = ' '.repeat(7);

		console.log(
			String.raw`
${line01} ${pad}${blc('1.0.0')}
${line02} ${pad}[${success}] Gateway
${line03}${dev ? ` ${pad}${blc('<')}${llc('/')}${blc('>')} ${llc('DEVELOPMENT MODE')}` : ''}
		`.trim()
		);
	}

	private printStoreDebugInformation() {
		const { client, logger } = this.container;
		const stores = [...client.stores.values()];
		const last = stores.pop()!;

		for (const store of stores) logger.info(this.styleStore(store, false));
		logger.info(this.styleStore(last, true));
	}

	private styleStore(store: StoreRegistryValue, last: boolean) {
		return gray(`${last ? '└─' : '├─'} Loaded ${this.style(store.size.toString().padEnd(3, ' '))} ${store.name}.`);
	}
}
