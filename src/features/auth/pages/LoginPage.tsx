import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, ErrorBox, Input } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useLogin } from '../hooks/useAuth';

export default function LoginPage() {
  useDocumentTitle('Iniciar sesión');
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/cuenta';
  const login = useLogin();
  const [form, setForm] = useState({ email: '', password: '' });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate(form, { onSuccess: (s) => navigate(s.user.role === 'ADMIN' ? '/admin' : from, { replace: true }) });
  };

  return (
    <div className="container-x max-w-md py-16">
      <h1 className="mb-8 text-3xl font-bold">Iniciar sesión</h1>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {login.error && <ErrorBox message={login.error.message} />}
        <Input label="Correo" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Contraseña" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Button type="submit" full loading={login.isPending}>Entrar</Button>
        <p className="text-right text-sm"><Link to="/cuenta/recuperar" className="underline">¿Olvidaste tu contraseña?</Link></p>
      </form>
      <p className="mt-6 text-sm text-muted">¿No tienes cuenta? <Link to="/cuenta/registro" className="font-semibold text-ink underline">Regístrate</Link></p>
    </div>
  );
}
