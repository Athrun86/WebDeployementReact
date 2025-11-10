import app from './app';
//import { testConnection } from './db/database';
import { sequelize } from './db/sequelizeInstance';
import { initRailwayDatabase, testRailwayConnection, createRailwayUser } from './deployment/databasedeployement';

const PORT = parseInt( process.env.PORT || '3000', 10);
app.get('/', (req, res) => {
    console.log('📋 Healthcheck appelé');
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
    });
});

async function startServer() {
    try {
        if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
            // Production Railway
            console.log('RailWay environment detected. Initializing Railway database...');

            await initRailwayDatabase();
            const isConnected = await testRailwayConnection();

            if (!isConnected) {
                throw new Error('RailWay connection failed');
            }

            // Crée l'utilisateur admin si fourni via variables d'environnement
            if (process.env.ADMIN_TOKEN && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
                await createRailwayUser(
                    process.env.ADMIN_TOKEN,
                    process.env.ADMIN_USERNAME,
                    process.env.ADMIN_PASSWORD
                );
            }
        } else {
            // Développement local
            console.log('🏠 Local startup detected. Testing local database connection...');
          //  await testConnection();
            await sequelize.authenticate();
        }

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Serveur démarré sur le port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔗 Database URL: ${process.env.DATABASE_URL ? 'Configuré' : 'MANQUANT'}`);
        });


    } catch (error) {
        console.error('❌ Launch server error:', error);
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }

    }
}// Dans votre server.ts

startServer();
