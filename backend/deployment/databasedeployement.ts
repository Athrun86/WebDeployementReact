import { Sequelize } from 'sequelize-typescript';
import { Users } from '../models/User';
import { Project } from '../models/Project';
import { Group } from '../models/Group';
import { Student } from '../models/Student';
import { hashSync } from 'bcrypt';
import encryptToken from '../utils/crypto';

let sequelize: Sequelize | null = null;

/**
 * Initialise la connexion MySQL Railway avec Sequelize
 */
export async function initRailwayDatabase() {
    try {
        const databaseUrl = process.env.DATABASE_URL;

        if (databaseUrl) {
            // Railway fournit DATABASE_URL directement
            sequelize = new Sequelize(databaseUrl, {
                dialect: 'mysql',
                models: [Users, Project, Group, Student],
                logging: process.env.NODE_ENV === 'production' ? false : console.log,
                dialectOptions: {
                    ssl: {
                        rejectUnauthorized: false
                    }
                }
            });
        } else {
            // Variables séparées en fallback
            sequelize = new Sequelize(
                process.env.MYSQL_DATABASE || 'railway',
                process.env.MYSQL_USER || 'root',
                process.env.MYSQL_PASSWORD || '',
                {
                    host: process.env.MYSQL_HOST,
                    port: parseInt(process.env.MYSQL_PORT || '3306'),
                    dialect: 'mysql',
                    models: [Users, Project, Group, Student],
                    logging: false,
                    dialectOptions: {
                        ssl: {
                            rejectUnauthorized: false
                        }
                    }
                }
            );
        }

        await sequelize.authenticate();
        console.log('✅ Railway MySQL connecté avec Sequelize');

        // Synchronise les tables (sans force pour préserver les données)
        await sequelize.sync({ force: false });
        console.log('✅ Tables Railway synchronisées');

        return sequelize;
    } catch (error) {
        console.error('❌ Erreur Railway Sequelize:', error);
        throw error;
    }
}

/**
 * Crée l'utilisateur admin initial sur Railway
 */
export async function createRailwayUser(token: string, username: string, password: string) {
    if (!sequelize) throw new Error('Pas de connexion Sequelize');

    const hashedPassword = hashSync(password, 10);
    const encryptedToken = encryptToken(token);

    try {
        const [user, created] = await Users.findOrCreate({
            where: { username },
            defaults: {
                username,
                password: hashedPassword,
                token: encryptedToken
            }
        });

        if (!created) {
            await user.update({ token: encryptedToken });
            console.log('👤 Utilisateur Railway mis à jour');
        } else {
            console.log('👤 Utilisateur Railway créé');
        }

        return user;
    } catch (error) {
        console.error('❌ Erreur création utilisateur Railway:', error);
        throw error;
    }
}

export function getRailwaySequelize(): Sequelize | null {
    return sequelize;
}

export async function testRailwayConnection(): Promise<boolean> {
    if (!sequelize) return false;

    try {
        await sequelize.authenticate();
        return true;
    } catch (error) {
        console.error('❌ Test connexion Railway échoué:', error);
        return false;
    }
}
