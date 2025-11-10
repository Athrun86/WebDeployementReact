import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Group } from "./Group";
import {Project} from "./Project";

@Table({
    tableName: "students",
    timestamps: false,
    // Unicité : un même github_username ne peut apparaître qu'une seule fois pour un même projet
    indexes: [{ unique: true, fields: ["project_id", "github_username"] }],
})
export class Student extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare name: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "github_username",
    })
    declare username: string;

    // cle et relation vers Group
    @ForeignKey(() => Group)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "group_id",
    })
    declare groupId: number;

    @BelongsTo(() => Group)
    declare group: Group;

    // cle et relation vers Project
    @ForeignKey(() => Project)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "project_id",
    })
    declare projectId: number;

    @BelongsTo(() => Project)
    declare project: Project;

}
