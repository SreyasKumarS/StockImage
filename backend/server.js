import dotenv from 'dotenv';
const result = dotenv.config();
if (result.error) {
  console.error('Failed to load .env file:', result.error);
} else {
  console.log('Environment variables loaded successfully.');
}
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import connectDB from './config/db.js';
import {refreshAccessToken}  from './utils/refreshToken.js';

dotenv.config();

const app = express();


const corsOptions = {
  origin: [process.env.FRONTEND_URL], 
  credentials: true, 
};
console.log('Allowed Origin:', process.env.FRONTEND_URL);



app.use(cors(corsOptions)); 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json()); 
app.use(express.static('public'));



import userRoutes from './routes/userRoutes.js';
app.use('/users', userRoutes);
app.post('/refresh-token',refreshAccessToken );




connectDB();


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
