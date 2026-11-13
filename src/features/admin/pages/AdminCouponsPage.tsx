import { FormEvent, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { CouponType } from '@/shared/types';
import { Badge, Button, ErrorBox, Input, Modal, Select, useToast } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { formatDate, formatMXN } from '@/shared/lib/format';
import { AdminCoupon, CouponInput } from '../api/admin.api';
import { useAdminCoupons, useCouponMutations } from '../hooks/useAdmin';

const TYPE_LABEL: Record<CouponType, string> = { PERCENT: 'Porcentaje', FIXED: 'Monto fijo', FREE_SHIPPING: 'Envío gratis' };

/** El formulario maneja fechas como YYYY-MM-DD; al guardar se convierten a ISO (inicio 00:00, fin 23:59). */
interface FormState { code: string; type: CouponType; value: string; minSubtotal: string; startsAt: string; endsAt: string; maxUses: string; isActive: boolean }
const empty: FormState = { code: '', type: 'PERCENT', value: '10', minSubtotal: '', startsAt: '', endsAt: '', maxUses: '', isActive: true };

const toDateInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const fromForm = (c: AdminCoupon): FormState => ({
  code: c.code, type: c.type, value: String(c.value), minSubtotal: c.minSubtotal === null ? '' : String(c.minSubtotal),
  startsAt: toDateInput(c.startsAt), endsAt: toDateInput(c.endsAt), maxUses: c.maxUses === null ? '' : String(c.maxUses), isActive: c.isActive,
});
const toInput = (f: FormState): CouponInput => ({
  code: f.code.trim().toUpperCase(),
  type: f.type,
  value: f.type === 'FREE_SHIPPING' ? 0 : Number(f.value),
  minSubtotal: f.minSubtotal === '' ? null : Number(f.minSubtotal),
  startsAt: f.startsAt ? new Date(`${f.startsAt}T00:00:00`).toISOString() : null,
  endsAt: f.endsAt ? new Date(`${f.endsAt}T23:59:59`).toISOString() : null,
  maxUses: f.maxUses === '' ? null : Number(f.maxUses),
  isActive: f.isActive,
});

const valueLabel = (c: AdminCoupon) => c.type === 'PERCENT' ? `${c.value}%` : c.type === 'FIXED' ? formatMXN(c.value) : '—';
const statusOf = (c: AdminCoupon): { label: string; tone: 'ok' | 'warn' | 'off' } => {
  const now = Date.now();
  if (!c.isActive) return { label: 'Pausado', tone: 'off' };
  if (c.endsAt && new Date(c.endsAt).getTime() < now) return { label: 'Vencido', tone: 'off' };
  if (c.maxUses !== null && c.usedCount >= c.maxUses) return { label: 'Agotado', tone: 'off' };
  if (c.startsAt && new Date(c.startsAt).getTime() > now) return { label: 'Programado', tone: 'warn' };
  return { label: 'Activo', tone: 'ok' };
};
const TONE_CLS = { ok: 'bg-green-100 text-green-800', warn: 'bg-amber-100 text-amber-800', off: 'bg-neutral-200 text-neutral-700' };

export default function AdminCouponsPage() {
  useDocumentTitle('Cupones');
  const { data, isLoading } = useAdminCoupons();
  const m = useCouponMutations();
  const toast = useToast((s) => s.push);
  const [editing, setEditing] = useState<AdminCoupon | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const open = (c: AdminCoupon | 'new') => { setEditing(c); setForm(c === 'new' ? empty : fromForm(c)); };
  const err = (editing ? m.create.error ?? m.update.error : null) as { message: string; details?: string[] } | null;
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const body = toInput(form);
    const onSuccess = () => { setEditing(null); toast('Cupón guardado'); };
    if (editing === 'new') m.create.mutate(body, { onSuccess });
    else if (editing) m.update.mutate({ id: editing.id, ...body }, { onSuccess });
  };
  const toggle = (c: AdminCoupon) => m.update.mutate({ id: c.id, isActive: !c.isActive }, { onSuccess: () => toast(c.isActive ? 'Cupón pausado' : 'Cupón activado') });
  const remove = (c: AdminCoupon) => {
    if (!window.confirm(`¿Eliminar el cupón ${c.code}? Los pedidos que ya lo usaron conservan el descuento.`)) return;
    m.remove.mutate(c.id, { onSuccess: () => toast('Cupón eliminado'), onError: (e) => toast(e.message, 'error') });
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cupones {data && <span className="text-base font-normal text-muted">({data.length})</span>}</h1>
        <Button onClick={() => open('new')}>Nuevo cupón</Button>
      </header>

      <div className="overflow-x-auto border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-xs uppercase text-muted">
            <tr><th className="p-3">Código</th><th className="p-3">Tipo</th><th className="p-3 text-right">Valor</th><th className="p-3 text-right">Mínimo</th><th className="p-3">Vigencia</th><th className="p-3 text-right">Usos</th><th className="p-3">Estado</th><th className="p-3" /></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={8} className="p-6 text-center text-muted">Cargando…</td></tr>}
            {data?.map((c) => {
              const s = statusOf(c);
              return (
                <tr key={c.id} className="border-t border-line hover:bg-paper">
                  <td className="p-3 font-mono font-semibold">{c.code}</td>
                  <td className="p-3">{TYPE_LABEL[c.type]}</td>
                  <td className="p-3 text-right tabular-nums">{valueLabel(c)}</td>
                  <td className="p-3 text-right tabular-nums text-muted">{c.minSubtotal === null ? '—' : formatMXN(c.minSubtotal)}</td>
                  <td className="p-3 text-muted">{c.startsAt || c.endsAt ? `${c.startsAt ? formatDate(c.startsAt) : 'Siempre'} → ${c.endsAt ? formatDate(c.endsAt) : 'sin fin'}` : 'Sin límite'}</td>
                  <td className="p-3 text-right tabular-nums">{c.usedCount}{c.maxUses !== null ? ` / ${c.maxUses}` : ''}</td>
                  <td className="p-3"><Badge className={TONE_CLS[s.tone]}>{s.label}</Badge></td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button variant="outline" className="!px-2 !py-1 text-xs" onClick={() => toggle(c)} loading={m.update.isPending && m.update.variables?.id === c.id}>{c.isActive ? 'Pausar' : 'Activar'}</Button>
                    <button onClick={() => open(c)} className="ml-2 p-1" aria-label={`Editar ${c.code}`}><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(c)} className="p-1 text-muted hover:text-accent" aria-label={`Eliminar ${c.code}`}><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              );
            })}
            {data && data.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-muted">Aún no hay cupones. Crea el primero, por ejemplo BIENVENIDO10.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Nuevo cupón' : 'Editar cupón'}>
        <form onSubmit={submit} className="space-y-4" noValidate>
          {err && <ErrorBox message={err.details?.join('. ') ?? err.message} />}
          <Input label="Código" required value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} hint="3 a 30 caracteres; letras, números, guion o guion bajo. Se guarda en mayúsculas." />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Tipo" value={form.type} onChange={(e) => set('type', e.target.value as CouponType)}>
              {(Object.keys(TYPE_LABEL) as CouponType[]).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
            </Select>
            {form.type !== 'FREE_SHIPPING' && (
              <Input label={form.type === 'PERCENT' ? 'Porcentaje (1-100)' : 'Monto en MXN'} type="number" min={form.type === 'PERCENT' ? 1 : 0.01} max={form.type === 'PERCENT' ? 100 : undefined} step={form.type === 'PERCENT' ? 1 : 0.01} required value={form.value} onChange={(e) => set('value', e.target.value)} />
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Compra mínima (opcional)" type="number" min={0} step={1} value={form.minSubtotal} onChange={(e) => set('minSubtotal', e.target.value)} hint="Subtotal mínimo para poder usarlo" />
            <Input label="Límite de usos (opcional)" type="number" min={1} step={1} value={form.maxUses} onChange={(e) => set('maxUses', e.target.value)} hint="Vacío = ilimitado" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Desde (opcional)" type="date" value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} />
            <Input label="Hasta (opcional)" type="date" value={form.endsAt} onChange={(e) => set('endsAt', e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-ink" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} /> Activo</label>
          <Button type="submit" loading={m.create.isPending || m.update.isPending}>Guardar</Button>
        </form>
      </Modal>
    </div>
  );
}
