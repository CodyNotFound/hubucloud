import { NextRequest } from 'next/server';

import { ResponseUtil } from '@/lib/response';
import { validateContact, parseContact } from '@/lib/parttime';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { contact } = body;

        if (!contact) {
            return ResponseUtil.clientError('联系方式不能为空');
        }

        const contactValidation = validateContact(contact);
        if (!contactValidation.isValid) {
            return ResponseUtil.clientError(contactValidation.error || '联系方式格式不正确', 400);
        }

        const parsed = parseContact(contact);
        return ResponseUtil.success(parsed);
    } catch (error) {
        return ResponseUtil.serverError('解析联系方式失败', error as Error);
    }
}
