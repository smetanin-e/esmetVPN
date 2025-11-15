import { prisma } from '@/shared/lib/prisma';

export const userSubscriptionRepository = {
  async findById(id: number) {
    return prisma.userSubscription.findFirst({
      where: { id },
    });
  },

  async findByUserId(userId: number) {
    return prisma.userSubscription.findFirst({ where: { userId } });
  },
  async findByUserIdWithPlan(userId: number) {
    return prisma.userSubscription.findFirst({
      where: { userId },
      include: { subscriptionPlan: true },
    });
  },

  async findActiveWithPlan() {
    return prisma.userSubscription.findMany({
      where: { status: true },
      include: { subscriptionPlan: true },
    });
  },

  async createUserSubscription(userId: number, planId: number) {
    return prisma.userSubscription.create({
      data: {
        userId,
        subscriptionPlanId: planId,
      },
    });
  },

  async updateById(id: number, data: object) {
    return prisma.userSubscription.update({
      where: { id },
      data,
    });
  },

  async deleteByUserId(userId: number) {
    return prisma.userSubscription.delete({ where: { userId } });
  },

  async changeStatus(userId: number, value: boolean) {
    return prisma.userSubscription.update({
      where: { userId },
      data: { status: value },
    });
  },

  async deactivate(userId: number) {
    return prisma.userSubscription.update({
      where: { userId },
      data: { status: false },
    });
  },

  async activate(userId: number) {
    return prisma.userSubscription.update({
      where: { userId },
      data: { status: true },
    });
  },
};
