import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    NonAttribute,
    CreationOptional,
    BelongsToGetAssociationMixin,
    BelongsToManyGetAssociationsMixin,
    BelongsToManySetAssociationsMixin,
    BelongsToManyAddAssociationMixin,
    BelongsToManyAddAssociationsMixin,
    BelongsToManyRemoveAssociationMixin,
    BelongsToManyRemoveAssociationsMixin,
    BelongsToManyCountAssociationsMixin,
    BelongsToManyHasAssociationMixin,
    BelongsToManyHasAssociationsMixin,
    HasManyGetAssociationsMixin
} from '@sequelize/core';
import {
    Index,
    Attribute,
    NotNull,
    Unique,
    PrimaryKey,
    AutoIncrement,
    BelongsTo,
    Default,
    DeletedAt,
    BelongsToMany,
    HasMany
} from '@sequelize/core/decorators-legacy';
import GameSystem from './GameSystem.js';
import User from './User.js';
import EventInterest from './EventInterest.js';
import { container } from '@sapphire/framework';
import { getGameListingChannel, format, getOneShotThread } from '../../discord.js';
import { GuildScheduledEvent, Message, GuildScheduledEventStatus, DiscordAPIError } from 'discord.js';
import dayjs from 'common';

export default class GameSession extends Model<InferAttributes<GameSession>, InferCreationAttributes<GameSession>> {
    @Attribute(DataTypes.INTEGER)
    @AutoIncrement
    @PrimaryKey
    declare key: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    @NotNull
    @Index
    declare owner: string;

    @BelongsTo(() => User, 'owner')
    declare ownerOb?: NonAttribute<User>;
    declare getOwnerOb: BelongsToGetAssociationMixin<User>;

    @Attribute(DataTypes.STRING)
    @Index
    @Unique
    @NotNull
    declare gameListingsMessageId: string;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    @Default(false)
    declare gameListingsMessageCleanedup: CreationOptional<boolean>;

    @Attribute(DataTypes.STRING)
    @Index
    @Unique
    @NotNull
    declare eventId: string;

    @HasMany(() => EventInterest, {
        foreignKey: 'guildScheduledEventId',
        inverse: {
            as: 'eventInterests'
        }
    })
    declare eventInterests: NonAttribute<EventInterest>;
    declare getEventInterests: HasManyGetAssociationsMixin<EventInterest>;

    @Attribute(DataTypes.STRING)
    @Index
    @Unique
    @NotNull
    declare channelId: string;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    @Default(false)
    declare channelCleanedup: CreationOptional<boolean>;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare name: string;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare gamesystem: number;

    @BelongsTo(() => GameSystem, 'gamesystem')
    declare gamesystemOb?: NonAttribute<GameSystem>;
    declare getGamesystemOb: BelongsToGetAssociationMixin<GameSystem>;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare type: string;

    @Attribute(DataTypes.DATE)
    @NotNull
    declare starttime: Date;

    @Attribute(DataTypes.DATE)
    @NotNull
    declare endtime: Date;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare maxplayers: number;

    @Attribute(DataTypes.INTEGER)
    @Default(0)
    @NotNull
    declare signed_up_players: number;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare description: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare location: string;

    @DeletedAt
    declare deletedAt: Date | null;

    @BelongsToMany(() => User, {
        through: 'GameSessionUserSignup',
        inverse: {
            as: 'signedupGameSessions'
        }
    })
    declare signedupUsers?: NonAttribute<User[]>;
    declare getSignedupUsers: BelongsToManyGetAssociationsMixin<User>;
    declare setSignedupUsers: BelongsToManySetAssociationsMixin<User, User['key']>;
    declare addSignedupUser: BelongsToManyAddAssociationMixin<User, User['key']>;
    declare addSignedupUsers: BelongsToManyAddAssociationsMixin<User, User['key']>;
    declare removeSignedupUser: BelongsToManyRemoveAssociationMixin<User, User['key']>;
    declare removeSignedupUsers: BelongsToManyRemoveAssociationsMixin<User, User['key']>;
    declare hasSignedupUser: BelongsToManyHasAssociationMixin<User, User['key']>;
    declare hasSignedupUsers: BelongsToManyHasAssociationsMixin<User, User['key']>;
    declare countSignedupUsers: BelongsToManyCountAssociationsMixin<User>;

