import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui';
import { MoveLeft } from 'lucide-react';
import Link from 'next/link';

export default async function License() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'>
      <div className='container mx-auto py-4 px-2'>
        <Link href={'/'} className='flex items-center space-x-4'>
          <MoveLeft className='h-4 w-4' />
          <h1>На главную</h1>
        </Link>

        <div className='mt-10 space-y-6'>
          {/* User Agreement */}
          <Card className='bg-slate-800/40 backdrop-blur border-slate-700 text-white'>
            <CardHeader>
              <CardTitle className='text-xl'>Пользовательское соглашение</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-slate-200 text-sm leading-relaxed'>
              <p>
                <strong>1. Общие положения</strong>
              </p>
              <p>
                1.1. Настоящее Пользовательское соглашение регулирует отношения между VPN‑сервисом{' '}
                <span className='font-semibold'>EsmetVPN</span> и пользователем.
              </p>
              <p>1.2. Используя сервис, пользователь подтверждает согласие с данным соглашением.</p>

              <p>
                <strong>2. Описание услуг</strong>
              </p>
              <p>
                Сервис предоставляет безопасное VPN‑подключение. Контент третьих лиц не
                предоставляется.
              </p>

              <p>
                <strong>3. Регистрация и оплата</strong>
              </p>
              <p>
                Оплата производится через ЮKassa. После оплаты доступ активируется автоматически.
              </p>

              <p>
                <strong>4. Права пользователя</strong>
              </p>
              <ul className='list-disc list-inside'>
                <li>не нарушать законодательство РФ;</li>
                <li>не использовать сервис для атак или спама;</li>
                <li>хранить данные для входа в безопасности.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Public Offer */}
          <Card className='bg-slate-800/40 backdrop-blur border-slate-700 text-white'>
            <CardHeader>
              <CardTitle className='text-xl'>Публичная оферта</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-slate-200 text-sm leading-relaxed'>
              <p>
                <strong>1. Общие положения</strong>
              </p>
              <p>Настоящая оферта является официальным предложением согласно ст. 437 ГК РФ.</p>

              <p>
                <strong>2. Предмет договора</strong>
              </p>
              <p>Исполнитель предоставляет услуги VPN, пользователь обязуется их оплатить.</p>

              <p>
                <strong>3. Стоимость и оплата</strong>
              </p>
              <p>Стоимость услуг указана на сайте. Оплата — через ЮKassa.</p>

              <p>
                <strong>Реквизиты</strong>
              </p>
              <p>
                Самозанятый — физическое лицо, применяющее специальный налоговый режим «Налог на
                профессиональный доход» (НПД), ФИО: Сметанин Евгений Евгеньевич, ИНН: 614343769377,
                Email: esmet91@yandex.ru
              </p>
            </CardContent>
          </Card>

          {/* Privacy Policy */}
          <Card className='bg-slate-800/40 backdrop-blur border-slate-700 text-white'>
            <CardHeader>
              <CardTitle className='text-xl'>Политика конфиденциальности</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-slate-200 text-sm leading-relaxed'>
              <p>
                <strong>1. Общие положения</strong>
              </p>
              <p>Политика соответствует ФЗ‑152 «О персональных данных».</p>

              <p>
                <strong>2. Какие данные собираются</strong>
              </p>
              <ul className='list-disc list-inside'>
                <li>ФИО, номер телефона, данные аккаунта;</li>
                <li>данные для оплаты (обрабатываются ЮKassa);</li>
                <li>технические данные для работы сервиса.</li>
              </ul>

              <p>
                <strong>No‑logs</strong>
              </p>
              <p>VPN‑трафик и посещённые сайты не сохраняются.</p>

              <p>
                <strong>Контакты</strong>
              </p>
              <p>Email: esmet91@yandex.ru</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
