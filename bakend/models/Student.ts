import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Group } from "./Group";
import {Project} from "./Project";

@Table({
    tableName: "students",
    timestamps: false,
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
    declare githubUsername: string;

    @ForeignKey(() => Group)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "group_id",
    })
    @BelongsTo(() => Group)
    declare group: Group;
    declare groupId: number;
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

