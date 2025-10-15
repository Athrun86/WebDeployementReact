import {Table, Column , Model , DataType} from "sequelize-typescript";


@Table({
    tableName: "users",
    timestamps: false,
})
export class Users extends Model <Users> {
    @Column({
        type: DataType.STRING,
        allowNull: false,
        primaryKey: true,
    })
    token!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    username!: string;
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    password!: string;
}
