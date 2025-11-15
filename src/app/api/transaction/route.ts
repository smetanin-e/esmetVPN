import { TransactionTopUp } from '@/entities/transaction/model/types';
import { transactionRepository } from '@/entities/transaction/repository/transaction-repository';
import { createPayment } from '@/entities/transaction/services/create-payment';
import { PaymentFormType } from '@/features/transaction/model/payment-schema';
import { getUserSession } from '@/features/user/actions/get-user-session';
import { validateApiToken } from '@/shared/lib/validate-api-token';
import { TransactionType, UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user) {
      return NextResponse.json({ message: 'Пользователь не авторизован' }, { status: 401 });
    }

    const data = (await req.json()) as PaymentFormType;
    if (!data) {
      return NextResponse.json({ message: 'Невалидные данные' }, { status: 400 });
    }
    const amount = Number(data.amount);

    const payload: TransactionTopUp = {
      userId: user.id,
      amount,
      description: `Пополнение баланса на ${amount} ₽ от ${new Date()}`,
      type: TransactionType.TOP_UP,
    };

    const transaction = await transactionRepository.createTopUp(payload);

    const paymentData = await createPayment({
      amount,
      transactionId: transaction.id,
      description: `ESMET-VPN: Пополнение баланса на ${amount} для пользователя ${user.login}`,
    });

    if (!paymentData) {
      return NextResponse.json({ message: 'Данные для оплаты невалидны' }, { status: 500 });
    }

    //ссылка которая перенаправит нас на платеж
    const paymentUrl = paymentData.confirmation.confirmation_url;

    await transactionRepository.addPaymentUrl(transaction.id, paymentUrl);

    return NextResponse.json(paymentUrl);
  } catch (error) {
    console.error('[API_POST_TRANSACTION] Server error', error);
    return NextResponse.json({ message: 'Ошибка сервера при создании платежа' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!validateApiToken(req)) {
      return NextResponse.json({ error: 'Ошибка авторизации' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const take = searchParams.get('take') ? parseInt(searchParams.get('take')!, 10) : undefined;
    const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!, 10) : undefined;

    const user = await getUserSession();
    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 401 });
    }

    if (user.role !== UserRole.ADMIN) {
      const transactions = await transactionRepository.getByUserId(user.id, take, skip);
      return NextResponse.json(transactions);
    }

    const transactions = await transactionRepository.getAll(take, skip);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('[API_GET_TRANSACTION] Server error', error);
    return NextResponse.json(
      { message: 'Ошибка сервера при получении списка транзакций' },
      { status: 500 },
    );
  }
}
