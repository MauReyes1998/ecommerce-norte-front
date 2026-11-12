import { ReactNode } from 'react';

export const Empty = ({ title, children }: { title: string; children?: ReactNode }) => (
  <div className="py-20 text-center">
    <p className="text-lg font-semibold">{title}</p>
    {children && <div className="mt-2 text-sm text-muted">{children}</div>}
  </div>
);

export const ErrorBox = ({ message }: { message: string }) => (
  <div role="alert" className="border border-accent/40 bg-red-50 px-4 py-3 text-sm text-accent">{message}</div>
);
