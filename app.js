import * as dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from 'cors';
import productsRoute from './routes/productsRoute.js';
import articlesRoute from './routes/articlesRoute.js';
import articleCommentsRoute from './routes/articleCommentsRoute.js';
import productCommentsRoute from './routes/productCommentsRoute.js';

const app = express();
app.use(express.json());       // JSON 요청 파싱 미들웨어

const corsOptions = {
  origin: [
    'http://127.0.0.1:3000', 
    'http://localhost:3000', 
    'https://buffso-pandamarket.vercel.app',
    'https://buffso-pandamarket.netlify.app']
}
app.use(cors(corsOptions));

// Content-Type 검사 미들웨어
app.use((req, res, next) => {
  // `PATCH`와 `POST` 요청에 대해 Content-Type을 검사
  if ((req.method === 'POST' || req.method === 'PATCH') && !req.is('application/json')) {
    return res.status(400).send({ message: 'Content-Type must be application/json' });
  }
  next();
});

app.use('/products', productsRoute);
app.use('/products', productCommentsRoute);
app.use('/articles', articlesRoute);
app.use('/articles', articleCommentsRoute);

app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

// 404 Not Found 처리
app.use((_, res) => {
  res.status(404).send({
    message: 'The resource you are looking for does not exist',
  });
});

app.listen(process.env.PORT || 3000, () => console.log('Server Started'));
