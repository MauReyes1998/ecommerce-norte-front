import { Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui';
import { AdminVariant } from '../api/admin.api';

interface Props { variants: AdminVariant[]; onChange: (v: AdminVariant[]) => void; skuPrefix: string }

const CLOTHING = ['XS', 'S', 'M', 'L', 'XL'];
const SHOES = ['25', '25.5', '26', '26.5', '27', '27.5', '28', '29'];

const skuFor = (prefix: string, color: string, size: string) => `${prefix}-${color.normalize('NFD').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'COL'}-${size.replace('.', '')}`;

/** Tabla editable de variantes con generador por color × tallas. */
export function VariantsEditor({ variants, onChange, skuPrefix }: Props) {
  const update = (i: number, patch: Partial<AdminVariant>) => onChange(variants.map((v, k) => (k === i ? { ...v, ...patch } : v)));
  const remove = (i: number) => onChange(variants.filter((_, k) => k !== i));

  const generate = (sizes: string[]) => {
    const color = prompt('Color (p. ej. Negro):')?.trim();
    if (!color) return;
    const hex = prompt('Color en hex (opcional, p. ej. #111111):')?.trim() || null;
    const existing = new Set(variants.map((v) => `${v.color}|${v.size}`));
    const added = sizes.filter((s) => !existing.has(`${color}|${s}`)).map((size) => ({ sku: skuFor(skuPrefix, color, size), size, color, colorHex: hex && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : null, stock: 0, isActive: true }));
    onChange([...variants, ...added]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => generate(CLOTHING)}>+ Color con tallas XS–XL</Button>
        <Button type="button" variant="outline" onClick={() => generate(SHOES)}>+ Color con tallas de calzado</Button>
        <Button type="button" variant="ghost" onClick={() => onChange([...variants, { sku: '', size: '', color: '', stock: 0, isActive: true }])}>+ Variante suelta</Button>
      </div>
      {variants.length === 0 ? <p className="text-sm text-muted">Agrega al menos una variante (talla + color).</p> : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full text-sm">
            <thead className="bg-paper text-left text-xs uppercase text-muted">
              <tr><th className="p-2">SKU</th><th className="p-2">Talla</th><th className="p-2">Color</th><th className="p-2">Hex</th><th className="p-2">Stock</th><th className="p-2">Precio*</th><th className="p-2">Oferta*</th><th className="p-2">Activa</th><th /></tr>
            </thead>
            <tbody>
              {variants.map((v, i) => (
                <tr key={v.id ?? i} className="border-t border-line">
                  <td className="p-1"><input className="input !py-1" value={v.sku} onChange={(e) => update(i, { sku: e.target.value })} aria-label="SKU" required /></td>
                  <td className="p-1"><input className="input !py-1 w-16" value={v.size} onChange={(e) => update(i, { size: e.target.value })} aria-label="Talla" required /></td>
                  <td className="p-1"><input className="input !py-1 w-28" value={v.color} onChange={(e) => update(i, { color: e.target.value })} aria-label="Color" required /></td>
                  <td className="p-1"><input type="color" className="h-8 w-10 cursor-pointer border border-line" value={v.colorHex ?? '#cccccc'} onChange={(e) => update(i, { colorHex: e.target.value })} aria-label="Hex" /></td>
                  <td className="p-1"><input type="number" min={0} className="input !py-1 w-20" value={v.stock} onChange={(e) => update(i, { stock: Number(e.target.value) })} aria-label="Stock" /></td>
                  <td className="p-1"><input type="number" min={0} step="0.01" className="input !py-1 w-24" value={v.price ?? ''} placeholder="—" onChange={(e) => update(i, { price: e.target.value ? Number(e.target.value) : null })} aria-label="Precio propio" /></td>
                  <td className="p-1"><input type="number" min={0} step="0.01" className="input !py-1 w-24" value={v.salePrice ?? ''} placeholder="—" onChange={(e) => update(i, { salePrice: e.target.value ? Number(e.target.value) : null })} aria-label="Precio de oferta propio" /></td>
                  <td className="p-1 text-center"><input type="checkbox" className="accent-ink" checked={v.isActive ?? true} onChange={(e) => update(i, { isActive: e.target.checked })} aria-label="Activa" /></td>
                  <td className="p-1"><button type="button" onClick={() => remove(i)} className="p-1 text-muted hover:text-accent" aria-label="Quitar variante"><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-muted">* Si la variante no tiene precio propio, usa el del producto.</p>
    </div>
  );
}
