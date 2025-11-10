import { Octokit } from "octokit";
import dotenv from "dotenv";
import app from "./app";
import { sequelize, testConnection } from "./db/sequelizeInstance";
import { initRailwayDatabase, closeRailwayDatabase } from './deployement/databasedeployement';
import express from "express";
import path from "path";

dotenv.config();

const port = Number(process.env.PORT ?? 3000);

/**
 * Initializes the database based on the environment
 * Uses Railway MySQL in production, MariaDB locally
 */
async function initializeDatabase() {
    if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
        console.log('🚂 Initializing Railway database...');
        await initRailwayDatabase();
        console.log('✅ Railway database initialized');
    } else {
        console.log('🏠 Initializing local MariaDB...');
        await testConnection();
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('✅ Local database connected and synchronized');
    }
}

/**
 * Closes database connections gracefully
 */
async function closeDatabaseConnections() {
    if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
        await closeRailwayDatabase();
    } else {
        await sequelize.close();
    }
}

async function startServer() {
    try {
        // Initialize database
        await initializeDatabase();

        // Serve static files in production
        if (process.env.NODE_ENV === 'production') {
            app.use(express.static(path.join(__dirname, '../frontend/build')));

            app.get('*', (req, res) => {
                res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
            });
        }

        // Health check endpoint
        app.get('/health', (req, res) => {
            res.json({
                status: 'OK',
                environment: process.env.NODE_ENV || 'development',
                timestamp: new Date().toISOString()
            });
        });

        const server = app.listen(port, '0.0.0.0', () => {
            console.log(`🚀 Server is running on port ${port}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        const shutdown = async () => {
            console.log("🛑 Shutting down server...");
            try {
                await closeDatabaseConnections();
                console.log("✅ Database connections closed");
            } catch (e) {
                console.error("❌ Error closing database connections:", e);
            }

            server.close(() => {
                console.log("✅ Server closed");
                process.exit(0);
            });

            setTimeout(() => {
                console.log("❌ Forced shutdown");
                process.exit(1);
            }, 10000);
        };

        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);

    } catch (err) {
        console.error('❌ Startup error:', err);
        process.exit(1);
    }
}

console.log("🎯 Starting server...");
startServer();
