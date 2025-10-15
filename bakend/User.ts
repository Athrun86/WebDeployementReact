
import {Table, Column, Model, DataType} from "sequelize-typescript";

@Table({
    tableName: "users",
    timestamps: false,
})
export class Users extends Model {
    @Column({
        type: DataType.STRING,
        allowNull: false,
        primaryKey: true,
    })
    declare token: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare username: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare password: string;
}
