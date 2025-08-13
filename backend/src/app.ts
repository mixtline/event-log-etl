import express from 'express';
import eventsRouter from './routes';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: ['http://localhost:3000'],
  // credentials: true,
}));
app.use(express.json());
app.use('/events', eventsRouter);

export default app;
