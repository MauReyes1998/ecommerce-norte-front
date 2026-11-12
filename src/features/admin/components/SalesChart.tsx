import { useId, useState } from 'react';
import { formatMXN } from '@/shared/lib/format';

interface Day { date: string; revenue: number; orders: number }

/** Barras diarias a escala, con ejes, línea de promedio y tooltip. Sin librerías. */
export function SalesChart({ data }: { data: Day[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const id = useId();
  const W = 720, H = 220, L = 56, R = 12, T = 16, B = 34;
  const max = Math.max(100, ...data.map((d) => d.revenue));
  const nice = Math.ceil(max / 4 / 100) * 100 * 4;
  const avg = data.reduce((a, d) => a + d.revenue, 0) / Math.max(1, data.length);
  const bw = (W - L - R) / data.length;
  const y = (v: number) => T + (H - T - B) * (1 - v / nice);
  const label = (iso: string) => { const d = new Date(iso + 'T12:00:00'); return `${d.getDate()}/${d.getMonth() + 1}`; };
  const step = data.length > 40 ? 10 : data.length > 10 ? 5 : 1;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-labelledby={id}>
        <title id={id}>Ventas por día</title>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1={L} x2={W - R} y1={y(nice * f)} y2={y(nice * f)} stroke="#E5E5E5" strokeDasharray={f === 0 ? undefined : '2 3'} />
            <text x={L - 8} y={y(nice * f) + 4} textAnchor="end" fontSize="11" fill="#6B6B6B">{f === 0 ? '0' : `$${Math.round(nice * f / 1000)}k`}</text>
          </g>
        ))}
        {data.map((d, i) => (
          <g key={d.date} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <rect x={L + i * bw} y={T} width={bw} height={H - T - B} fill="transparent" />
            <rect x={L + i * bw + bw * 0.18} y={y(d.revenue)} width={bw * 0.64} height={y(0) - y(d.revenue)} fill={hover === i ? '#C8102E' : '#111111'} rx={1} />
            {i % step === 0 && <text x={L + i * bw + bw / 2} y={H - 12} textAnchor="middle" fontSize="11" fill="#6B6B6B">{label(d.date)}</text>}
          </g>
        ))}
        <line x1={L} x2={W - R} y1={y(avg)} y2={y(avg)} stroke="#C8102E" strokeDasharray="4 3" />
        <text x={W - R} y={y(avg) - 4} textAnchor="end" fontSize="10" fill="#C8102E">promedio {formatMXN(avg)}</text>
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 bg-ink px-3 py-1.5 text-xs text-white">
          {label(data[hover].date)} · {formatMXN(data[hover].revenue)} · {data[hover].orders} pedidos
        </div>
      )}
    </div>
  );
}
