import { getUserSession } from '@/features/user/actions/get-user-session';
import { CardLabel, Header } from '@/shared/components';
import { Clients } from '@/widgets/clients/clients';
import { Peers } from '@/widgets/peers/peers';
import { SubscriptionPlans } from '@/widgets/subscription-plans/subscription-plans';
import { Transactions } from '@/widgets/transactions/transactions';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  //614
  const user = await getUserSession();
  if (!user) return redirect('/not-auth');
  if (user.role !== UserRole.ADMIN) return redirect('/dashboard');

  return (
    <div className=' min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'>
      <div className='container mx-auto py-4 px-2'>
        <Header title='Админ-панель' name={`${user.lastName} ${user.firstName}`} role={user.role} />
        <div className='space-y-8'>
          <SubscriptionPlans />
          <div className=' lg:grid lg:grid-cols-[1fr_370px] lg:gap-6'>
            <Clients className='mb-8 lg:mb-0 ' />
            <Transactions userRole={user.role as UserRole} />
          </div>

          <Peers userRole={user.role} label={<CardLabel text='Все конфигурации' />} />
        </div>
      </div>
    </div>
  );
}
