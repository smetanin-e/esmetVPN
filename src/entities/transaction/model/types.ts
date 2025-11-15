import { Transaction, TransactionType, User } from '@prisma/client';

export type TransactionDTO = Transaction & { user: Pick<User, 'login'> };

// export type TransactionDTO = Pick<
//   Transaction,
//   'type' | 'amount' | 'createdAt' | 'description' | 'status'
// >;

export type TransactionTopUp = {
  userId: number;
  amount: number;
  type: TransactionType;
  description: string;
};
