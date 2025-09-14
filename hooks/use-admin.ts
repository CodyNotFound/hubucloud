import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin';

export interface AdminUser {
    id: string;
    username: string;
    role: string;
}

export interface UseAdminReturn {
    isAdmin: boolean;
    user: AdminUser | null;
    loading: boolean;
    error: string | null;
    checkAdminStatus: () => Promise<void>;
    logout: () => void;
}

/**
 * 管理员权限验证Hook
 * 提供管理员状态检查和权限验证功能
 */
export const useAdmin = (): UseAdminReturn => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const checkAdminStatus = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                setIsAdmin(false);
                setUser(null);
                setError('未登录');
                return;
            }

            const response = await adminService.checkAdminRole();

            if (response.status === 'success' && response.data) {
                setIsAdmin(response.data.isAdmin);
                setUser(response.data.user);
                setError(null);
            } else {
                setIsAdmin(false);
                setUser(null);
                setError(response.message || '权限验证失败');
            }
        } catch (err: any) {
            setIsAdmin(false);
            setUser(null);

            // 处理具体错误类型
            if (err.status === 401) {
                setError('请先登录');
                localStorage.removeItem('token');
            } else if (err.status === 403) {
                setError('权限不足，需要管理员权限');
            } else {
                setError(err.message || '权限验证失败');
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAdmin(false);
        setUser(null);
        setError(null);
        // 跳转到登录页或首页
        window.location.href = '/';
    };

    // 组件挂载时检查管理员状态
    useEffect(() => {
        checkAdminStatus();
    }, []);

    return {
        isAdmin,
        user,
        loading,
        error,
        checkAdminStatus,
        logout,
    };
};

/**
 * 管理员权限保护Hook
 * 用于保护需要管理员权限的页面或组件
 */
export const useAdminGuard = () => {
    const { isAdmin, loading, error, checkAdminStatus } = useAdmin();

    useEffect(() => {
        if (!loading && !isAdmin) {
            // 如果不是管理员，重定向到首页或显示错误
            console.warn('Access denied: Admin permission required');
            // 可以在这里添加重定向逻辑
            // router.push('/');
        }
    }, [isAdmin, loading]);

    return {
        isAdmin,
        loading,
        error,
        checkAdminStatus,
        // 便于在组件中使用的权限检查函数
        hasAccess: isAdmin && !loading,
        accessDenied: !loading && !isAdmin,
    };
};