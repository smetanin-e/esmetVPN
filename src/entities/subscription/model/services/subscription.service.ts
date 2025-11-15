import { prisma } from '@/shared/lib/prisma';
import {
  type UserSubscription as PrismaUserSubscription,
  type SubscriptionPlan as PrismaSubscriptionPlan,
} from '@prisma/client';

import { ActivePeersStrategy, EnabledPeersStrategy, FreeStrategy } from './subscription-strategies';
import { SubscriptionChargeContext, SubscriptionStrategy } from '../types/subscription';
import { WgSyncService } from '@/entities/wg-peer/model/services/wg-sync.service';
import { userSubscriptionRepository } from '@/entities/user-subscription/repository/user-subscription-repository';
import { peerRepository } from '@/entities/wg-peer/repository/peer-repository';
import { transactionRepository } from '@/entities/transaction/repository/transaction-repository';
import { handleNegativeBalance } from '@/entities/transaction/actions/handle-negative-balance';

export class SubscriptionService {
  private strategies: Map<string, SubscriptionStrategy> = new Map();
  private wgSync = new WgSyncService();

  constructor() {
    this.registerStrategies();
  }

  private registerStrategies(): void {
    this.strategies.set('STANDART', new ActivePeersStrategy());
    this.strategies.set('FLEX', new EnabledPeersStrategy());
    this.strategies.set('FREE', new FreeStrategy());
  }

  /** Основной метод для cron: списываем всем пользователям */
  async chargeAllUsers(): Promise<void> {
    // 1. Обновляем активность пиров
    await this.wgSync.updatePeersActivity();

    // 2. Получаем все активные подписки
    const subscriptions = await userSubscriptionRepository.findActiveWithPlan();

    for (const sub of subscriptions) {
      await this.chargeUser(sub.userId, sub);
    }
  }

  /**
   * Главный метод — выполняет списание для пользователя.
   *
   * @param userId - id пользователя
   * @param userSubscription - опционально: уже загруженный объект UserSubscription с relation subscriptionPlan
   */
  async chargeUser(
    userId: number,
    userSubscription?: PrismaUserSubscription & { subscriptionPlan: PrismaSubscriptionPlan },
  ): Promise<boolean> {
    if (!userSubscription) {
      const sub = await userSubscriptionRepository.findByUserIdWithPlan(userId);
      if (!sub || !sub.status) {
        console.log(`У пользователя с  id=${userId} подписка отключена или отсутствует`);
        return false;
      }
      userSubscription = sub;
    }

    const subscriptionPlan = userSubscription.subscriptionPlan;

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Считаем пиры
    const peersLast24hCount = await peerRepository.countPeersLast24h(userId, twentyFourHoursAgo);

    const activePeersCount = await peerRepository.countActivePeers(userId);

    const maxPeers = subscriptionPlan.maxPeers;

    const context: SubscriptionChargeContext = {
      userId,
      userSubscription,
      subscriptionPlan,
      currentDate: new Date(),
      peersLast24hCount,
      activePeersCount,
      maxPeers,
    };

    const strategy = this.selectStrategy(subscriptionPlan);

    const shouldCharge = await strategy.shouldCharge(context);
    if (!shouldCharge) {
      console.log(`Пользователю с id=${userId} оплата не требуется`);
      return false;
    }

    const amount = await strategy.calculateAmount(context);
    if (amount === 0) {
      console.log(`Для пользователя id=${userId} списание не требуется`);
      return false;
    }

    const description = strategy.getDescription(context);

    console.log(`Платеж: Пользователь id=${userId}: ${amount} ₽ - ${description}`);
    return this.processCharge(userId, amount, description);
  }

  private selectStrategy(subscriptionPlan: PrismaSubscriptionPlan): SubscriptionStrategy {
    // Определяем стратегию по типу подписки
    const planLabel = subscriptionPlan.label.toUpperCase();

    if (planLabel.includes('FREE') || subscriptionPlan.dailyPrice === 0) {
      return this.strategies.get('FREE')!;
    }

    if (planLabel.includes('STANDART')) {
      return this.strategies.get('STANDART')!;
    }

    // По умолчанию стратегия для одного пира
    return this.strategies.get('FLEX')!;
  }

  //Логика записи транзакций, обновления баланса и отключения подписки при отрицательном балансе
  private async processCharge(
    userId: number,
    amount: number,
    description: string,
  ): Promise<boolean> {
    try {
      await prisma.$transaction(async (tx) => {
        // 1) Создаём запись транзакции
        await transactionRepository.createCharge(tx, userId, amount, description);

        // 2) Обновляем баланс пользователя (понижаем)
        await tx.user.update({
          where: { id: userId },
          data: { balance: { decrement: amount } },
        });

        //3) Если баланс ушёл в минус
        const updatedUser = await tx.user.findUnique({
          where: { id: userId },
          select: { balance: true },
        });
        if (updatedUser && updatedUser.balance < 0) {
          await handleNegativeBalance(userId);
        }
      });

      console.log(`Обработка платежа: Пользователь id=${userId}, сумма=${amount}`);
      return true;
    } catch (error) {
      console.error('Ошибка обработки платежа', error);
      return false;
    }
  }
}
