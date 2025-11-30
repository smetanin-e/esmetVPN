import { getUserSession } from '@/features/user/actions/get-user-session';
import { Button } from '@/shared/components/ui';
import { AuthModal } from '@/widgets/auth-modal/auth-modal';
import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getUserSession();
  if (user) {
    return redirect('/dashboard');
  }
  return (
    <div className='flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'>
      <div className='flex flex-col items-center justify-center grow-1'>
        <h1 className='text-4xl md:text-5xl font-bold mb-4 text-center'>
          Добро пожаловать в сервис EsmetVPN!
        </h1>

        <p className='text-l text-gray-300 mb-8 text-center max-w-xl p-2'>
          Безопасный доступ к интернету для ограниченного круга пользователей. Пожалуйста, войдите в
          систему, чтобы управлять своими настройками и конфигурациями WireGuard.
        </p>

        <AuthModal
          title='Добро пожаловать'
          description='Введите логин и пароль для входа в аккаунт'
          type='login'
          trigger={
            <Button className='w-[200px]'>
              <LogIn className='w-4 h-4' />
              Войти
            </Button>
          }
        />
      </div>

      <footer className='py-2 text-center text-gray-400 text-sm'>
        &copy; 2025 esmetVPN. Все права защищены.{' '}
        <Link href={'/license'} className='underline'>
          Пользовательское соглашение.
        </Link>
      </footer>
    </div>
  );
}
