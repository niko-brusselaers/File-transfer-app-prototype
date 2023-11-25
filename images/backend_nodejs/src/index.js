import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors'
import express from 'express';
import router from './services/expressService.js';
import webSocketService from './services/webSocketService.js';

dotenv.config();
const port = process.env.EXPRESS_PORT;
const webSocketPort = process.env.WEBSOCKET_PORT;

const app = express();
app.use(cors())
webSocketService(webSocketPort);

app.listen(port, () => {
  console.log(`Express Server is running on http://localhost:${port}`);
});

app.use('/', router);

export default app;