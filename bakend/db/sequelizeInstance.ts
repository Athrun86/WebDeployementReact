import { Sequelize } from 'sequelize-typescript';
import { Users } from '../models/User';
import * as dotenv from 'dotenv';
import * as path from 'path';
import {Project} from "../models/Project";
import { Group } from "../models/Group";
import { Student } from "../models/Student";

dotenv.config({path: path.join(__dirname, '.env') });

console.log('DB_USER=', process.env.DB_USER, 'DB_HOST=', process.env.DB_HOST, 'DB_PORT=', process.env.DB_PORT);


export const sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASS as string,
    {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3308,
        dialect: 'mariadb',
        dialectOptions: require('mariadb'),
        models: [Users, Project, Group, Student],

    }
);
export async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Sequelize: authentification réussie');
        try {
            const count = await Users.count();
            console.log('Users table accessible, rows =', count);
        } catch (e: any) {
            console.warn('Impossible d\'accéder à Users via le modèle:', e?.message);
            // fallback basique
            const [[res]] = await sequelize.query('SELECT 1 AS ok');
            console.log('SELECT 1 result:', res);
        }
    } catch (err: any) {
        console.error('Sequelize authenticate failed:', err.message ?? err);
        throw err;
    }

}

// Associations
Project.hasMany(Group, { foreignKey: "projectId" });
Group.belongsTo(Project, { foreignKey: "projectId" });
Group.hasMany(Student, { foreignKey: "groupId" });
Student.belongsTo(Group, { foreignKey: "groupId" });

export { Project };
export { Group };
export { Student };

export default sequelize;
