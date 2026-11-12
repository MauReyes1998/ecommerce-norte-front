import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, ErrorBox, Input } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useRegister } from '../hooks/useAuth';

export default function RegisterPage() {
  useDocumentTitle('Crear cuenta');
  const navigate = useNavigate();
  const register = useRegister();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });
  const details = (register.error as { details?: string[] } | null)?.details;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    register.mutate({ ...form, phone: form.phone || undefined }, { onSuccess: () => navigate('/cuenta', { replace: true }) });
  };

  return (
    <div className="container-x max-w-md py-16">
      <h1 className="mb-8 text-3xl font-bold">Crear cuenta</h1>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {register.error && <ErrorBox message={details?.join('. ') ?? register.error.message} />}
        <Input label="Nombre" autoComplete="name" required value={form.name} onChange={set('name')} />
        <Input label="Correo" type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
        <Input label="Teléfono (opcional)" type="tel" inputMode="numeric" autoComplete="tel" value={form.phone} onChange={set('phone')} hint="10 dígitos" />
        <Input label="Contraseña" type="password" autoComplete="new-password" required minLength={8} value={form.password} onChange={set('password')} hint="Mínimo 8 caracteres, con letras y números" />
        <Button type="submit" full loading={register.isPending}>Crear cuenta</Button>
      </form>
      <p className="mt-6 text-sm text-muted">¿Ya tienes cuenta? <Link to="/cuenta/entrar" className="font-semibold text-ink underline">Inicia sesión</Link></p>
    </div>
  );
}
