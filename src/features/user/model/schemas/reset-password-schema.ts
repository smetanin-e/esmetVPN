import z from 'zod';
import { registerUserSchema } from './register-schema';

export const resetPasswordSchema = registerUserSchema
  .pick({
    password: true,
    confirmPassword: true,
  })
  .refine(
    (data) => {
      return data.password === data.confirmPassword;
    },
    {
      message: 'Пароли не совпадают',
      path: ['confirmPassword'],
    },
  );

export type ResetPasswordType = z.infer<typeof resetPasswordSchema>;