    gameListingsMessageLink(): Promise<string | null> {
        const channel = getGameListingChannel();
        if (!channel) return Promise.resolve(null);
        return Promise.resolve(`https://discord.com/channels/${container.guildId}/${channel.id}/${this.gameListingsMessageId}`);
    }

    @Attribute(DataTypes.VIRTUAL(DataTypes.STRING, ['eventId']))
    get eventLink(): CreationOptional<string> {
        return `https://discord.com/events/${container.guildId}/${this.eventId}`;
    }
    @Attribute(DataTypes.VIRTUAL(DataTypes.STRING, ['channelId']))
    get channelLink(): CreationOptional<string> {
        return `https://discord.com/channels/${container.guildId}/${this.channelId}`;
    }

    async CRUDRead(name: string) {
        if (name == 'signedupplayers') {
            return (await this.getSignedupUsers()).map((user: User) => {
                return { key: user.key, nickname: user.nickname, avatarURL: user.avatarURL, username: user.username };
            });
        }
        if (name == 'owner') {
            const user = await this.getOwnerOb();
            return { key: user!.key, nickname: user!.nickname, avatarURL: user!.avatarURL, username: user!.username };
        }
        if (name == 'gameListingsMessageLink') return await this.gameListingsMessageLink();

        return this.get(name);
    }

    async CRUDSave() {
        const db = await container.database.getdb();
        return db.transaction(async () => {
            await this.updateGameThread();
            await this.updateGameListing();
            await this.updateEvent();
            return this.save();
        });
    }

    async CRUDDestroy() {
        const db = await container.database.getdb();
        return db.transaction(async () => {
            await this.deleteGameThread();
            await this.deleteGameListing();
            await this.cancelEvent();
            return this.destroy();
        });
    }

    getGameThread() {
        return getOneShotThread(this.channelId);
    }

    async updateGameThread() {
        const thread = await this.getGameThread();
        if (!thread) return;
        const starttime = dayjs(this.starttime);
        const endtime = dayjs(this.endtime);
        const name = `${this.name} (${starttime.format('DD/MM/YYYY HH:mm')}-${endtime.format('HH:mm')})`;
        if (name !== thread.name) {
            await thread.setName(name);
        }
        const firstMessage = await thread.fetchStarterMessage();
        if (!firstMessage) return;
        if (this.description !== firstMessage.content) {
            await firstMessage.edit(this.description);
        }
    }

    async deleteGameThread() {
        const thread = await this.getGameThread();
        await thread?.delete();
    }

    async addMemberToGameThread(id: string) {
        const thread = await this.getGameThread();
        await thread?.members.add(id);
    }

    async removeMemberFromGameThread(id: string) {
        const thread = await this.getGameThread();
        await thread?.members.remove(id);
    }

    async getGameListing(): Promise<Message | null> {
        const channel = getGameListingChannel();
        try {
            return (await channel?.messages.fetch(this.gameListingsMessageId)) ?? null;
        } catch (e) {
            if (e instanceof DiscordAPIError && e.code === 10008) {
                // 'Unknown Message' - message has already been deleted, skip
                return null;
            } else {
                throw e;
            }
        }
    }

    async updateGameListing() {
        const message = await this.getGameListing();
        if (!message) return;
        const newContents = await format(this);
        if (newContents !== message.content) {
            await message.edit(newContents);
        }
    }

    async deleteGameListing() {
        const message = await this.getGameListing();
        await message?.delete();
    }

    async getEvent(): Promise<GuildScheduledEvent | null> {
        try {
            return (await container.guild?.scheduledEvents.fetch(this.get('eventId'))) ?? null;
        } catch (e) {
            if (e instanceof DiscordAPIError && e.code === 10070) {
                // 'Unknown Guild Scheduled Event' - event has already been deleted, skip
                return null;
            } else {
                throw e;
            }
        }
    }

    async updateEvent() {
        const event = await this.getEvent();
        await event?.edit({
            name: this.name,
            description: this.description,
            scheduledStartTime: this.starttime,
            scheduledEndTime: this.endtime
        });
    }

    async cancelEvent() {
        const event = await this.getEvent();
        if (event?.status == GuildScheduledEventStatus.Scheduled) {
            await event.setStatus(GuildScheduledEventStatus.Canceled);
        }
        if (event?.status == GuildScheduledEventStatus.Active) {
            await event.setStatus(GuildScheduledEventStatus.Completed);
        }
    }
}
