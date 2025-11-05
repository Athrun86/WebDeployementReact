import { Octokit } from "octokit";
import dotenv from "dotenv";
import app from "./app";
import { sequelize, testConnection } from "./db/sequelizeInstance";

dotenv.config();

const port = Number(process.env.PORT ?? 3000);



const octogit = new Octokit({
    auth: "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"
});


async function startServer() {
    try {
        await testConnection();
        await sequelize.authenticate();
        await sequelize.sync();
        console.log("Database connected and synchronized.");
        const server = app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
         const shutdown = async () => {
             console.log("Shutting down server...");
             try  { await sequelize.close();  } catch (e) { console.error("Error closing database connection:", e); }
                 server.close(() => process.exit(0));
                 setTimeout(() => process.exit(1), 10000);

         };
         process.on("SIGINT", shutdown);
            process.on("SIGTERM", shutdown);

    } catch (err) {
        console.error('startup error',err);
        process.exit(1);
    }
}
console.log("Starting server...");
startServer();
