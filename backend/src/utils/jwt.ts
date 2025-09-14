import type { JwtPayload } from 'jsonwebtoken';

import jwt from 'jsonwebtoken';

// JWT密钥，实际项目中应该从环境变量读取
const JWT_SECRET = process.env.JWT_SECRET || 'hubucloud-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface UserTokenPayload {
    userId: string;
    username: string;
    role: 'USER' | 'ADMIN';
}

export class JWTUtil {
    /**
     * 生成JWT token
     */
    static generateToken(payload: UserTokenPayload): string {
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
            issuer: 'hubucloud',
            audience: 'hubucloud-users',
        });
    }

    /**
     * 验证JWT token
     */
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
        } catch (error) {
            return null;
        }
    }

    /**
     * 解码JWT token（不验证签名）
     */
    static decodeToken(token: string): UserTokenPayload | null {
        try {
            const decoded = jwt.decode(token) as JwtPayload;
            if (!decoded) return null;

            return {
                userId: decoded.userId,
                username: decoded.username,
                role: decoded.role,
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * 刷新token
     */
    static refreshToken(token: string): string | null {
        const payload = this.verifyToken(token);
        if (!payload) return null;

        return this.generateToken(payload);
    }

    /**
     * 从请求头中提取token
     */
    static extractTokenFromHeader(authHeader?: string): string | null {
        if (!authHeader) return null;

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null;
        }

        return parts[1];
    }
}
