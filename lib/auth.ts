import { NextRequest } from 'next/server';

import { JWTUtil, UserTokenPayload } from './jwt';
import { db } from './db';

export async function authenticateRequest(request: NextRequest): Promise<UserTokenPayload | null> {
    const authHeader = request.headers.get('authorization');
    const token = JWTUtil.extractTokenFromHeader(authHeader || '');

    if (!token) {
        return null;
    }

    return JWTUtil.verifyToken(token);
}

export async function requireAuth(request: NextRequest): Promise<UserTokenPayload> {
    const user = await authenticateRequest(request);
    if (!user) {
        throw new Error('UNAUTHORIZED');
    }
    return user;
}

export async function requireAdmin(request: NextRequest): Promise<UserTokenPayload> {
    const user = await requireAuth(request);

    const dbUser = await db.user.findUnique({
        where: { id: user.userId },
        select: { role: true },
    });

    if (!dbUser || dbUser.role !== 'ADMIN') {
        throw new Error('FORBIDDEN');
    }

    return user;
}
