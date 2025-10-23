'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Tabs, Tab } from '@heroui/tabs';
import { Eye, EyeOff, User, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Checkbox, Link } from '@heroui/react';

import { useAuth } from '@/hooks/useAuth';

export default function AuthPage() {
    const router = useRouter();
    const { login, register, isAuthenticated, isLoading, isInitialized } = useAuth();

    const [selectedTab, setSelectedTab] = useState('login');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPasswordMismatch, setShowPasswordMismatch] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
        null
    );

    // 用于标记是否正在登录/注册过程中，避免重复跳转
    const isLoginInProgress = useRef(false);

    // 登录表单状态
    const [loginForm, setLoginForm] = useState({
        username: '',
        password: '',
    });

    // 注册表单状态
    const [registerForm, setRegisterForm] = useState({
        username: '',
        password: '',
        confirmPassword: '',
    });

    // 页面初始化时检查登录状态，但只在认证状态已初始化且不在登录过程中时跳转
    useEffect(() => {
        if (isAuthenticated && isInitialized && !isLoginInProgress.current) {
            try {
                const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
                const redirectPath = userInfo.role === 'ADMIN' ? '/admin' : '/';
                console.log('🔄 检测到已登录状态，准备跳转到:', redirectPath);
                router.push(redirectPath);
            } catch (error) {
                console.error('解析用户信息失败:', error);
                router.push('/');
            }
        }
    }, [isAuthenticated, isInitialized, router]);

    // 清除消息
    const clearMessage = () => {
        setMessage(null);
    };

    // 显示消息
    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(clearMessage, 5000); // 5秒后自动清除
    };

    const handleLogin = async () => {
        clearMessage();

        // 表单验证
        if (!loginForm.username.trim()) {
            showMessage('error', '请输入用户名');
            return;
        }

        if (!loginForm.password.trim()) {
            showMessage('error', '请输入密码');
            return;
        }

        try {
            // 标记登录过程开始
            isLoginInProgress.current = true;

            const result = await login({
                user: loginForm.username.trim(),
                password: loginForm.password,
            });

            if (result.success) {
                showMessage('success', '登录成功！即将跳转...');
                // 登录成功后直接跳转，不等待状态更新
                const userRole = result.data?.user?.role;
                const redirectPath = userRole === 'ADMIN' ? '/admin' : '/';
                console.log('🚀 登录成功，用户角色:', userRole, '跳转路径:', redirectPath);
                // 立即跳转，避免与useEffect冲突
                router.push(redirectPath);
            } else {
                showMessage('error', result.error || '登录失败，请重试');
                // 登录失败，重置标记
                isLoginInProgress.current = false;
            }
        } catch (_error) {
            showMessage('error', '登录失败，请检查网络连接');
            // 登录失败，重置标记
            isLoginInProgress.current = false;
        }
    };

    const handleRegister = async () => {
        clearMessage();

        // 表单验证
        if (!registerForm.username.trim()) {
            showMessage('error', '请输入用户名');
            return;
        }

        if (registerForm.username.length < 3 || registerForm.username.length > 30) {
            showMessage('error', '用户名长度必须在3-30个字符之间');
            return;
        }

        if (!registerForm.password.trim()) {
            showMessage('error', '请输入密码');
            return;
        }

        if (registerForm.password.length < 6) {
            showMessage('error', '密码长度至少6位');
            return;
        }

        if (registerForm.password !== registerForm.confirmPassword) {
            showMessage('error', '两次输入的密码不一致');
            return;
        }

        try {
            // 标记注册过程开始
            isLoginInProgress.current = true;

            const result = await register({
                user: registerForm.username.trim(),
                password: registerForm.password,
            });

            if (result.success) {
                showMessage('success', '注册成功！即将跳转...');
                // 注册成功后新用户默认是普通用户，直接跳转到主页
                router.push('/');
            } else {
                showMessage('error', result.error || '注册失败，请重试');
                // 注册失败，重置标记
                isLoginInProgress.current = false;
            }
        } catch (_error) {
            showMessage('error', '注册失败，请检查网络连接');
            // 注册失败，重置标记
            isLoginInProgress.current = false;
        }
    };

    return (
        <>
            <section className="w-full py-2 flex items-center justify-center min-h-full">
                <Card className="w-full max-w-sm">
                    <CardHeader className="flex flex-col items-center space-y-1 pb-2">
                        <h2 className="text-2xl font-bold text-center">湖大萧云</h2>
                        <p className="text-sm text-default-600 text-center">湖北大学校园服务平台</p>
                    </CardHeader>

                    {/* 消息提示 */}
                    {message && (
                        <div
                            className={`mx-6 mb-4 p-3 rounded-lg flex items-center gap-2 ${
                                message.type === 'error'
                                    ? 'bg-danger-50 border border-danger-200 text-danger-700'
                                    : 'bg-success-50 border border-success-200 text-success-700'
                            }`}
                        >
                            {message.type === 'error' ? (
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            ) : (
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            )}
                            <span className="text-sm">{message.text}</span>
                        </div>
                    )}

                    <CardBody>
                        <Tabs
                            selectedKey={selectedTab}
                            onSelectionChange={(key) => setSelectedTab(key as string)}
                            className="w-full"
                            classNames={{
                                tabList: 'grid w-full grid-cols-2',
                            }}
                        >
                            <Tab key="login" title="登录">
                                <div className="space-y-4 py-2">
                                    <Input
                                        type="text"
                                        label="用户名"
                                        placeholder="请输入用户名"
                                        value={loginForm.username}
                                        onChange={(e) =>
                                            setLoginForm({ ...loginForm, username: e.target.value })
                                        }
                                        startContent={<User className="w-4 h-4 text-default-400" />}
                                        variant="bordered"
                                    />

                                    <Input
                                        type={isPasswordVisible ? 'text' : 'password'}
                                        label="密码"
                                        placeholder="请输入密码"
                                        value={loginForm.password}
                                        onChange={(e) =>
                                            setLoginForm({ ...loginForm, password: e.target.value })
                                        }
                                        startContent={<Lock className="w-4 h-4 text-default-400" />}
                                        endContent={
                                            <button
                                                className="focus:outline-none"
                                                type="button"
                                                onClick={() =>
                                                    setIsPasswordVisible(!isPasswordVisible)
                                                }
                                            >
                                                {isPasswordVisible ? (
                                                    <EyeOff className="w-4 h-4 text-default-400" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-default-400" />
                                                )}
                                            </button>
                                        }
                                        variant="bordered"
                                    />

                                    <div className="flex items-center justify-between">
                                        <Checkbox
                                            isSelected={rememberMe}
                                            onValueChange={setRememberMe}
                                            size="sm"
                                        >
                                            记住我
                                        </Checkbox>
                                        <Link href="#" size="sm" className="text-primary">
                                            忘记密码？
                                        </Link>
                                    </div>

                                    <Button
                                        color="primary"
                                        size="lg"
                                        className="w-full"
                                        onPress={handleLogin}
                                        isLoading={isLoading}
                                        isDisabled={!loginForm.username || !loginForm.password}
                                    >
                                        登录
                                    </Button>
                                </div>
                            </Tab>

                            <Tab key="register" title="注册">
                                <div className="space-y-4 py-2">
                                    <Input
                                        type="text"
                                        label="用户名"
                                        placeholder="请输入用户名"
                                        value={registerForm.username}
                                        onChange={(e) =>
                                            setRegisterForm({
                                                ...registerForm,
                                                username: e.target.value,
                                            })
                                        }
                                        startContent={<User className="w-4 h-4 text-default-400" />}
                                        variant="bordered"
                                        description="用户名用于登录，3-30个字符"
                                    />

                                    <Input
                                        type={isPasswordVisible ? 'text' : 'password'}
                                        label="密码"
                                        placeholder="请输入密码"
                                        value={registerForm.password}
                                        onChange={(e) =>
                                            setRegisterForm({
                                                ...registerForm,
                                                password: e.target.value,
                                            })
                                        }
                                        startContent={<Lock className="w-4 h-4 text-default-400" />}
                                        endContent={
                                            <button
                                                className="focus:outline-none"
                                                type="button"
                                                onClick={() =>
                                                    setIsPasswordVisible(!isPasswordVisible)
                                                }
                                            >
                                                {isPasswordVisible ? (
                                                    <EyeOff className="w-4 h-4 text-default-400" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-default-400" />
                                                )}
                                            </button>
                                        }
                                        variant="bordered"
                                        description="密码至少6位字符"
                                    />

                                    <Input
                                        type={isConfirmPasswordVisible ? 'text' : 'password'}
                                        label="确认密码"
                                        placeholder="请再次输入密码"
                                        value={registerForm.confirmPassword}
                                        onChange={(e) => {
                                            setRegisterForm({
                                                ...registerForm,
                                                confirmPassword: e.target.value,
                                            });
                                            // 用户输入时隐藏错误提示
                                            if (showPasswordMismatch) {
                                                setShowPasswordMismatch(false);
                                            }
                                        }}
                                        onBlur={() => {
                                            // 只有在失去焦点时才检查密码匹配
                                            if (
                                                registerForm.confirmPassword.length > 0 &&
                                                registerForm.password.length > 0 &&
                                                registerForm.password !==
                                                    registerForm.confirmPassword
                                            ) {
                                                setShowPasswordMismatch(true);
                                            } else {
                                                setShowPasswordMismatch(false);
                                            }
                                        }}
                                        startContent={<Lock className="w-4 h-4 text-default-400" />}
                                        endContent={
                                            <button
                                                className="focus:outline-none"
                                                type="button"
                                                onClick={() =>
                                                    setIsConfirmPasswordVisible(
                                                        !isConfirmPasswordVisible
                                                    )
                                                }
                                            >
                                                {isConfirmPasswordVisible ? (
                                                    <EyeOff className="w-4 h-4 text-default-400" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-default-400" />
                                                )}
                                            </button>
                                        }
                                        variant="bordered"
                                        color={
                                            showPasswordMismatch
                                                ? 'danger'
                                                : registerForm.confirmPassword.length > 0 &&
                                                    registerForm.password.length > 0 &&
                                                    registerForm.password ===
                                                        registerForm.confirmPassword
                                                  ? 'success'
                                                  : 'default'
                                        }
                                        description={
                                            showPasswordMismatch
                                                ? '两次输入的密码不一致'
                                                : registerForm.confirmPassword.length > 0 &&
                                                    registerForm.password.length > 0 &&
                                                    registerForm.password ===
                                                        registerForm.confirmPassword
                                                  ? '密码匹配'
                                                  : ''
                                        }
                                    />

                                    <Button
                                        color="primary"
                                        size="lg"
                                        className="w-full"
                                        onPress={handleRegister}
                                        isLoading={isLoading}
                                        isDisabled={
                                            !registerForm.username ||
                                            !registerForm.password ||
                                            !registerForm.confirmPassword ||
                                            registerForm.password !== registerForm.confirmPassword
                                        }
                                    >
                                        注册
                                    </Button>
                                </div>
                            </Tab>
                        </Tabs>
                    </CardBody>
                </Card>
            </section>
        </>
    );
}
