import {Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, Unique} from "sequelize-typescript";
import { Project } from "./Project";
import { Student } from "./Student";

@Table({

    tableName: "groups",
    timestamps: false,
    indexes: [
        { unique: true, fields: ["project_id", "group_number"] },
        { unique: true, fields: ["project_id", "name"] },
    ],
})
export class Group extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        // unique supprimé pour qu'un même nom de groupe puisse exister dans des projets différents
    })
    declare name: string;

    @ForeignKey(() => Project)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "project_id",
    })
    declare projectId: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "group_number",
    })
    declare groupNumber: number;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: "github_repo_url",
    })
    declare github_repo_url: string;

    @BelongsTo(() => Project)
    declare project: Project;

    @HasMany(() => Student)
    declare students: Student[];
}
