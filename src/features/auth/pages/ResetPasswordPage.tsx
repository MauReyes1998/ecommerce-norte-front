import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button, ErrorBox, Input, useToast } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { authApi } from '../api/auth.api';

export default function ResetPasswordPage() {
  useDocumentTitle('Nueva contraseña');
  const token = useSearchParams()[0].get('token') ?? '';
  const navigate = useNavigate();
  const toast = useToast((s) => s.push);
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [localError, setLocalError] = useState<string | null>(null);
  const m = useMutation({ mutationFn: () => authApi.resetPassword(token, form.password) });
  const details = (m.error as { details?: string[] } | null)?.details;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setLocalError('Las contraseñas no coinciden.');
    setLocalError(null);
    m.mutate(undefined, { onSuccess: (r) => { toast(r.message); navigate('/cuenta/entrar', { replace: true }); } });
  };

  if (!token) {
    return <div className="container-x max-w-md py-16"><ErrorBox message="Falta el token del enlace." /><Link to="/cuenta/recuperar" className="btn-outline mt-6">Pedir un enlace nuevo</Link></div>;
  }
  return (
    <div className="container-x max-w-md py-16">
      <h1 className="mb-8 text-3xl font-bold">Nueva contraseña</h1>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {(localError || m.error) && <ErrorBox message={localError ?? details?.join('. ') ?? m.error!.message} />}
        <Input label="Contraseña nueva" type="password" autoComplete="new-password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} hint="Mínimo 8 caracteres, con letras y números" />
        <Input label="Repite la contraseña" type="password" autoComplete="new-password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        <Button type="submit" full loading={m.isPending}>Guardar contraseña</Button>
      </form>
      {m.error && <p className="mt-4 text-sm"><Link to="/cuenta/recuperar" className="underline">Pedir un enlace nuevo</Link></p>}
    </div>
  );
}
