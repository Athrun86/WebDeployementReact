import express from 'express';
import bodyParser from 'body-parser';
import authRouter from './routes/userRoute';
import projectRouter from './routes/projectRoutes';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/login', authRouter);
app.use('/projects', projectRouter);
export default app;