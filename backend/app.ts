import express from 'express';
import bodyParser from 'body-parser';
import authRouter from './routes/userRoute';
import projectRouter from './routes/projectRoutes';
import groupRouter from './routes/groupRoutes';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/login', authRouter);
app.use('/projects', projectRouter);
app.use('/groups', groupRouter);
export default app;