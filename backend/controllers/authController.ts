import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../middleware/auth';
import { checkLogin } from '../services/userServices';

const JWT_SECRET = process.env.JWT_SECRET || "your_json_web_token_secret_key";

export class AuthController {
    static async login(req: Request, res: Response) {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        try {
            const isValid = await checkLogin(username, password);
            if (isValid) {
                const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '2h' });
                return res.status(200).json({
                    success: true,
                    token: token,
                    message: 'Login successful'
                });
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid login or password'
                });
            }
        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: err.message || 'Internal server error'
            });
        }
    }

    static async validateToken(req: AuthenticatedRequest, res: Response) {
        // Si nous arrivons ici, c'est que le token est valide (grâce au middleware)
        return res.status(200).json({
            success: true,
            message: 'Token is valid',
            user: req.user
        });
    }
}
