import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ message: 'Токен не предоставлен' }, { status: 400 });
    }

    try {
        const user = await prisma.user.findFirst({
            where: { verificationToken: token },
        });

        if (!user) {
            return NextResponse.json({ message: 'Неверный токен' }, { status: 404 });
        }

        if (user.emailVerified) {
            return NextResponse.json({ message: 'Email уже подтвержден' }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null, // Сбрасываем токен после подтверждения
            },
        });

        return NextResponse.json({ message: 'Email успешно подтвержден' });
    } catch (error) {
        console.error('Ошибка при подтверждении email:', error);
        return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
    }
}