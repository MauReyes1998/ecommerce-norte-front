import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { ShippingAddress } from '@/shared/types';
import { Button, Empty, Modal, useToast } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useAddresses, useAddressMutations } from '../hooks/useAccount';
import { Address } from '../api/account.api';
import { AddressForm } from '../components/AddressForm';

export default function AddressesPage() {
  useDocumentTitle('Mis direcciones');
  const { data, isLoading } = useAddresses();
  const m = useAddressMutations();
  const toast = useToast((s) => s.push);
  const [editing, setEditing] = useState<Address | 'new' | null>(null);

  const save = (a: ShippingAddress) => {
    const onSuccess = () => { setEditing(null); toast('Dirección guardada'); };
    if (editing === 'new') m.create.mutate(a, { onSuccess });
    else m.update.mutate({ id: (editing as Address).id, ...a }, { onSuccess });
  };
  const err = (m.create.error ?? m.update.error) as { details?: string[]; message: string } | null;

  return (
    <>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Direcciones</h1>
        <Button onClick={() => setEditing('new')}>Agregar</Button>
      </header>
      {isLoading ? null : !data?.length ? <Empty title="No tienes direcciones guardadas" /> : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {data.map((a) => (
            <li key={a.id} className="relative border border-line p-4 text-sm">
              {a.isDefault && <span className="mb-2 inline-block bg-ink px-2 py-0.5 text-[11px] font-bold uppercase text-white">Principal</span>}
              <p className="font-semibold">{a.fullName}</p>
              <p>{a.street} {a.extNumber}{a.intNumber ? ` int. ${a.intNumber}` : ''}, {a.neighborhood}</p>
              <p>{a.city}, {a.state}, CP {a.postalCode}</p>
              <p className="text-muted">Tel. {a.phone}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setEditing(a)} className="inline-flex items-center gap-1 text-xs underline"><Pencil className="h-3 w-3" /> Editar</button>
                {!a.isDefault && <button onClick={() => m.update.mutate({ id: a.id, isDefault: true })} className="text-xs underline">Hacer principal</button>}
                <button onClick={() => confirm('¿Eliminar esta dirección?') && m.remove.mutate(a.id)} className="ml-auto inline-flex items-center gap-1 text-xs text-accent underline"><Trash2 className="h-3 w-3" /> Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Nueva dirección' : 'Editar dirección'} wide>
        {editing && <AddressForm initial={editing === 'new' ? undefined : editing} onSubmit={save} loading={m.create.isPending || m.update.isPending} errors={err ? err.details ?? [err.message] : undefined} />}
      </Modal>
    </>
  );
}
