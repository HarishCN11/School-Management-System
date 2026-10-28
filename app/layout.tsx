import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../frontend sms/src/index.css';

export const metadata: Metadata = {
  title: 'School Management System',
  description: 'School management portal',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
