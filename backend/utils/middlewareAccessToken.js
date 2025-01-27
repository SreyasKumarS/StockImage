import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN;

// Middleware to verify the access token
export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if the Authorization header exists
    if (!authHeader) {
        return res.status(401).json({ message: 'Access token not provided.' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token from "Bearer <token>"
    console.log('enetred acess token verification middleware');
    // Verify the token
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification failed:', err);
            return res.status(401).json({ message: 'Access token expired or invalid.' });
        }

        req.user = user; // Attach the decoded token payload to the request object
        next(); // Proceed to the next middleware or route
    });
};
