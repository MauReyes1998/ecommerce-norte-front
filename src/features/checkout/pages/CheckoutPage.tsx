import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Truck } from 'lucide-react';
import { DeliveryMethod, ShippingAddress } from '@/shared/types';
import { Button, Empty, ErrorBox, Input } from '@/shared/ui';
import { useSeo } from '@/shared/hooks/useDocumentTitle';
import { formatMXN } from '@/shared/lib/format';
import { useAuth } from '@/features/auth';
import { useCart, FREE_SHIPPING_FROM } from '@/features/cart';
import { AddressForm, useAddresses } from '@/features/account';
import { useCreateOrder, useQuote, issueLabel } from '../hooks/useCheckout';
import { CreateOrderInput } from '../api/checkout.api';
import { OrderSummaryPanel } from '../components/OrderSummaryPanel';
import { PICKUP_ADDRESS_LINE, PICKUP_LOCATION } from '../pickup';

export default function CheckoutPage() {
  useSeo({ title: 'Pagar', noindex: true });
  const navigate = useNavigate();
  const { user } = useAuth();
  const cart = useCart();
  const [delivery, setDelivery] = useState<DeliveryMethod>('ENVIO');
  const [coupon, setCoupon] = useState<string | null>(null);
  const quote = useQuote(delivery, coupon ?? undefined);
  const create = useCreateOrder();
  const saved = useAddresses(!!user); // solo con sesión
  const [email, setEmail] = useState('');
  const [selected, setSelected] = useState<string | 'new'>('new');
  const [pickup, setPickup] = useState({ fullName: '', phone: '' });

  // Si el usuario tiene direcciones guardadas, preselecciona la principal.
  useEffect(() => {
    if (!saved.data?.length) return;
    setSelected((saved.data.find((a) => a.isDefault) ?? saved.data[0]).id);
  }, [saved.data]);

  // Para recoger en tienda, propone los datos de la cuenta.
  useEffect(() => {
    if (!user) return;
    setPickup((p) => ({ fullName: p.fullName || user.name, phone: p.phone || (user.phone ?? '') }));
  }, [user]);

  if (cart.items.length === 0 && !create.isSuccess) {
    return <div className="container-x"><Empty title="Tu bolsa está vacía"><Link to="/tienda" className="underline">Ir a la tienda</Link></Empty></div>;
  }

  const submit = (extra: Pick<CreateOrderInput, 'shippingAddress' | 'pickupContact'>) => {
    create.mutate(
      {
        items: cart.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        deliveryMethod: delivery,
        couponCode: quote.data?.coupon?.code, // solo se manda si el servidor ya lo aceptó
        email: user ? undefined : email,
        ...extra,
      },
      {
        onSuccess: ({ order, checkoutUrl }) => {
          cart.clear();
          if (checkoutUrl) window.location.href = checkoutUrl;
          else navigate(`/pedido/${order.id}`);
        },
      },
    );
  };

  const place = (address: ShippingAddress) => submit({ shippingAddress: address });
  const placePickup = (e: FormEvent) => { e.preventDefault(); submit({ pickupContact: pickup }); };
  const submitSaved = () => {
    const a = saved.data?.find((x) => x.id === selected);
    if (!a) return;
    const { fullName, phone, street, extNumber, intNumber, neighborhood, city, state, postalCode, references } = a;
    place({ fullName, phone, street, extNumber, intNumber, neighborhood, city, state, postalCode, references });
  };

  const err = create.error as { message: string; details?: string[] | { lines?: unknown } } | null;
  const issues = quote.data && !quote.data.isValid ? issueLabel(quote.data) : [];
  const isPickup = delivery === 'RECOGER';
  const step = (i: number) => (user ? i : i + 1); // el invitado tiene el paso extra de contacto
  const usesForm = isPickup || selected === 'new';
  const formId = isPickup ? 'checkout-pickup' : 'checkout-address';
  const optionCls = (active: boolean) => `flex cursor-pointer gap-3 border p-3 text-sm ${active ? 'border-ink' : 'border-line'}`;

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
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">{step(1)}. Entrega</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className={optionCls(!isPickup)}>
                <input type="radio" name="delivery" className="mt-1 accent-ink" checked={!isPickup} onChange={() => setDelivery('ENVIO')} />
                <span>
                  <strong className="flex items-center gap-2"><Truck className="h-4 w-4" aria-hidden /> Envío a domicilio</strong>
                  <span className="block text-xs text-muted">Gratis en compras desde {formatMXN(FREE_SHIPPING_FROM)}</span>
                </span>
              </label>
              <label className={optionCls(isPickup)}>
                <input type="radio" name="delivery" className="mt-1 accent-ink" checked={isPickup} onChange={() => setDelivery('RECOGER')} />
                <span>
                  <strong className="flex items-center gap-2"><Store className="h-4 w-4" aria-hidden /> Recoger en tienda</strong>
                  <span className="block text-xs text-muted">Gratis · {PICKUP_LOCATION.city}</span>
                </span>
              </label>
            </div>
          </section>

          {isPickup ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">{step(2)}. ¿Quién recoge?</h2>
              <p className="mb-4 text-sm text-muted">
                Pasa por tu pedido a <strong className="text-ink">{PICKUP_ADDRESS_LINE}</strong>, CP {PICKUP_LOCATION.postalCode}.
                Horario: {PICKUP_LOCATION.hours}. Te avisamos por correo cuando esté listo.
              </p>
              <form id="checkout-pickup" onSubmit={placePickup} className="grid gap-4 sm:grid-cols-2">
                <Input label="Nombre de quien recoge" autoComplete="name" required minLength={3} maxLength={80}
                  value={pickup.fullName} onChange={(e) => setPickup({ ...pickup, fullName: e.target.value })} />
                <Input label="Teléfono de contacto" type="tel" inputMode="numeric" autoComplete="tel" required pattern="\d{10}" title="10 dígitos"
                  value={pickup.phone} onChange={(e) => setPickup({ ...pickup, phone: e.target.value })} hint="10 dígitos, para avisarte." />
              </form>
            </section>
          ) : (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">{step(2)}. Dirección de envío</h2>
              {saved.data && saved.data.length > 0 && (
                <div className="mb-4 space-y-2">
                  {saved.data.map((a) => (
                    <label key={a.id} className={optionCls(selected === a.id)}>
                      <input type="radio" name="address" className="mt-1 accent-ink" checked={selected === a.id} onChange={() => setSelected(a.id)} />
                      <span><strong>{a.fullName}</strong> · {a.street} {a.extNumber}, {a.neighborhood}, {a.city}, {a.state}, CP {a.postalCode}</span>
                    </label>
                  ))}
                  <label className={optionCls(selected === 'new')}>
                    <input type="radio" name="address" className="accent-ink" checked={selected === 'new'} onChange={() => setSelected('new')} /> Usar otra dirección
                  </label>
                </div>
              )}
              {selected === 'new' && <AddressForm formId="checkout-address" onSubmit={place} />}
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">{step(3)}. Pago</h2>
            <p className="text-sm text-muted">Al confirmar te llevamos a Mercado Pago para completar el pago.</p>
            {usesForm
              ? <Button type="submit" form={formId} className="mt-4" loading={create.isPending} disabled={quote.isFetching || (!user && !email)}>Confirmar y pagar</Button>
              : <Button className="mt-4" onClick={submitSaved} loading={create.isPending} disabled={quote.isFetching}>Confirmar y pagar</Button>}
          </section>
        </div>
        <OrderSummaryPanel items={cart.items} quote={quote.data} fallback={cart} delivery={delivery}
          coupon={{ code: coupon, onApply: setCoupon, onRemove: () => setCoupon(null) }} />
      </div>
    </div>
  );
}
