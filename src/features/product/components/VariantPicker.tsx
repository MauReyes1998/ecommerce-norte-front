import { useMemo } from 'react';
import { ProductVariant } from '@/shared/types';
import { cn } from '@/shared/lib/format';

interface Props {
  variants: ProductVariant[];
  color: string | null;
  size: string | null;
  onColor: (c: string) => void;
  onSize: (s: string) => void;
}

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
const sortSizes = (a: string, b: string) => {
  const ia = SIZE_ORDER.indexOf(a), ib = SIZE_ORDER.indexOf(b);
  if (ia !== -1 && ib !== -1) return ia - ib;
  if (ia !== -1) return -1;
  if (ib !== -1) return 1;
  return Number(a) - Number(b);
};

export function VariantPicker({ variants, color, size, onColor, onSize }: Props) {
  const colors = useMemo(() => {
    const m = new Map<string, string | null>();
    variants.forEach((v) => m.set(v.color, v.colorHex));
    return [...m].map(([name, hex]) => ({ name, hex, inStock: variants.some((v) => v.color === name && v.stock > 0) }));
  }, [variants]);

  const sizes = useMemo(() => {
    const names = [...new Set(variants.map((v) => v.size))].sort(sortSizes);
    return names.map((s) => ({ name: s, inStock: variants.some((v) => v.size === s && (!color || v.color === color) && v.stock > 0) }));
  }, [variants, color]);

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="label">Color{color && <span className="ml-1 normal-case text-ink">· {color}</span>}</legend>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button key={c.name} onClick={() => onColor(c.name)} aria-pressed={color === c.name} aria-label={c.name} title={c.name}
              className={cn('relative h-9 w-9 rounded-full border-2', color === c.name ? 'border-ink ring-2 ring-ink ring-offset-2' : 'border-line', !c.inStock && 'opacity-40')}
              style={{ background: c.hex ?? '#ddd' }}>
              {!c.inStock && <span className="absolute inset-0 rotate-45 border-t border-ink" aria-hidden />}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="label flex items-center justify-between">Talla <a href="#guia-tallas" className="normal-case underline">Guía de tallas</a></legend>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button key={s.name} onClick={() => onSize(s.name)} aria-pressed={size === s.name} disabled={!s.inStock}
              className={cn('min-w-[3rem] border px-3 py-2 text-sm', size === s.name ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink',
                !s.inStock && 'cursor-not-allowed text-neutral-300 line-through hover:border-line')}>
              {s.name}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
