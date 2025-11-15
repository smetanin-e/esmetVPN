import { PaymentFormType } from '@/features/transaction/model/payment-schema';
import { serverAxiosInstance } from '@/shared/service/instance';

type TransactionResponse = string;

export const transactionApi = {
  async payment(data: PaymentFormType) {
    try {
      return (
        await serverAxiosInstance.post<TransactionResponse>('/api/transaction', data, {
          headers: {
            Authorization: `Bearer ${process.env.INTERNAL_API_TOKEN}`,
          },
        })
      ).data;
    } catch (error) {
      console.error('[transactionApi.payment] Ошибка при создании платежа:', error);
      throw error;
    }
  },
};
