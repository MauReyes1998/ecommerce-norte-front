import { FormEvent, useState } from 'react';
import { Button, ErrorBox, Input, useToast } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useAuth, useUpdateProfile } from '@/features/auth';

export default function ProfilePage() {
  useDocumentTitle('Perfil');
  const { user } = useAuth();
  const update = useUpdateProfile();
  const toast = useToast((s) => s.push);
  const [form, setForm] = useState({ name: user?.name ?? '', phone: user?.phone ?? '' });
  const submit = (e: FormEvent) => { e.preventDefault(); update.mutate({ name: form.name, phone: form.phone || undefined }, { onSuccess: () => toast('Perfil actualizado') }); };
  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-2xl font-bold">Perfil</h1>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {update.error && <ErrorBox message={update.error.message} />}
        <Input label="Correo" value={user?.email ?? ''} disabled />
        <Input label="Nombre" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Teléfono" type="tel" inputMode="numeric" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} hint="10 dígitos" />
        <Button type="submit" loading={update.isPending}>Guardar</Button>
      </form>
    </div>
  );
}
