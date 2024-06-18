import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';
import { getActivityListFile } from '../cogs/randomActivity/activity.js';

export const up = async (uz: MigrationParams<any>) => {
    const qi = uz.context.sequelize.getQueryInterface();
    await qi.createTable('activities', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('playing', 'streaming', 'listening', 'watching'),
            allowNull: false,
        },
        createdAt: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		updatedAt: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
    });
    await qi.addIndex('activities', {
        name: 'activities_name_unique',
        fields: ['name'],
        unique: true,
    });
    await qi.bulkInsert('activities', getActivityListFile().map(activityName => {
        return {
            name: activityName,
            type: 'playing',
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    }));
};

export const down = async (uz: MigrationParams<any>) => {
    const qi = uz.context.sequelize.getQueryInterface()
    await qi.dropTable('activities');
};
