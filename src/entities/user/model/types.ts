import { UserSubscriptionDTO } from '@/entities/user-subscription/model/types';
import { PeerDTO } from '@/entities/wg-peer/model/types';

export type UserDTO = {
  id: number;
  login: string;
  role: string;
  firstName: string;
  lastName: string;
  balance: number;
  status: boolean;
  telegram: string;
  userSubscription: UserSubscriptionDTO | null;
  peers: PeerDTO[] | null;
};
