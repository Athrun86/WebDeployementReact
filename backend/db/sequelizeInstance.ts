import { Sequelize } from 'sequelize-typescript';
import { Users } from '../models/User';
import * as dotenv from 'dotenv';
import * as path from 'path';
import {Project} from "../models/Project";
import { Group } from "../models/Group";
import { Student } from "../models/Student";

// Charger dotenv seulement en développement
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({path: path.join(__dirname, '..', '.env') });
}

console.log('Environment:', process.env.NODE_ENV);
console.log('MYSQL_URL exists:', !!process.env.MYSQL_URL);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('MYSQLHOST:', process.env.MYSQLHOST);

// Configuration adaptée pour Railway
const sequelizeConfig: any = {
    dialect: 'mysql',
    models: [Users, Project, Group, Student],
    logging: process.env.NODE_ENV === 'production' ? false : console.log,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        connectTimeout: 60000,
        acquireTimeout: 60000,
        timeout: 60000,
    }
};

// Priorité aux variables Railway
if (process.env.MYSQL_URL) {
    console.log('Using MYSQL_URL connection');
    sequelizeConfig.url = process.env.MYSQL_URL;
} else if (process.env.DATABASE_URL) {
    console.log('Using DATABASE_URL connection');
    sequelizeConfig.url = process.env.DATABASE_URL;
} else {
    console.log('Using individual connection parameters');
    sequelizeConfig.host = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
    sequelizeConfig.port = parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306');
    sequelizeConfig.username = process.env.MYSQLUSER || process.env.DB_USER || 'root';
    sequelizeConfig.password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD;
    sequelizeConfig.database = process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway';

    console.log('Connection config:', {
        host: sequelizeConfig.host,
        port: sequelizeConfig.port,
        username: sequelizeConfig.username,
        database: sequelizeConfig.database
    });
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
