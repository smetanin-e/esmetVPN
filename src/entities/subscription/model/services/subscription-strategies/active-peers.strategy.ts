import { calculateTieredPrice } from '@/shared/lib';
import { SubscriptionChargeContext, SubscriptionStrategy } from '../../types/subscription';

export class ActivePeersStrategy implements SubscriptionStrategy {
  async shouldCharge(context: SubscriptionChargeContext): Promise<boolean> {
    return (context.peersLast24hCount ?? 0) > 0 || (context.activePeersCount ?? 0) > 0;
  }

  async calculateAmount(context: SubscriptionChargeContext): Promise<number> {
    const unitsCount = Math.max(context.peersLast24hCount ?? 0, context.activePeersCount ?? 0);
    if (unitsCount === 0) return 0;
    return calculateTieredPrice(
      context.subscriptionPlan.dailyPrice,
      unitsCount,
      context.subscriptionPlan.maxPeers,
    );
  }

  getDescription(context: SubscriptionChargeContext): string {
    return `Списание за активные пиры (последние 24ч или статус ACTIVE) по тарифу "${context.subscriptionPlan.name}"`;
  }
}
