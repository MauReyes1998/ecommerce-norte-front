import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { formatMXN, ORDER_STATUS_LABEL } from '@/shared/lib/format';
import { Badge, ErrorBox, Skeleton } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { DashboardRange } from '../api/admin.api';
import { useDashboard } from '../hooks/useAdmin';
import { SalesChart } from '../components/SalesChart';

const Stat = ({ label, value, sub, delta }: { label: string; value: string; sub?: string; delta?: number | null }) => (
  <div className="border border-line bg-white p-5">
    <p className="label">{label}</p>
    <p className="text-2xl font-bold tabular-nums">{value}</p>
    <div className="flex items-center gap-2 text-xs text-muted">
      {delta !== undefined && delta !== null && (
        <span className={`inline-flex items-center gap-0.5 font-semibold ${delta >= 0 ? 'text-green-700' : 'text-accent'}`}>
          {delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{Math.abs(delta)}%
        </span>
      )}
      {sub && <span>{sub}</span>}
    </div>
  </div>
);

export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const [range, setRange] = useState<DashboardRange>(30);
  const { data, isLoading } = useDashboard(range);
  if (isLoading || !data) return <div className="grid gap-4 sm:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-24" />)}</div>;
  // Si el backend es una versión anterior, estas listas vienen vacías en lugar de tronar.
  const salesByCategory = data.salesByCategory ?? [];
  const recentOrders = data.recentOrders ?? [];
  const topProducts = data.topProducts ?? [];
  const lowStock = data.lowStock ?? [];
  const outdated = !data.salesByCategory || !data.range;
  const maxCat = Math.max(1, ...salesByCategory.map((c) => c.revenue));
  if (outdated) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <ErrorBox message="El backend que está corriendo es una versión anterior. Detenlo y vuelve a arrancarlo con npm run start:dev (y corre npx prisma migrate dev si aún no lo has hecho)." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="inline-flex border border-line bg-white text-sm" role="group" aria-label="Rango">
          {([7, 30, 90] as DashboardRange[]).map((r) => (
            <button key={r} onClick={() => setRange(r)} aria-pressed={range === r} className={`px-3 py-1.5 ${range === r ? 'bg-ink text-white' : 'hover:bg-neutral-100'}`}>{r} días</button>
          ))}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label={`Ventas · ${range} días`} value={formatMXN(data.range.revenue)} delta={data.revenueChangePct} sub={`vs. ${range} días anteriores`} />
        <Stat label="Pedidos pagados" value={String(data.range.orders)} sub={`${data.range.unitsSold} piezas vendidas`} />
        <Stat label="Ticket promedio" value={formatMXN(data.range.avgTicket)} />
        <Stat label="Conversión" value={`${data.conversion.rate}%`} sub={`${data.conversion.paid} pagados de ${data.conversion.created} creados · ${data.conversion.cancelled} cancelados`} />
        <Stat label="Clientes nuevos" value={String(data.range.newCustomers)} sub="cuentas registradas" />
        <Stat label="Pendientes de pago" value={String(data.pendingOrders)} sub={data.pendingOrders > 0 ? 'revisa si hay pagos por confirmar' : 'todo al día'} />
      </div>

      <section className="border border-line bg-white p-5">
        <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide">Ventas por día</h2>
          <p className="text-xs text-muted">Hoy: {formatMXN(data.today.revenue)} ({data.today.orders}) · Este mes: {formatMXN(data.month.revenue)} ({data.month.orders})</p>
        </header>
        <SalesChart data={data.salesByDay} />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="border border-line bg-white p-5 lg:col-span-2">
          <h2 className="mb-3 flex items-center justify-between text-sm font-semibold uppercase tracking-wide">Últimos pedidos <Link to="/admin/pedidos" className="text-xs font-normal normal-case underline">Ver todos</Link></h2>
          <table className="w-full text-sm">
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-t border-line">
                  <td className="py-2 font-semibold"><Link to={`/admin/pedidos?open=${o.id}`} className="hover:underline">NOR-{String(o.number).padStart(6, '0')}</Link></td>
                  <td className="py-2">{o.customerName || o.email}</td>
                  <td className="py-2"><Badge tone={o.status}>{ORDER_STATUS_LABEL[o.status]}</Badge></td>
                  <td className="py-2 text-right font-semibold tabular-nums">{formatMXN(o.total)}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && <tr><td className="py-4 text-muted">Sin pedidos todavía.</td></tr>}
            </tbody>
          </table>
        </section>

        <section className="border border-line bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">Ventas por categoría</h2>
          {salesByCategory.length === 0 ? <p className="text-sm text-muted">Sin ventas en el rango.</p> : (
            <ul className="space-y-3 text-sm">
              {salesByCategory.slice(0, 8).map((c) => (
                <li key={c.categoryId}>
                  <div className="flex justify-between"><span>{c.categoryName}</span><span className="tabular-nums text-muted">{c.units} pzas · {formatMXN(c.revenue)}</span></div>
                  <div className="mt-1 h-1.5 bg-neutral-100"><div className="h-full bg-ink" style={{ width: `${(c.revenue / maxCat) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-line bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">Más vendidos este mes</h2>
          {topProducts.length === 0 ? <p className="text-sm text-muted">Sin ventas todavía.</p> : (
            <table className="w-full text-sm"><tbody>
              {topProducts.map((p, i) => (
                <tr key={p.productId ?? i} className="border-t border-line"><td className="py-2">{p.productName}</td><td className="py-2 text-right text-muted">{p.units} pzas</td><td className="py-2 text-right font-semibold tabular-nums">{formatMXN(p.revenue)}</td></tr>
              ))}
            </tbody></table>
          )}
        </section>
        <section className="border border-line bg-white p-5">
          <h2 className="mb-3 flex items-center justify-between text-sm font-semibold uppercase tracking-wide">Stock bajo <Link to="/admin/productos?lowStock=1" className="text-xs font-normal normal-case underline">Ver todos</Link></h2>
          {lowStock.length === 0 ? <p className="text-sm text-muted">Todo con stock suficiente.</p> : (
            <table className="w-full text-sm"><tbody>
              {lowStock.slice(0, 8).map((v) => (
                <tr key={v.variantId} className="border-t border-line"><td className="py-2">{v.productName}<span className="block text-xs text-muted">{v.sku} · {v.size} / {v.color}</span></td><td className={`py-2 text-right font-bold ${v.stock === 0 ? 'text-accent' : 'text-amber-700'}`}>{v.stock}</td></tr>
              ))}
            </tbody></table>
          )}
        </section>
      </div>
    </div>
  );
}
