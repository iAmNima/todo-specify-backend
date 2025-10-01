import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log(`🔐 Auth middleware: ${req.method} ${req.path}`);
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('❌ No token provided');
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    console.log('🔍 Verifying token...');
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 50) + '...');
    const decoded = AuthService.verifyToken(token);
    console.log('✅ Token decoded:', { userId: decoded.userId });
    console.log('✅ Token decoded:', { userId: decoded.userId });

    const user = await AuthService.getUserById(decoded.userId);

    if (!user) {
      console.log('❌ User not found for token');
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    console.log('✅ User authenticated:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error);
    res.status(403).json({ error: 'Invalid token' });
  }
};