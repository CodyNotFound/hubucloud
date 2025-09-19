import type { JwtPayload } from 'jsonwebtoken';

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'hubucloud-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface UserTokenPayload {
    userId: string;
    username: string;
    role: 'USER' | 'ADMIN';
}

export class JWTUtil {
    static generateToken(payload: UserTokenPayload): string {
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
            issuer: 'hubucloud',
            audience: 'hubucloud-users',
        } as any);
    }

    static verifyToken(token: string): UserTokenPayload | null {
        try {
            const decoded = jwt.verify(token, JWT_SECRET, {
                issuer: 'hubucloud',
                audience: 'hubucloud-users',
            }) as JwtPayload;

            return {
                userId: decoded.userId,
                username: decoded.username,
                role: decoded.role,
            };
        } catch (_error) {
            return null;
        }
    }

    static extractTokenFromHeader(authHeader?: string): string | null {
        if (!authHeader) return null;

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null;
        }

        return parts[1];
    }
}
