import React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui';

import { KeyRound } from 'lucide-react';
import { ResetPasswordForm } from './reset-password-form';

interface Props {
  className?: string;
  id: number;
}

export const ResetPasswordModal: React.FC<Props> = ({ id }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <KeyRound className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='min-w-sm  bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'>
        <DialogHeader className='space-y-1'>
          <DialogTitle className='text-2xl font-bold text-center'>Сброс пароля</DialogTitle>
          <DialogDescription className='text-center'>
            Введите новый пароль и его подтверждение.
          </DialogDescription>
        </DialogHeader>
        <ResetPasswordForm id={id} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
};
