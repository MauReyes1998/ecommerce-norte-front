import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { assetUrl } from '@/shared/lib/http';
import { ProductSummary } from '@/shared/types';
import { Price } from '@/shared/ui';
import { cn } from '@/shared/lib/format';

interface Props { product: ProductSummary; favorite?: boolean; onToggleFavorite?: () => void }

export function ProductCard({ product, favorite, onToggleFavorite }: Props) {
  const [first, second] = product.images;
  return (
    <article className="group relative">
      <Link to={`/producto/${product.slug}`} className="block" aria-label={product.name}>
        <div className="relative aspect-product overflow-hidden bg-neutral-100">
          <img src={assetUrl(first?.url)} alt={first?.alt ?? product.name} loading="lazy"
            className={cn('h-full w-full object-cover transition duration-500', second && 'group-hover:opacity-0')} />
          {second && <img src={assetUrl(second.url)} alt="" aria-hidden loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100" />}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.onSale && <span className="bg-accent px-2 py-0.5 text-[11px] font-bold uppercase text-white">-{product.discountPercent}%</span>}
            {product.isNew && !product.onSale && <span className="bg-ink px-2 py-0.5 text-[11px] font-bold uppercase text-white">Nuevo</span>}
            {!product.inStock && <span className="bg-white px-2 py-0.5 text-[11px] font-bold uppercase">Agotado</span>}
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="truncate text-sm font-medium">{product.name}</h3>
          <Price price={product.price} salePrice={product.salePrice} size="sm" />
          {product.colors.length > 1 && (
            <div className="flex gap-1 pt-1" aria-label={`${product.colors.length} colores`}>
              {product.colors.slice(0, 6).map((c) => (
                <span key={c.name} title={c.name} className="h-3 w-3 rounded-full border border-line" style={{ background: c.hex ?? '#ddd' }} />
              ))}
            </div>
          )}
        </div>
      </Link>
      {onToggleFavorite && (
        <button onClick={onToggleFavorite} aria-pressed={favorite} aria-label={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow-sm hover:bg-white">
          <Heart className={cn('h-4 w-4', favorite && 'fill-accent text-accent')} />
        </button>
      )}
    </article>
  );
}
