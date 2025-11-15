import { prisma } from '@/shared/lib/prisma';
import { TransactionTopUp } from '../model/types';
import { OrderStatus, Prisma, PrismaClient, TransactionType } from '@prisma/client';

export const transactionRepository = {
  async getAll(take?: number, skip?: number) {
    return prisma.transaction.findMany({
      where: {},
      include: { user: { select: { login: true, role: true } } },
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });
  },

  async getByUserId(userId: number, take?: number, skip?: number) {
    return prisma.transaction.findMany({
      where: { userId },
      include: { user: { select: { login: true, role: true } } },
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });
  },
  async findById(id: number) {
    return prisma.transaction.findFirst({ where: { id } });
  },
  async createTopUp(data: TransactionTopUp) {
    return prisma.transaction.create({
      data: {
        userId: data.userId,
        description: data.description,
        type: TransactionType.TOP_UP,
        amount: data.amount,
      },
    });
  },

  async addPaymentUrl(id: number, paymentUrl: string) {
    return prisma.transaction.update({
      where: { id },
      data: {
        paymentUrl,
      },
    });
  },

  async updateAfterPayment(transactionId: number, status: OrderStatus, paymentId: string) {
    return prisma.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        status,
        paymentId: paymentId,
      },
    });
  },

  async createCharge<T extends PrismaClient | Prisma.TransactionClient>(
    client: T,
    userId: number,
    amount: number,
    description: string,
  ) {
    return client.transaction.create({
      data: {
        userId,
        amount,
        description,
        type: TransactionType.CHARGE,
        status: OrderStatus.SUCCEEDED,
      },
    });
  },
};
