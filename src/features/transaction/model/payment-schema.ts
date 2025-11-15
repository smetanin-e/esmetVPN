import z from 'zod';

export const paymentSchema = z.object({
  amount: z
    .string()
    .regex(/^[1-9][0-9]*$/, {
      message: 'Введите корректные данные',
    })
    .refine((val) => Number(val) >= 10, {
      message: 'Сумма должна быть не меньше 10',
    }),
});
export type PaymentFormType = z.infer<typeof paymentSchema>;
