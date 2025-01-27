import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();


const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN;




export const generateAccessToken = (user) => {

    return jwt.sign({ id: user._id, email: user.email }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};


export const generateRefreshToken = (user, res) => {
  const refreshToken = jwt.sign({ id: user._id, email: user.email }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

  res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      path: '/',  
  });
  console.log('Refresh token set:', refreshToken);
  return refreshToken;
};

