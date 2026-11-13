import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { BellRing } from 'lucide-react';
import { Button, Input } from '@/shared/ui';
import { useAuth } from '@/features/auth';
import { productApi } from '../api/product.api';

interface Props { slug: string; variantId: string; size: string }

/** "Avísame cuando haya stock" para la talla agotada que eligió el cliente. */
export function StockAlertForm({ slug, variantId, size }: Props) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? '');
  const m = useMutation({ mutationFn: () => productApi.stockAlert(slug, { variantId, email: user ? undefined : email }) });

  if (m.isSuccess) {
    return (
      <p className="flex items-center gap-2 border border-green-200 bg-green-50 p-3 text-sm text-green-800" role="status">
        <BellRing className="h-4 w-4 shrink-0" aria-hidden /> Listo. Te escribimos a <strong>{m.data.email}</strong> en cuanto vuelva la talla {size}.
      </p>
    );
  }

  const submit = (e: FormEvent) => { e.preventDefault(); m.mutate(); };

  return (
    <form onSubmit={submit} className="space-y-3 border border-line p-4">
      <p className="flex items-center gap-2 text-sm font-semibold"><BellRing className="h-4 w-4" aria-hidden /> ¿Te avisamos cuando haya talla {size}?</p>
      {!user && <Input label="Correo" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />}
      {user && <p className="text-xs text-muted">Te escribimos a {user.email}.</p>}
      {m.error && <p className="text-xs text-accent" role="alert">{m.error.message}</p>}
      <Button type="submit" variant="outline" loading={m.isPending}>Avísame</Button>
    </form>
  );
}
