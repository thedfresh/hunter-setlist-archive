import '../globals.css';
import { ReactNode } from 'react';

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <main className="mx-auto max-w-7xl px-4">
      {children}
    </main>
  );
}
