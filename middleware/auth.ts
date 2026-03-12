import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export function getAuthToken(req: Request): string | null {
  // Check cookie first (for frontend)
  const cookieToken = req.cookies?.token;
  if (cookieToken) {
    return cookieToken;
  }

  // Fallback to header (for API clients)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function authenticateRequest(req: Request): JWTPayload {
  const token = getAuthToken(req);
  
  if (!token) {
    throw new Error('Authentication token required');
  }

  try {
    return verifyToken(token);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const user = authenticateRequest(req);
    
    if (user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error: any) {
    return res.status(401).json({ error: error.message || 'Authentication failed' });
  }
}
