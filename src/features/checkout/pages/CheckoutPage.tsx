import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShippingAddress } from '@/shared/types';
import { Button, Empty, ErrorBox, Input } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useAuth } from '@/features/auth';
import { useCart } from '@/features/cart';
import { AddressForm, useAddresses } from '@/features/account';
import { useCreateOrder, useQuote, issueLabel } from '../hooks/useCheckout';
import { OrderSummaryPanel } from '../components/OrderSummaryPanel';

export default function CheckoutPage() {
  useDocumentTitle('Pagar');
  const navigate = useNavigate();
  const { user } = useAuth();
  const cart = useCart();
  const quote = useQuote();
  const create = useCreateOrder();
  const saved = useAddresses(!!user); // solo con sesión
  const [email, setEmail] = useState('');
  const [selected, setSelected] = useState<string | 'new'>('new');

  // Si el usuario tiene direcciones guardadas, preselecciona la principal.
  useEffect(() => {
    if (!saved.data?.length) return;
    setSelected((saved.data.find((a) => a.isDefault) ?? saved.data[0]).id);
  }, [saved.data]);

  if (cart.items.length === 0 && !create.isSuccess) {
    return <div className="container-x"><Empty title="Tu bolsa está vacía"><Link to="/tienda" className="underline">Ir a la tienda</Link></Empty></div>;
  }

  const place = (address: ShippingAddress) => {
    create.mutate(
      { items: cart.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })), shippingAddress: address, email: user ? undefined : email },
      {
        onSuccess: ({ order, checkoutUrl }) => {
          cart.clear();
          if (checkoutUrl) window.location.href = checkoutUrl;
          else navigate(`/pedido/${order.id}`);
        },
      },
    );
  };

  const submitSaved = () => {
    const a = saved.data?.find((x) => x.id === selected);
    if (!a) return;
    const { fullName, phone, street, extNumber, intNumber, neighborhood, city, state, postalCode, references } = a;
    place({ fullName, phone, street, extNumber, intNumber, neighborhood, city, state, postalCode, references });
  };

  const err = create.error as { message: string; details?: string[] | { lines?: unknown } } | null;
  const issues = quote.data && !quote.data.isValid ? issueLabel(quote.data) : [];

  return (
    <div className="container-x py-10">
      <h1 className="mb-8 text-3xl font-bold">Finalizar compra</h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          {issues.length > 0 && <ul role="alert" className="list-disc border border-amber-300 bg-amber-50 py-2 pl-6 text-sm text-amber-900">{issues.map((i) => <li key={i}>{i}</li>)}</ul>}
          {err && <ErrorBox message={Array.isArray(err.details) ? err.details.join('. ') : err.message} />}

          {!user && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">1. Contacto</h2>
              <Input label="Correo" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} hint="Aquí te mandamos la confirmación." />
              <p className="mt-2 text-xs text-muted">¿Ya tienes cuenta? <Link to="/cuenta/entrar" state={{ from: '/checkout' }} className="underline">Inicia sesión</Link> para usar tus direcciones.</p>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">{user ? '1' : '2'}. Dirección de envío</h2>
            {saved.data && saved.data.length > 0 && (
              <div className="mb-4 space-y-2">
                {saved.data.map((a) => (
                  <label key={a.id} className={`flex cursor-pointer gap-3 border p-3 text-sm ${selected === a.id ? 'border-ink' : 'border-line'}`}>
                    <input type="radio" name="address" className="mt-1 accent-ink" checked={selected === a.id} onChange={() => setSelected(a.id)} />
                    <span><strong>{a.fullName}</strong> · {a.street} {a.extNumber}, {a.neighborhood}, {a.city}, {a.state}, CP {a.postalCode}</span>
                  </label>
                ))}
                <label className={`flex cursor-pointer gap-3 border p-3 text-sm ${selected === 'new' ? 'border-ink' : 'border-line'}`}>
                  <input type="radio" name="address" className="accent-ink" checked={selected === 'new'} onChange={() => setSelected('new')} /> Usar otra dirección
                </label>
              </div>
            )}
            {selected === 'new' && <AddressForm formId="checkout-address" onSubmit={place} />}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">{user ? '2' : '3'}. Pago</h2>
            <p className="text-sm text-muted">Al confirmar te llevamos a Mercado Pago para completar el pago.</p>
            {selected === 'new'
              ? <Button type="submit" form="checkout-address" className="mt-4" loading={create.isPending} disabled={quote.isFetching || (!user && !email)}>Confirmar y pagar</Button>
              : <Button className="mt-4" onClick={submitSaved} loading={create.isPending} disabled={quote.isFetching}>Confirmar y pagar</Button>}
          </section>
        </div>
        <OrderSummaryPanel items={cart.items} quote={quote.data} fallback={cart} />
      </div>
    </div>
  );
}
