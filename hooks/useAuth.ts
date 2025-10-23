'use client';

import type { User } from '@/types';

import { useState, useEffect, useCallback } from 'react';

import { auth, TokenManager } from '@/utils/api';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isInitialized: boolean;
}

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        token: null,
        isLoading: false,
        isInitialized: false,
    });

    // 初始化认证状态
    useEffect(() => {
        const initializeAuth = async () => {
            console.log('🔄 初始化认证状态...');
            const token = TokenManager.getToken();
            const cachedUserInfo = TokenManager.getUserInfo();
            console.log('📱 从localStorage获取token:', token ? '存在' : '不存在');
            console.log('👤 从localStorage获取用户信息:', cachedUserInfo ? '存在' : '不存在');

            if (token) {
                if (cachedUserInfo) {
                    // 使用缓存的用户信息，无需调用API
                    console.log('💾 使用缓存的用户信息:', cachedUserInfo);
                    setAuthState({
                        user: cachedUserInfo as User,
                        token,
                        isLoading: false,
                        isInitialized: true,
                    });
                } else {
                    // 没有缓存，调用API获取用户信息
                    try {
                        console.log('🔍 缓存不存在，验证token并获取用户信息...');
                        const response = await auth.getCurrentUser();
                        console.log('📡 getCurrentUser响应:', response);

                        if (response.status === 'success' && response.data) {
                            console.log('✅ 用户信息获取成功:', response.data);
                            // 缓存用户信息
                            TokenManager.setUserInfo(response.data);
                            setAuthState({
                                user: response.data as User,
                                token,
                                isLoading: false,
                                isInitialized: true,
                            });
                        } else {
                            throw new Error('获取用户信息失败');
                        }
                    } catch (error) {
                        console.error('❌ Token验证失败:', error);
                        // token无效，清除本地存储
                        TokenManager.clearTokens();
                        setAuthState({
                            user: null,
                            token: null,
                            isLoading: false,
                            isInitialized: true,
                        });
                    }
                }
            } else {
                console.log('📝 无token，设置为未登录状态');
                setAuthState((prev) => ({
                    ...prev,
                    isInitialized: true,
                }));
            }
        };

        initializeAuth();
    }, []);

    // 登录函数
    const login = useCallback(async (credentials: { user: string; password: string }) => {
        console.log('🚀 开始登录流程...');
        setAuthState((prev) => ({ ...prev, isLoading: true }));

        try {
            // 转换参数格式以匹配API期望
            console.log('📤 发送登录请求...');
            const response = await auth.login({
                username: credentials.user,
                password: credentials.password,
            });

            console.log('📨 登录响应:', response);

            if (response.status === 'success' && response.data) {
                console.log('✅ 登录成功，更新状态...');
                console.log('👤 用户信息:', response.data.user);
                console.log('🎟️ Token:', response.data.token ? '已获取' : '未获取');

                // 验证token和用户信息是否已存储到localStorage
                const storedToken = TokenManager.getToken();
                const storedUserInfo = TokenManager.getUserInfo();
                console.log('💾 存储到localStorage的token:', storedToken ? '存在' : '不存在');
                console.log('💾 存储到localStorage的用户信息:', storedUserInfo ? '存在' : '不存在');

                setAuthState({
                    user: response.data.user,
                    token: response.data.token,
                    isLoading: false,
                    isInitialized: true,
                });

                return { success: true, data: response.data };
            } else {
                throw new Error(response.error || '登录失败');
            }
        } catch (error) {
            console.error('❌ 登录失败:', error);
            setAuthState((prev) => ({ ...prev, isLoading: false }));

            return {
                success: false,
                error: error instanceof Error ? error.message : '登录失败，请重试',
            };
        }
    }, []);

    // 注册函数
    const register = useCallback(async (userData: { user: string; password: string }) => {
        setAuthState((prev) => ({ ...prev, isLoading: true }));

        try {
            const response = await auth.register(userData);

            if (response.status === 'success' && response.data) {
                setAuthState({
                    user: response.data.user,
                    token: response.data.token,
                    isLoading: false,
                    isInitialized: true,
                });

                return { success: true, data: response.data };
            } else {
                throw new Error(response.error || '注册失败');
            }
        } catch (error) {
            setAuthState((prev) => ({ ...prev, isLoading: false }));

            return {
                success: false,
                error: error instanceof Error ? error.message : '注册失败，请重试',
            };
        }
    }, []);

    // 登出函数
    const logout = useCallback(async () => {
        try {
            await auth.logout();
        } catch (error) {
            console.error('登出API调用失败:', error);
        } finally {
            setAuthState({
                user: null,
                token: null,
                isLoading: false,
                isInitialized: true,
            });
        }
    }, []);

    // 刷新用户信息
    const refreshUser = useCallback(async () => {
        if (!authState.token) return { success: false, error: '未登录' };

        try {
            const response = await auth.getCurrentUser();
            if (response.status === 'success' && response.data) {
                setAuthState((prev) => ({
                    ...prev,
                    user: response.data as User,
                }));

                return { success: true, data: response.data };
            } else {
                throw new Error(response.error || '获取用户信息失败');
            }
        } catch (error) {
            // 如果刷新失败，可能token已过期
            logout();

            return {
                success: false,
                error: error instanceof Error ? error.message : '获取用户信息失败',
            };
        }
    }, [authState.token, logout]);

    return {
        // 状态
        user: authState.user,
        token: authState.token,
        isLoading: authState.isLoading,
        isInitialized: authState.isInitialized,
        isAuthenticated: !!authState.user && !!authState.token,

        // 方法
        login,
        register,
        logout,
        refreshUser,
    };
}
