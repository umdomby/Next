'use server';
import {prisma} from '@/prisma/prisma-client';
import {getUserSession} from '@/components/lib/get-user-session';
import {Prisma} from '@prisma/client';
import {hashSync} from 'bcrypt';
import * as z from 'zod'
import { revalidatePath } from 'next/cache';
import nodemailer from "nodemailer";


export async function updateUserInfo(body: Prisma.UserUpdateInput) {
    try {
        const currentUser = await getUserSession();

        if (!currentUser) {
            throw new Error('Пользователь не найден');
        }

        const findUser = await prisma.user.findFirst({
            where: {
                id: Number(currentUser.id),
            },
        });

        if (!findUser) {
            throw new Error('Пользователь не найден в базе данных');
        }

        await prisma.user.update({
            where: {
                id: Number(currentUser.id),
            },
            data: {
                fullName: body.fullName,
                password: body.password ? hashSync(body.password as string, 10) : findUser.password,
            },
        });
        revalidatePath('/profile');
    } catch (err) {
        throw err;
    }
} // Функция для обновления информации о пользователе

export async function registerUser(body: Prisma.UserCreateInput) {
    try {
        const user = await prisma.user.findFirst({
            where: {
                email: body.email,
            },
        });

        if (user) {
            throw new Error('Пользователь уже существует');
        }

        // Генерация токена для подтверждения email
        const verificationToken = Math.random().toString(36).substr(2);

        // Создание пользователя с токеном подтверждения
        await prisma.user.create({
            data: {
                fullName: body.fullName,
                email: body.email,
                password: hashSync(body.password, 10),
                verificationToken,
                emailVerified: false,
            },
        });

        // Настройка и отправка письма
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Heroes3" <${process.env.EMAIL_USER}>`,
            to: body.email,
            subject: 'Подтверждение регистрации',
            text: `Перейдите по ссылке для подтверждения вашего email: ${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`,
        };

        await transporter.sendMail(mailOptions);

    } catch (err) {
        console.error('Error [CREATE_USER]', err);
        throw err;
    }
}
