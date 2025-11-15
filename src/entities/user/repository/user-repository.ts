import { RegisterUserType } from '@/features/user/model/schemas/register-schema';
import { prisma } from '@/shared/lib/prisma';
import { generateSalt, hashPassword } from '@/shared/lib/auth/password-utils';
import { UserDTO } from '../model/types';

const baseUserSelect = {
  id: true,
  login: true,
  role: true,
  firstName: true,
  status: true,
  lastName: true,
  balance: true,
  telegram: true,
  userSubscription: { include: { subscriptionPlan: true } },
  peers: {
    select: { peerName: true, status: true },
  },
};

export const userRepository = {
  async findUserByLogin(login: string) {
    return prisma.user.findUnique({ where: { login } });
  },

  async findUserById(userId: number): Promise<UserDTO | null> {
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: baseUserSelect,
      orderBy: {
        id: 'asc',
      },
    });

    if (!user) return null;
    return user;
  },

  async registerUser(data: RegisterUserType) {
    const salt = generateSalt();
    const hashedPassword = await hashPassword(data.password, salt);
    return prisma.user.create({
      data: {
        login: data.login,
        password: hashedPassword,
        salt,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        telegram: data.telegram.startsWith('http')
          ? data.telegram
          : `https://t.me/${data.telegram}`,
      },
    });
  },

  async findAllUsersWithRelations(): Promise<UserDTO[] | null> {
    return await prisma.user.findMany({
      select: baseUserSelect,
      orderBy: {
        id: 'asc',
      },
    });
  },

  async updateUserById(userId: number, data: object) {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  },

  async toggleUserStatus(userId: number, status: boolean) {
    return await prisma.user.update({
      where: { id: userId },
      data: { status },
    });
  },

  async deleteUser(userId: number) {
    return prisma.user.delete({
      where: { id: userId },
    });
  },

  async incrementBalance(userId: number, amount: number) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        balance: { increment: amount },
      },
    });
  },
};
