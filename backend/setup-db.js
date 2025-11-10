const mysql = require('mysql2/promise');

async function setupDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USER || 'root', // Utilise root au début
        password: process.env.DB_PASS,
        database: undefined, // Pas de base spécifique
        ssl: { rejectUnauthorized: false }
    });

    try {
        // Créer la base github
        await connection.execute('CREATE DATABASE IF NOT EXISTS github');
        console.log('✅ Database github created');

        // Créer gituser
        await connection.execute(`
      CREATE USER IF NOT EXISTS 'gituser'@'%' 
      IDENTIFIED BY 'j2%4sVh@0&mb8brVBzh5SL'
    `);
        console.log('✅ User gituser created');

        // Donner les privilèges
        await connection.execute(`
      GRANT ALL PRIVILEGES ON github.* TO 'gituser'@'%'
    `);
        console.log('✅ Privileges granted');

        await connection.execute('FLUSH PRIVILEGES');
        console.log('✅ Privileges flushed');

    } catch (error) {
        console.error('❌ Setup error:', error);
    } finally {
        await connection.end();
    }
}

setupDatabase();

