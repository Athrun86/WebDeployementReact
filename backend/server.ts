import app from './app';
//import { testConnection } from './db/database';
import { sequelize } from './db/sequelizeInstance';
import { initRailwayDatabase, testRailwayConnection, createRailwayUser } from './deployment/databasedeployement';

const PORT = process.env.PORT || 3000;

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

        app.listen(PORT, () => {
            console.log(`🚀 Server launched on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Launch server error:', error);
        process.exit(1);
    }
}

startServer();
