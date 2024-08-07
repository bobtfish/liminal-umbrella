import { DataTypes, Model, InferAttributes, InferCreationAttributes } from '@sequelize/core';
import { Attribute, NotNull, PrimaryKey, Index, Unique } from '@sequelize/core/decorators-legacy';
//import User from './User.js';

export default class GreetingMessage extends Model<InferAttributes<GreetingMessage>, InferCreationAttributes<GreetingMessage>> {
	@Attribute(DataTypes.STRING)
	@NotNull
	@PrimaryKey
	declare messageId: string;

	@Attribute(DataTypes.STRING)
	@Unique
	@Index
	declare userId?: string;

	//@HasOne(() => User, /* foreign key */ 'key')
	//declare user: NonAttribute<User>;
}
