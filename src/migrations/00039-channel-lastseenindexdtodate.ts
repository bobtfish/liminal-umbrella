import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    const qi = uz.context.sequelize.getQueryInterface();
    await sq.transaction(async (transaction: any) => {
        // Remove fkey from rolemembers
        await sq.query('ALTER TABLE rolemembers RENAME TO _rolemembers_old', { raw: true, transaction });
        await sq.query(
            'CREATE TABLE `rolemembers` (`userkey` TEXT NOT NULL, `roleKey` TEXT NOT NULL REFERENCES `roles` (`key`) ON DELETE CASCADE ON UPDATE CASCADE, `createdAt` TEXT NOT NULL, `updatedAt` TEXT NOT NULL)',
            { raw: true, transaction }
        );
        await sq.query('INSERT INTO rolemembers SELECT * FROM _rolemembers_old', { raw: true, transaction });
        await sq.query('DROP TABLE  _rolemembers_old', { raw: true, transaction });

        // Remove fkey from gamesessionusersignups
        await sq.query('ALTER TABLE gamesessionusersignups RENAME TO _gamesessionusersignups_old', { raw: true, transaction });
        await sq.query(
            'CREATE TABLE `gamesessionusersignups` (`key` INTEGER PRIMARY KEY, `userKey` TEXT NOT NULL, `gameSessionKey` INTEGER NOT NULL REFERENCES `gamesessions` (`key`) ON DELETE CASCADE ON UPDATE CASCADE, `createdAt` TEXT NOT NULL, `updatedAt` TEXT NOT NULL)'
        );
        await sq.query('INSERT INTO gamesessionusersignups SELECT * FROM _gamesessionusersignups_old', { raw: true, transaction });
        await sq.query('DROP TABLE _gamesessionusersignups_old', { raw: true, transaction });

        // Remove fkey from plannedgames
        await sq.query('ALTER TABLE plannedgames RENAME TO _plannedgames_old', { raw: true, transaction });
        await sq.query(
            'CREATE TABLE "plannedgames" (`owner` TEXT NOT NULL UNIQUE, `name` TEXT, `description` TEXT, `createdAt` TEXT NOT NULL, `updatedAt` TEXT NOT NULL, `location` TEXT, `key` INTEGER PRIMARY KEY, `gamesystem` INTEGER REFERENCES `gamesystems` (`key`) ON DELETE CASCADE ON UPDATE CASCADE, `date` TEXT, `maxplayers` INTEGER, `type` TEXT, `starttime` TEXT NOT NULL, `endtime` TEXT NOT NULL)'
        );
        await sq.query('INSERT INTO plannedgames SELECT * FROM _plannedgames_old', { raw: true, transaction });
        await sq.query('DROP TABLE  _plannedgames_old', { raw: true, transaction });

        // Remove fkey from gamesessions
        await sq.query('ALTER TABLE gamesessions RENAME TO _gamesessions_old', { raw: true, transaction });
        await sq.query(
            'CREATE TABLE "gamesessions" (`key` INTEGER PRIMARY KEY, `owner` TEXT NOT NULL, `gameListingsMessageId` TEXT NOT NULL, `eventId` TEXT NOT NULL, `channelId` TEXT NOT NULL, `createdAt` TEXT NOT NULL, `updatedAt` TEXT NOT NULL, `name` TEXT NOT NULL, `gamesystem` INTEGER NOT NULL REFERENCES `gamesystems` (`key`) ON DELETE SET NULL ON UPDATE CASCADE, `type` TEXT NOT NULL, `starttime` TEXT NOT NULL, `endtime` TEXT NOT NULL, `maxplayers` INTEGER NOT NULL, `signed_up_players` INTEGER NOT NULL, `description` TEXT NOT NULL, `location` TEXT NOT NULL, `deletedAt` TEXT, `gameListingsMessageCleanedup` INTEGER NOT NULL, `channelCleanedup` INTEGER NOT NULL)',
            { raw: true, transaction }
        );
        await sq.query('INSERT INTO gamesessions SELECT * FROM _gamesessions_old', { raw: true, transaction });
        await sq.query('DROP TABLE  _gamesessions_old', { raw: true, transaction });

        // Add fkey to eventinterests
        await sq.query('ALTER TABLE eventinterests RENAME TO _eventinterests_old', { raw: true, transaction });
        await sq.query(
            'CREATE TABLE `eventinterests` (`key` INTEGER PRIMARY KEY, `guildScheduledEventId` TEXT NOT NULL, `userId` TEXT NOT NULL, `createdAt` TEXT NOT NULL, `updatedAt` TEXT NOT NULL)'
        );
        await sq.query('INSERT INTO eventinterests SELECT * FROM _eventinterests_old', { raw: true, transaction });
        await sq.query('DROP TABLE _eventinterests_old', { raw: true, transaction });

        // Remove fkey from users
        await sq.query('ALTER TABLE users RENAME TO _users_old', { raw: true, transaction });
        await sq.query(
            'CREATE TABLE "users" (`username` TEXT NOT NULL, `nickname` TEXT NOT NULL, `rulesaccepted` INTEGER NOT NULL, `bot` INTEGER NOT NULL, `left` INTEGER NOT NULL, `createdAt` TEXT NOT NULL, `updatedAt` TEXT NOT NULL, `name` TEXT NOT NULL, `avatarURL` TEXT NOT NULL, `joinedDiscordAt` INTEGER NOT NULL, `key` TEXT NOT NULL UNIQUE PRIMARY KEY, `kicked` INTEGER NOT NULL, `lastSeenTime` TEXT NOT NULL, `lastSeenChannel` TEXT NOT NULL, `lastSeenThread` TEXT, `lastSeenMessage` TEXT);'
        );
        await sq.query('INSERT INTO users SELECT * FROM _users_old', { raw: true, transaction });
        await sq.query('DROP TABLE _users_old', { raw: true, transaction });

        // Add the column to the users table
        await qi.addColumn(
            'channels',
            'lastSeenIndexedToDate',
            {
                type: DataTypes.DATE,
                allowNull: true
            },
            { transaction }
        );

        await sq.query('UPDATE channels SET lastSeenIndexedToDate = date("1970-01-01 12:00:00")', { raw: true, transaction });
        await qi.changeColumn(
            'channels',
            'lastSeenIndexedToDate',
            {
                type: DataTypes.DATE,
                allowNull: false
            },
            { transaction }
        );
        await qi.addColumn(
            'channels',
            'lastSeenIndexedFromDate',
            {
                type: DataTypes.DATE,
                allowNull: true
            },
            { transaction }
        );
        await sq.query('UPDATE channels SET lastSeenIndexedFromDate = date("2037-12-31")', { raw: true, transaction });

        await qi.changeColumn(
            'channels',
            'lastSeenIndexedFromDate',
            {
                type: DataTypes.DATE,
                allowNull: false
            },
            { transaction }
        );

        // Add fkey back to users
        await sq.query('ALTER TABLE users RENAME TO _users_old', { raw: true, transaction });
        await sq.query(
            'CREATE TABLE IF NOT EXISTS "users" (`username` TEXT NOT NULL, `nickname` TEXT NOT NULL, `rulesaccepted` INTEGER NOT NULL, `bot` INTEGER NOT NULL, `left` INTEGER NOT NULL, `createdAt` TEXT NOT NULL, `updatedAt` TEXT NOT NULL, `name` TEXT NOT NULL, `avatarURL` TEXT NOT NULL, `joinedDiscordAt` INTEGER NOT NULL, `key` TEXT NOT NULL UNIQUE PRIMARY KEY, `kicked` INTEGER NOT NULL, `lastSeenTime` TEXT NOT NULL, `lastSeenChannel` TEXT NOT NULL REFERENCES `channels` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT, `lastSeenThread` TEXT, `lastSeenMessage` TEXT);'
        );
        await sq.query('INSERT INTO users SELECT * FROM _users_old', { raw: true, transaction });
        await sq.query('DROP TABLE _users_old', { raw: true, transaction });

        // Add fkey to rolemembers
        await sq.query('ALTER TABLE rolemembers RENAME TO _rolemembers_old', { raw: true, transaction });
        await sq.query(
            'CREATE TABLE `rolemembers` (`userkey` TEXT NOT NULL REFERENCES `users` (`key`) ON DELETE CASCADE ON UPDATE CASCADE, `roleKey` TEXT NOT NULL REFERENCES `roles` (`key`) ON DELETE CASCADE ON UPDATE CASCADE, `createdAt` TEXT NOT NULL, `updatedAt` TEXT NOT NULL)',
            { raw: true, transaction }
        );
        await sq.query('INSERT INTO rolemembers SELECT * FROM _rolemembers_old', { raw: true, transaction });
        await sq.query('DROP TABLE  _rolemembers_old', { raw: true, transaction });

        // Add fkey to gamesessionusersignups
        await sq.query('ALTER TABLE gamesessionusersignups RENAME TO _gamesessionusersignups_old', { raw: true, transaction });
        await sq.query(
            'CREATE TABLE `gamesessionusersignups` (`key` INTEGER PRIMARY KEY, `userKey` TEXT NOT NULL REFERENCES `users` (`key`) ON DELETE RESTRICT ON UPDATE CASCADE, `gameSessionKey` INTEGER NOT NULL REFERENCES `gamesessions` (`key`) ON DELETE CASCADE ON UPDATE CASCADE, `createdAt` TEXT NOT NULL, `updatedAt` TEXT NOT NULL)'
        );
        await sq.query('INSERT INTO gamesessionusersignups SELECT * FROM _gamesessionusersignups_old', { raw: true, transaction });
        await sq.query('DROP TABLE _gamesessionusersignups_old', { raw: true, transaction });
        await sq.query('CREATE INDEX `game_session_user_signups_game_session_key` ON `gamesessionusersignups` (`gameSessionKey`)');

        // Add fkey to plannedgames
        await sq.query('ALTER TABLE plannedgames RENAME TO _plannedgames_old', { raw: true, transaction });
        await sq.query(
            'CREATE TABLE IF NOT EXISTS "plannedgames" (`owner` TEXT NOT NULL UNIQUE REFERENCES `users` (`key`) ON DELETE CASCADE ON UPDATE CASCADE, `name` TEXT, `description` TEXT, `createdAt` TEXT NOT NULL, `updatedAt` TEXT NOT NULL, `location` TEXT, `key` INTEGER PRIMARY KEY, `gamesystem` INTEGER REFERENCES `gamesystems` (`key`) ON DELETE CASCADE ON UPDATE CASCADE, `date` TEXT, `maxplayers` INTEGER, `type` TEXT, `starttime` TEXT NOT NULL, `endtime` TEXT NOT NULL)'
        );
        await sq.query('INSERT INTO plannedgames SELECT * FROM _plannedgames_old', { raw: true, transaction });
        await sq.query('DROP TABLE  _plannedgames_old', { raw: true, transaction });

        // Add fkey to gamesessions
        await sq.query('ALTER TABLE gamesessions RENAME TO _gamesessions_old', { raw: true, transaction });
        await sq.query(
            'CREATE TABLE "gamesessions" (`key` INTEGER PRIMARY KEY, `owner` TEXT NOT NULL REFERENCES `users` (`key`) ON DELETE RESTRICT ON UPDATE CASCADE, `gameListingsMessageId` TEXT NOT NULL, `eventId` TEXT NOT NULL, `channelId` TEXT NOT NULL, `createdAt` TEXT NOT NULL, `updatedAt` TEXT NOT NULL, `name` TEXT NOT NULL, `gamesystem` INTEGER NOT NULL REFERENCES `gamesystems` (`key`) ON DELETE SET NULL ON UPDATE CASCADE, `type` TEXT NOT NULL, `starttime` TEXT NOT NULL, `endtime` TEXT NOT NULL, `maxplayers` INTEGER NOT NULL, `signed_up_players` INTEGER NOT NULL, `description` TEXT NOT NULL, `location` TEXT NOT NULL, `deletedAt` TEXT, `gameListingsMessageCleanedup` INTEGER NOT NULL, `channelCleanedup` INTEGER NOT NULL)'
        );
        await sq.query('INSERT INTO gamesessions SELECT * FROM _gamesessions_old', { raw: true, transaction });
        await sq.query('DROP TABLE _gamesessions_old', { raw: true, transaction });
        await sq.query('CREATE INDEX `game_sessions_owner` ON `gamesessions` (`owner`)', { raw: true, transaction });
        await sq.query('CREATE UNIQUE INDEX `game_sessions_gane_listings_message_id_unique` ON `gamesessions` (`gameListingsMessageId`)', {
            raw: true,
            transaction
        });
        await sq.query('CREATE UNIQUE INDEX `game_sessions_event_id_unique` ON `gamesessions` (`eventId`)', { raw: true, transaction });
        await sq.query('CREATE UNIQUE INDEX `game_sessions_channel_id_unique` ON `gamesessions` (`channelId`)', { raw: true, transaction });
        await sq.query('CREATE INDEX `game_session_user_signups_user_key` ON `gamesessionusersignups` (`userKey`)', { raw: true, transaction });

        // Add fkey to eventinterests
        await sq.query('ALTER TABLE eventinterests RENAME TO _eventinterests_old', { raw: true, transaction });
        await sq.query(
            'CREATE TABLE `eventinterests` (`key` INTEGER PRIMARY KEY, `guildScheduledEventId` TEXT NOT NULL, `userId` TEXT NOT NULL REFERENCES `users` (`key`) ON DELETE RESTRICT ON UPDATE CASCADE, `createdAt` TEXT NOT NULL, `updatedAt` TEXT NOT NULL)'
        );
        await sq.query('INSERT INTO eventinterests SELECT * FROM _eventinterests_old', { raw: true, transaction });
        await sq.query('DROP TABLE _eventinterests_old', { raw: true, transaction });
    });
};

export const down = async (_uz: MigrationParams<any>) => {};
