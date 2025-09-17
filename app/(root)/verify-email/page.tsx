'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    const [isVerifying, setIsVerifying] = useState(!!token);

    useEffect(() => {
        async function handleVerifyAndSignIn() {
            if (token && !email) {
                try {
                    setIsVerifying(true);
                    const response = await fetch(`/api/auth/verify-email?token=${token}`, {
                        method: 'GET',
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Ошибка подтверждения email');
                    }

                    const redirectUrl = new URL(response.url);
                    const userEmail = redirectUrl.searchParams.get('email');
                    if (userEmail) {
                        router.push(`/verify-email?email=${encodeURIComponent(userEmail)}`);
                    } else {
                        throw new Error('Email не получен из ответа API');
                    }
                } catch (error) {
                    console.error('Error [VERIFY_EMAIL_TOKEN]', error);
                    // Приводим error к типу Error или используем безопасную проверку
                    const errorMessage = error instanceof Error ? error.message : 'Ошибка при подтверждении email';
                    toast.error(errorMessage, {
                        icon: '❌',
                        duration: 5000,
                        style: {
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #b91c1c',
                            padding: '16px',
                            borderRadius: '8px',
                        },
                    });
                    if (errorMessage === 'Токен истек') {
                        setTimeout(() => router.push('/resend-verification'), 3000);
                    }
                } finally {
                    setIsVerifying(false);
                }
            } else if (email) {
                try {
                    const response = await signIn('credentials', {
                        email,
                        password: '',
                        isVerifyEmail: 'true',
                        redirect: false,
                    });

                    console.log('SignIn response:', response);

                    if (response?.ok) {
                        toast.success('Email подтвержден и вход выполнен!', {
                            icon: '✅',
                            duration: 3000,
                            style: {
                                background: '#d1fae5',
                                color: '#065f46',
                                border: '1px solid #065f46',
                                padding: '16px',
                                borderRadius: '8px',
                            },
                        });
                        setTimeout(() => router.push('/'), 3000);
                    } else {
                        toast.error(response?.error || 'Ошибка авторизации', {
                            icon: '❌',
                            duration: 5000,
                            style: {
                                background: '#fee2e2',
                                color: '#b91c1c',
                                border: '1px solid #b91c1c',
                                padding: '16px',
                                borderRadius: '8px',
                            },
                        });
                    }
                } catch (error) {
                    console.error('Error [VERIFY_EMAIL_SIGNIN]', error);
                    const errorMessage = error instanceof Error ? error.message : 'Ошибка сервера';
                    toast.error(errorMessage, {
                        icon: '❌',
                        duration: 5000,
                        style: {
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #b91c1c',
                            padding: '16px',
                            borderRadius: '8px',
                        },
                    });
                }
            } else {
                toast.error('Неверные параметры запроса', {
                    icon: '❌',
                    duration: 5000,
                    style: {
                        background: '#fee2e2',
                        color: '#b91c1c',
                        border: '1px solid #b91c1c',
                        padding: '16px',
                        borderRadius: '8px',
                    },
                });
            }
        }

        handleVerifyAndSignIn();
    }, [email, token, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold">Подтверждение email</h1>
            <p className="text-gray-500 flex items-center gap-2">
                {isVerifying
                    ? 'Пожалуйста, подождите, мы подтверждаем ваш email...'
                    : 'Пожалуйста, подождите, мы выполняем вход...'}
                <Loader2 className="w-6 h-6 animate-spin" />
            </p>
        </div>
    );
}