import { NextRequest } from 'next/server';

import { ResponseUtil } from '@/lib/response';

export async function POST(_request: NextRequest) {
    // 注册接口已关闭
    return ResponseUtil.clientError('注册功能暂时关闭', 403);
}
