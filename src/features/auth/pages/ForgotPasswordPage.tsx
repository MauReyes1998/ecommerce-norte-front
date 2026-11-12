import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button, ErrorBox, Input } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { authApi } from '../api/auth.api';

export default function ForgotPasswordPage() {
  useDocumentTitle('Recuperar contraseña');
  const [email, setEmail] = useState('');
  const m = useMutation({ mutationFn: authApi.forgotPassword });
  const submit = (e: FormEvent) => { e.preventDefault(); m.mutate(email); };
  return (
    <div className="container-x max-w-md py-16">
      <h1 className="mb-2 text-3xl font-bold">Recuperar contraseña</h1>
      <p className="mb-8 text-sm text-muted">Te mandamos un enlace a tu correo para crear una contraseña nueva.</p>
      {m.isSuccess ? (
        <div className="space-y-4 border border-line bg-paper p-5 text-sm">
          <p>{m.data.message}</p>
          <p className="text-muted">Revisa también tu carpeta de spam. El enlace vence en 1 hora.</p>
          <Link to="/cuenta/entrar" className="btn-outline">Volver a iniciar sesión</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          {m.error && <ErrorBox message={m.error.message} />}
          <Input label="Correo" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" full loading={m.isPending}>Enviar enlace</Button>
        </form>
      )}
    </div>
  );
}
