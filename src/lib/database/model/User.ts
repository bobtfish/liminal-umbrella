import {
    DataTypes, Model, InferAttributes, InferCreationAttributes, NonAttribute,
    BelongsToManyGetAssociationsMixin, BelongsToManySetAssociationsMixin,
    BelongsToManyAddAssociationsMixin, BelongsToManyRemoveAssociationsMixin,
    BelongsToManyHasAssociationMixin, BelongsToManyHasAssociationsMixin,
    BelongsToManyCountAssociationsMixin,
 } from '@sequelize/core';
import { Attribute, PrimaryKey, NotNull, BelongsToMany  } from '@sequelize/core/decorators-legacy';
import Role from './Role.js';
import RoleMember from './RoleMember.js';

export default class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    @Attribute(DataTypes.STRING)
    @PrimaryKey
    @NotNull
    declare id: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare username: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare nickname: string;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare rulesaccepted: boolean;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare left: boolean;

    @BelongsToMany(() => Role, {
        through: () => RoleMember,
    })
    declare roles?: NonAttribute<Role[]>;
    declare getRoles: BelongsToManyGetAssociationsMixin<Role>;
    declare setRoles: BelongsToManySetAssociationsMixin<Role, Role['id']>;
    declare addRoles: BelongsToManyAddAssociationsMixin<Role, Role['id']>;
    declare removeRoles: BelongsToManyRemoveAssociationsMixin<Role, Role['id']>;
    declare hasRole: BelongsToManyHasAssociationMixin<Role, Role['id']>;
    declare hasRoles: BelongsToManyHasAssociationsMixin<Role, Role['id']>;
    declare countBooks: BelongsToManyCountAssociationsMixin<Role>;

    static async activeUsersMap() : Promise<Map<string, User>> {
        const out = new Map();
        for (const user of await this.findAll({where: {left: false}})) {
            out.set(user.id, user);
        }
        return out;
    }
}