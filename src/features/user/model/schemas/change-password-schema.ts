import z from 'zod';

import { passwordSchema } from '@/shared/lib/validation';
import { registerUserSchema } from './register-schema';

export const changePasswordSchema = registerUserSchema
  .pick({
    password: true,
    confirmPassword: true,
  })
  .extend({ currentPassword: passwordSchema })
  .refine(
    (data) => {
      return data.password === data.confirmPassword;
    },
    {
      message: 'Пароли не совпадают',
      path: ['confirmPassword'],
    },
  )
  .refine((data) => data.password !== data.currentPassword, {
    message: 'Новый пароль не должен совпадать с текущим',
    path: ['password'], // указываем, где показать ошибку
  });

export type ChangePasswordType = z.infer<typeof changePasswordSchema>;
