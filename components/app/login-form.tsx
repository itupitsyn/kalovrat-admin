'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FC, useCallback } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { REQUIRED_TEXT } from '@/lib/constants';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { FieldLabel } from '../ui/field';
import { Form, FormField, FormItem, FormMessage } from '../ui/form';
import { Input } from '../ui/input';

const FORM_ID = 'login-form';

const schema = z.object({
  login: z.string({ error: REQUIRED_TEXT }).min(1, { error: REQUIRED_TEXT }),
  password: z.string({ error: REQUIRED_TEXT }).min(1, { error: REQUIRED_TEXT }),
});

type LoginFormData = z.infer<typeof schema>;

export const LoginForm: FC = () => {
  const { push } = useRouter();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      login: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<LoginFormData> = useCallback(
    async (data) => {
      try {
        await axios.post('/api/login', data);
        push('/');
      } catch {
        toast.error('Ошибка при входе');
      }
    },
    [push],
  );

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Вход</CardTitle>
        <CardDescription>Необходимо войти, чтобы пользоваться системой</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...methods}>
          <form noValidate onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-6" id={FORM_ID}>
            <FormField
              control={methods.control}
              name="login"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel htmlFor="login">Имя пользователя</FieldLabel>
                  <Input {...field} id="login" />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel htmlFor="password">Пароль</FieldLabel>
                  <Input {...field} type="password" id="password" />
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-2">
        <Button type="submit" form={FORM_ID}>
          Войти
        </Button>
      </CardFooter>
    </Card>
  );
};
