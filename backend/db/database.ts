 import { Sequelize } from 'sequelize-typescript';
import * as mariadb from 'mariadb';
import { Users } from '../models/User';
import { hashSync } from 'bcrypt';
import * as readline from 'readline';
import { Project } from '../models/Project';
import { Group} from  '../models/Group';
import { Student } from '../models/Student';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import crypto from 'crypto';
import encryptToken from "../utils/crypto";

dotenv.config({ path: path.join(__dirname, '..', '.env') });




const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
function askQuestion(query: string, defaultValue?: string): Promise<string> {
    const prompt = defaultValue ? `${query} (default: ${defaultValue}): ` : `${query}: `;
    return new Promise((resolve) => rl.question(prompt, (answer) => resolve(answer || defaultValue || '')));
}

function escapeSql(value: string) {
    return value.replace(/'/g, "''");
}


async function readEnvFile(filePath: string): Promise<Record<string, string>> {
    try {
        const raw = await fs.readFile(filePath, 'utf8');
        const lines = raw.split(/\r?\n/);
        const map: Record<string, string> = {};
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const idx = trimmed.indexOf('=');
            if (idx > 0) {
                const key = trimmed.slice(0, idx);
                const val = trimmed.slice(idx + 1);
                map[key] = val;
            }
        }
        return map;
    } catch (err) {
        return {};
    }
}

/**
 * Utilise root pour créer la BDD, accorder les privilèges à l'utilisateur lu depuis .env,
 * puis teste la connexion de cet utilisateur en créant/supprimant une table de test.
 */
async function setupDatabaseAndGrant(
    rootUser: string,
    rootPass: string,
    grantUser: string,
    grantPass: string,
    host: string,
    port: number
) {
    const rootConn = await mariadb.createConnection({
        host,
        user: rootUser,
        password: rootPass,
        port,
    });

    try {
        await rootConn.query('DROP DATABASE IF EXISTS `github`;');
        await rootConn.query('CREATE DATABASE `github`;');

        // Vérifier si l'utilisateur existe (rapport informatif uniquement)
        const checkRes: any = await rootConn.query(
            'SELECT COUNT(*) AS cnt FROM mysql.user WHERE User = ? AND Host = ?;',
            [grantUser, host]
        );
        const count = Array.isArray(checkRes) ? (checkRes[0]?.cnt ?? 0) : (checkRes?.cnt ?? 0);
        if (count === 0) {
            console.warn(`Attention: l'utilisateur ${grantUser}@${host} n'a pas été trouvé dans mysql.user. Vous avez dit que vous le créerez manuellement.`);
        } else {
            console.log(`Utilisateur ${grantUser}@${host} trouvé (${count}).`);
        }

        // Accorder les privilèges sur la base github (exécuté en tant que root)
        await rootConn.query(
            `GRANT ALL PRIVILEGES ON \`github\`.* TO '${escapeSql(grantUser)}'@'${escapeSql(host)}';`
        );
        await rootConn.query('FLUSH PRIVILEGES;');
        console.log(`Privilèges accordés à ${grantUser}@${host} sur la base github (GRANT + FLUSH exécutés).`);
    } finally {
        await rootConn.end();
    }

    // Test de confirmation : se connecter en tant que l'utilisateur et créer/supprimer une table de test
    let testConn;
    try {
        testConn = await mariadb.createConnection({
            host,
            user: grantUser,
            password: grantPass,
            port,
            database: 'github',
        });

        await testConn.query('CREATE TABLE IF NOT EXISTS `__perm_check` (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY);');
        await testConn.query('DROP TABLE IF EXISTS `__perm_check`;');

        console.log(`Vérification réussie : ${grantUser}@${host} peut créer/supprimer des tables dans github.`);
    } catch (err) {
        console.error(`Échec de la vérification pour ${grantUser}@${host} :`, err);
    } finally {
        if (testConn) await testConn.end();
    }
}

function SequelizeConnection(username: string, password: string, port: number, host: string) {
    return new Sequelize('github', username, password, {
        host,
        dialect: 'mariadb',
        port,
        models: [Users, Project, Group, Student],
    });
}

async function insertUser(token: string, username: string, password: string) {
    const hashed = hashSync(password, 10);
    const encryptedToken = encryptToken(token);
    await Users.create({
        token: encryptedToken,
        username,
        password: hashed,
    });
    console.log('User applicatif créé avec succès.');
}

async function CreateDatabase() {
    try {
        const envPathDefault = path.join('bakend', '.env');
        const envPath = await askQuestion('Chemin vers le fichier .env Sequelize', envPathDefault);
        const env = await readEnvFile(envPath);

        const rootUser = await askQuestion('Enter your MariaDB root username', 'root');
        const rootPassword = await askQuestion('Enter your MariaDB root password');
        const portInput = await askQuestion('Enter MariaDB port', env.DB_PORT || '3308');
        const port = parseInt(portInput, 10) || 3308;
        const host = env.DB_HOST || 'localhost';

        const managerUser = env.DB_USER || (await askQuestion('Enter the DB manager username to create/use (ex: gituser)', 'gituser'));
        const managerPassword = env.DB_PASS || (await askQuestion('Enter the DB manager password', ''));

        // Ne crée pas l'utilisateur : usage de root pour gérer la DB et accorder les droits
        await setupDatabaseAndGrant(rootUser, rootPassword, managerUser, managerPassword, host, port);

        // Ensuite on synchronise Sequelize en utilisant l'utilisateur de manager (présumé créé manuellement)
        const sequelize = SequelizeConnection(managerUser, managerPassword, port, host);
        await sequelize.authenticate();
        await sequelize.sync({ force: true });
        console.log('Sequelize synchronisé avec la base github.');

        const token = await askQuestion('Enter user token');
        const adminusername = await askQuestion('Enter user username');
        const adminpassword = await askQuestion('Enter user password');
        await insertUser(token, adminusername, adminpassword);
    } catch (err) {
        console.error('Erreur lors de la configuration de la DB :', err);
    } finally {
        rl.close();
    }
}

CreateDatabase();


