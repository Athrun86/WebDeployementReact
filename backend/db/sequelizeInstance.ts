import { Sequelize } from 'sequelize-typescript';
import { Users } from '../models/User';
import * as dotenv from 'dotenv';
import * as path from 'path';
import {Project} from "../models/Project";
import { Group } from "../models/Group";
import { Student } from "../models/Student";

dotenv.config({path: path.join(__dirname, '..', '.env') });

console.log('DB_USER=', process.env.DB_USER, 'DB_HOST=', process.env.DB_HOST, 'DB_PORT=', process.env.DB_PORT);

// Configuration adaptée pour Railway
const sequelizeConfig: any = {
    dialect: 'mysql',
    models: [Users, Project, Group, Student],
    logging: console.log,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

// Priorité aux variables Railway puis fallback sur les variables personnalisées
if (process.env.MYSQL_URL || process.env.DATABASE_URL) {
    // Utiliser l'URL de connexion Railway
    const dbUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
    sequelizeConfig.url = dbUrl;
} else {
    // Configuration manuelle
    sequelizeConfig.host = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
    sequelizeConfig.port = parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306');
    sequelizeConfig.username = process.env.MYSQLUSER || process.env.DB_USER || 'root';
    sequelizeConfig.password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || process.env.DB_PASS;
    sequelizeConfig.database = process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway';
}

export const sequelize = new Sequelize(sequelizeConfig);

export async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Sequelize: authentification réussie');
        try {
            const count = await Users.count();
            console.log('Users table accessible, rows =', count);
        } catch (e: any) {
            console.warn('Impossible d\'accéder à Users via le modèle:', e?.message);
            const [[res]] = await sequelize.query('SELECT 1 AS ok');
            console.log('SELECT 1 result:', res);
        }
    } catch (err: any) {
        console.error('❌ Sequelize authenticate failed:', err.message ?? err);
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
