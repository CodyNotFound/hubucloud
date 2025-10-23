import { useState, useEffect } from 'react';

import { adminService } from '@/services/admin';

export interface AdminUser {
    id: string;
    username: string;
    role: string;
}

export interface AdminStats {
    totalUsers: number;
    totalAdmins: number;
    regularUsers: number;
    totalRestaurants: number;
    totalParttime: number;
}

export interface UseAdminReturn {
    isAdmin: boolean;
    user: AdminUser | null;
    isLoading: boolean;
    error: string | null;
    adminStats: AdminStats | null;
    checkAdminRole: () => Promise<void>;
    getAdminStats: () => Promise<void>;
    logout: () => void;
}

/**
 * 管理员权限验证Hook
 * 提供管理员状态检查和权限验证功能
 */
export const useAdmin = (): UseAdminReturn => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [user, setUser] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

    const checkAdminRole = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('auth_token');
            if (!token) {
                setIsAdmin(false);
                setUser(null);
                setError('未登录');
                return;
            }

            // 先从localStorage获取用户信息，检查角色
            const userInfoStr = localStorage.getItem('user_info');
            const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {};

            if (userInfo.role === 'ADMIN') {
                // 只有当用户角色是ADMIN时，才调用管理员API验证
                const response = await adminService.checkAdminRole();

                if (response.status === 'success' && response.data) {
                    setIsAdmin(response.data.isAdmin);
                    setUser(response.data.user);
                    setError(null);
                } else {
                    // 权限验证失败，清除登录信息
                    setIsAdmin(false);
                    setUser(null);
                    setError(response.message || '权限验证失败');
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_info');
                }
            } else {
                // 普通用户尝试访问管理员页面，清除登录信息
                setIsAdmin(false);
                setUser(null);
                setError('权限不足，需要管理员权限');
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_info');
            }
        } catch (err: any) {
            setIsAdmin(false);
            setUser(null);

            // 处理具体错误类型
            if (err.status === 401) {
                setError('登录已过期，请重新登录');
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_info');
            } else if (err.status === 403) {
                setError('权限不足，需要管理员权限');
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_info');
            } else {
                setError(err.message || '权限验证失败');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getAdminStats = async () => {
        // 如果已经有统计数据，不重复请求
        if (adminStats) {
            return;
        }

        try {
            const response = await adminService.getAdminStats();
            if (response.status === 'success' && response.data) {
                setAdminStats(response.data.stats);
            }
        } catch (error) {
            console.error('获取统计数据失败:', error);
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setIsAdmin(false);
        setUser(null);
        setError(null);
        setAdminStats(null);
        // 跳转到登录页或首页
        window.location.href = '/';
    };

    // 组件挂载时检查管理员状态
    useEffect(() => {
        checkAdminRole();
        // 延迟获取统计数据，避免重复请求
        const timer = setTimeout(() => {
            if (!adminStats) {
                getAdminStats();
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return {
        isAdmin,
        user,
        isLoading,
        error,
        adminStats,
        checkAdminRole,
        getAdminStats,
        logout,
    };
};

/**
 * 管理员权限保护Hook
 * 用于保护需要管理员权限的页面或组件
 */
export const useAdminGuard = () => {
    const { isAdmin, isLoading, error, checkAdminRole } = useAdmin();

    useEffect(() => {
        if (!isLoading && !isAdmin) {
            // 如果不是管理员，重定向到首页或显示错误
            console.warn('Access denied: Admin permission required');
            // 可以在这里添加重定向逻辑
            // router.push('/');
        }
    }, [isAdmin, isLoading]);

    return {
        isAdmin,
        isLoading,
        error,
        checkAdminRole,
        // 便于在组件中使用的权限检查函数
        hasAccess: isAdmin && !isLoading,
        accessDenied: !isLoading && !isAdmin,
    };
};
