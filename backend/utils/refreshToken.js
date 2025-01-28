import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN;

export const refreshAccessToken = (req, res) => {


  console.log('Cookies:', req.cookies);  
  const { refreshToken } = req.cookies; 
  console.log( refreshToken,' refreshToken from cookie');
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not provided.' });
  }

  try {
   
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    console.log( decoded,' refreshToken from cookie decoded');
   
    const accessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },  
      ACCESS_TOKEN_SECRET,  
      { expiresIn: '15m' }  
    );
    console.log( accessToken,' new accessToken caeted after expury');
    res.status(200).json({ accessToken });
  } catch (err) {
    console.error('Error refreshing access token:', err);
    res.status(403).json({ message: 'Invalid refresh token.' });
  }
};
