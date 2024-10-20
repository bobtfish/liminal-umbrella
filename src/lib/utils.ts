import {
    container,
    type ChatInputCommandSuccessPayload,
    type Command,
    type ContextMenuCommandSuccessPayload,
    type MessageCommandSuccessPayload
} from '@sapphire/framework';
import { cyan } from 'colorette';
import type { APIUser, Guild, User } from 'discord.js';
import { limitConcurrency } from 'limit-concurrency-decorator';

export function logSuccessCommand(payload: ContextMenuCommandSuccessPayload | ChatInputCommandSuccessPayload | MessageCommandSuccessPayload): void {
    let successLoggerData: ReturnType<typeof getSuccessLoggerData>;

    if ('interaction' in payload) {
        successLoggerData = getSuccessLoggerData(payload.interaction.guild, payload.interaction.user, payload.command);
    } else {
        successLoggerData = getSuccessLoggerData(payload.message.guild, payload.message.author, payload.command);
    }

    container.logger.debug(`${successLoggerData.shard} - ${successLoggerData.commandName} ${successLoggerData.author} ${successLoggerData.sentAt}`);
}

export function getSuccessLoggerData(guild: Guild | null, user: User, command: Command) {
    const shard = getShardInfo(guild?.shardId ?? 0);
    const commandName = getCommandInfo(command);
    const author = getAuthorInfo(user);
    const sentAt = getGuildInfo(guild);

    return { shard, commandName, author, sentAt };
}

function getShardInfo(id: number) {
    return `[${cyan(id.toString())}]`;
}

function getCommandInfo(command: Command) {
    return cyan(command.name);
}

function getAuthorInfo(author: User | APIUser) {
    return `${author.username}[${cyan(author.id)}]`;
}

function getGuildInfo(guild: Guild | null) {
    if (guild === null) return 'Direct Messages';
    return `${guild.name}[${cyan(guild.id)}]`;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/naming-convention
export const Sequential = limitConcurrency(1);

export async function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export function shortSleep() {
    return sleep(100);
}

export function sleepUpToFiveMinutes() {
    return sleep(Math.floor(Math.random() * 1000 * 60 * 5));
}

export function sleepUpToTwoHours() {
    return sleep(Math.floor(Math.random() * 1000 * 60 * 60 * 2));
}
