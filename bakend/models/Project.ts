// typescript
import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "projects",
    timestamps: false,
})
export class Project extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "name",
    })
    declare name: string;

    @Column({
        type : DataType.TEXT,
        allowNull: false,
        field: "organization_name",
    })
    declare organizationName: string;
    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "repo_pattern",
        validate: {
            containsPlaceholder(value: string) {
                if (!value || value.indexOf("##") === -1) {
                    throw new Error("repo_pattern must contain '##' as a placeholder for group number");
                }
            },
        },
    })
    declare repoPattern: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "github_url",
    })
    declare githubUrl: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "min_members",
    })
    declare minMembers: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "max_members",
    })
    declare maxMembers: number;
    @Column({
        type: DataType.STRING(128),
        allowNull: false,
        unique: true,
        field: "security_key",
    })
    declare securityKey: string;
    // Génère un nom de repo à partir du pattern et du numéro de groupe (ex: Groupe## -> Groupe03)
    static formatRepoName(pattern: string, groupNumber: number): string {
        if (!pattern || pattern.indexOf("##") === -1) {
            throw new Error("pattern doit contenir '##'");
        }
        const numStr = String(groupNumber).padStart(2, "0");
        return pattern.replace(/##/g, numStr);
    }
    getJoinPath(): string {
        return `/join/project/${this.id}/${this.securityKey}`;
    }
}
