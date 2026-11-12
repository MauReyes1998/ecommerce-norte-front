import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { assetUrl } from '@/shared/lib/http';
import { formatMXN } from '@/shared/lib/format';
import { CartItem, MAX_QTY } from '../store/cart.store';

interface Props { item: CartItem; onQuantity: (q: number) => void; onRemove: () => void; compact?: boolean }

export function CartLine({ item, onQuantity, onRemove, compact }: Props) {
  const cap = Math.min(MAX_QTY, item.maxStock);
  return (
    <div className="flex gap-4 py-4">
      <Link to={`/producto/${item.slug}`} className="w-20 shrink-0">
        <img src={assetUrl(item.imageUrl)} alt={item.name} className="aspect-product w-full object-cover" loading="lazy" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-2">
          <Link to={`/producto/${item.slug}`} className="truncate text-sm font-semibold hover:underline">{item.name}</Link>
          <span className="text-sm font-semibold">{formatMXN(item.unitPrice * item.quantity)}</span>
        </div>
        <p className="text-xs text-muted">{item.size} · {item.color}</p>
        {!compact && (
          <div className="mt-auto flex items-center justify-between pt-2">
            <div className="inline-flex items-center border border-line" role="group" aria-label={`Cantidad de ${item.name}`}>
              <button className="px-2 py-1 hover:bg-neutral-100 disabled:opacity-40" onClick={() => onQuantity(item.quantity - 1)} aria-label="Quitar uno"><Minus className="h-3.5 w-3.5" /></button>
              <span className="w-8 text-center text-sm" aria-live="polite">{item.quantity}</span>
              <button className="px-2 py-1 hover:bg-neutral-100 disabled:opacity-40" disabled={item.quantity >= cap} onClick={() => onQuantity(item.quantity + 1)} aria-label="Agregar uno"><Plus className="h-3.5 w-3.5" /></button>
            </div>
            <button onClick={onRemove} className="p-1 text-muted hover:text-accent" aria-label={`Eliminar ${item.name}`}><Trash2 className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
