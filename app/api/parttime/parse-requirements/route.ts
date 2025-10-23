import { NextRequest } from 'next/server';

import { ResponseUtil } from '@/lib/response';
import { validateRequirements, parseGenderRequirement } from '@/lib/parttime';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { requirements } = body;

        if (requirements) {
            const requirementsValidation = validateRequirements(requirements);
            if (!requirementsValidation.isValid) {
                return ResponseUtil.clientError(
                    requirementsValidation.error || '要求字段格式不正确',
                    400
                );
            }
        }

        const parsed = parseGenderRequirement(requirements);
        return ResponseUtil.success(parsed);
    } catch (error) {
        return ResponseUtil.serverError('解析要求字段失败', error as Error);
    }
}
