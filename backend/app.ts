import express from 'express';
import bodyParser from 'body-parser';
import authRouter from './routes/userRoute';
import projectRouter from './routes/projectRoutes';
import groupRouter from './routes/groupRoutes';
import cors from 'cors';

const app = express();

// CORS configuration for both environments
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || true
        : 'http://localhost:5173', // Vite dev server
    credentials: true
}));

app.use(bodyParser.json());
app.use('/login', authRouter);
app.use('/projects', projectRouter);
app.use('/groups', groupRouter);

export default app;
