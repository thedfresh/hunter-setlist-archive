import '../globals.css';
import { ReactNode } from 'react';

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <main className="py-6">
      {children}
    </main>
  );
}
