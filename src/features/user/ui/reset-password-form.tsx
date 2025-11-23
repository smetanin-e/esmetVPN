'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FormInput } from '@/shared/components/form';
import { Button } from '@/shared/components/ui';
import { resetPasswordSchema, ResetPasswordType } from '../model/schemas/reset-password-schema';
import { resetUserPasswordAction } from '../actions/reset-user-password';

interface Props {
  className?: string;
  id: number;
  setOpen: (value: boolean) => void;
}

export const ResetPasswordForm: React.FC<Props> = ({ id, setOpen }) => {
  const form = useForm<ResetPasswordType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordType) => {
    try {
      await resetUserPasswordAction(id, data);
      setOpen(false);
      toast.success('Пароль успешно изменен✅');
    } catch (error) {
      console.error('Error [LOGIN_FORM]', error);
      return toast.error(error instanceof Error ? error.message : 'Ошибка ❌');
    }
  };
  return (
    <FormProvider {...form}>
      <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
        <FormInput
          label='Новый пароль'
          name='password'
          id='password'
          type='password'
          placeholder='Новый пароль...'
          required
        />
        <FormInput
          label='Подтверждение пароля'
          name='confirmPassword'
          id='confirmPassword'
          type='password'
          placeholder='Подтверждение пароля...'
          required
        />

        <Button disabled={form.formState.isSubmitting} className='w-full' type='submit'>
          {form.formState.isSubmitting ? 'Изменение пароля...' : 'Изменить пароль'}
        </Button>
      </form>
    </FormProvider>
  );
};
