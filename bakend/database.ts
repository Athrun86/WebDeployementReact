import {Sequelize } from 'sequelize-typescript';
import * as mariadb from "mariadb";
import {Users} from "./User"
import {hashSync} from "bcrypt";

import * as readline from "readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function askQuestion(query: string): Promise<string> {
    return new Promise((resolve) => rl.question(query, resolve));
}
function CreateDatabaseTable(username: string, password: string) {
    const conn = mariadb.createConnection({
        host: 'localhost',
        user: username,
        password: password,
        port: 3308
    });

    conn.then(async (connection) => {
        await connection.query("DROP DATABASE IF EXISTS github;");
        await connection.query("CREATE DATABASE github;");
        await connection.end();
        console.log("Database github created successfully.");
    });

}

function SequelizeConnection(username: string, password: string) {
    return  new Sequelize('github', username, password, {
        host: 'localhost',
        dialect: 'mariadb',
        port: 3308,
        models: [Users] // or [Player, Team],
    });

}
async function insertUser(token: string, username: string, password: string) {
    password = hashSync(password, 10);
    await Users.create(
        {
            token: token,
            username: username,
            password: password
        }
    )
    console.log(" user created successfully.");
}
async function CreateDatabase() {
    const dbusername = await askQuestion("Enter your MariaDB username: ");
    const dbpassword = await askQuestion("Enter your MariaDB password: ");
    await CreateDatabaseTable(dbusername, dbpassword);
    const sequelize = SequelizeConnection(dbusername, dbpassword);
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    const token = await askQuestion("Enter user token: ");
    const adminusername = await askQuestion("Enter user username: ");
    const adminpassword = await askQuestion("Enter user password: ");
    await insertUser(token, adminusername, adminpassword);
    rl.close();

}
CreateDatabase();






