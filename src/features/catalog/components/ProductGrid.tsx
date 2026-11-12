import { ProductSummary } from '@/shared/types';
import { Empty, ProductCardSkeleton } from '@/shared/ui';
import { ProductCard } from './ProductCard';

interface Props {
  products?: ProductSummary[];
  loading?: boolean;
  favorites?: Set<string>;
  onToggleFavorite?: (p: ProductSummary) => void;
  emptyText?: string;
}

export function ProductGrid({ products, loading, favorites, onToggleFavorite, emptyText = 'No encontramos productos con esos filtros.' }: Props) {
  if (loading && !products) {
    return <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>;
  }
  if (!products?.length) return <Empty title={emptyText} />;
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} favorite={favorites?.has(p.id)} onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(p) : undefined} />
      ))}
    </div>
  );
}
