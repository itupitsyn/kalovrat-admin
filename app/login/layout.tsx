import { PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {children}
    </main>
  );
}
