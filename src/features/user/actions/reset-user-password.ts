'use server';

import { userRepository } from '@/entities/user/repository/user-repository';
import { ResetPasswordType } from '../model/schemas/reset-password-schema';
import { generateSalt, hashPassword } from '@/shared/lib/auth/password-utils';

import { UserRole } from '@prisma/client';
import { getUserSession } from './get-user-session';

export const resetUserPasswordAction = async (userId: number, formData: ResetPasswordType) => {
  try {
    const admin = await getUserSession();
    if (!admin || !admin.status || admin.role !== UserRole.ADMIN) {
      return { success: false, message: 'У вас нет прав на удаление пользователя' };
    }
    const user = await userRepository.findUserByIdWithPassword(userId);
    if (!user) {
      return { success: false, message: 'Пользователь не найден' };
    }

    const salt = generateSalt();
    const hashedPassword = await hashPassword(formData.password, salt);

    await userRepository.updatePassword(user.id, hashedPassword, salt);

    return { success: true };
  } catch (error) {
    console.error('[RESET_USER_PASSWORD] Server error', error);
    return { success: false, message: 'Ошибка сброса пароля пользователя' };
  }
};
