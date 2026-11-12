import { FormEvent, useState } from 'react';
import { MX_STATES, ShippingAddress } from '@/shared/types';
import { Button, Input, Select, Textarea } from '@/shared/ui';

export const emptyAddress: ShippingAddress = {
  fullName: '', phone: '', street: '', extNumber: '', intNumber: '', neighborhood: '', city: '', state: 'Estado de México', postalCode: '', references: '',
};

interface Props {
  initial?: ShippingAddress;
  onSubmit: (a: ShippingAddress) => void;
  submitLabel?: string;
  loading?: boolean;
  errors?: string[];
  /** Modo embebido (checkout): sin botón propio, el padre dispara el submit con el id del form. */
  formId?: string;
  onChange?: (a: ShippingAddress) => void;
}

export function AddressForm({ initial = emptyAddress, onSubmit, submitLabel = 'Guardar', loading, errors, formId, onChange }: Props) {
  const [a, setA] = useState<ShippingAddress>(initial);
  const set = (k: keyof ShippingAddress) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next = { ...a, [k]: e.target.value };
    setA(next); onChange?.(next);
  };
  const submit = (e: FormEvent) => { e.preventDefault(); onSubmit({ ...a, intNumber: a.intNumber || null, references: a.references || null }); };

  return (
    <form id={formId} onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
      {errors && errors.length > 0 && <ul role="alert" className="sm:col-span-2 list-disc border border-accent/40 bg-red-50 py-2 pl-6 text-sm text-accent">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
      <Input label="Nombre completo" autoComplete="name" required value={a.fullName} onChange={set('fullName')} className="sm:col-span-2" />
      <Input label="Teléfono" type="tel" inputMode="numeric" autoComplete="tel" required pattern="\d{10}" value={a.phone} onChange={set('phone')} hint="10 dígitos" />
      <Input label="Código postal" inputMode="numeric" autoComplete="postal-code" required pattern="\d{5}" maxLength={5} value={a.postalCode} onChange={set('postalCode')} />
      <Input label="Calle" autoComplete="address-line1" required value={a.street} onChange={set('street')} className="sm:col-span-2" />
      <Input label="Número exterior" required value={a.extNumber} onChange={set('extNumber')} />
      <Input label="Número interior (opcional)" value={a.intNumber ?? ''} onChange={set('intNumber')} />
      <Input label="Colonia" autoComplete="address-level3" required value={a.neighborhood} onChange={set('neighborhood')} />
      <Input label="Municipio o alcaldía" autoComplete="address-level2" required value={a.city} onChange={set('city')} />
      <Select label="Estado" autoComplete="address-level1" value={a.state} onChange={set('state')} className="sm:col-span-2">
        {MX_STATES.map((s) => <option key={s}>{s}</option>)}
      </Select>
      <Textarea label="Referencias (opcional)" value={a.references ?? ''} onChange={set('references')} className="sm:col-span-2" placeholder="Color de la casa, entre qué calles…" />
      {!formId && <div className="sm:col-span-2"><Button type="submit" loading={loading}>{submitLabel}</Button></div>}
    </form>
  );
}
