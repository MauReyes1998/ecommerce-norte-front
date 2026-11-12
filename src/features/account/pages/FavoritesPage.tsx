import { Link } from 'react-router-dom';
import { Empty } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { ProductGrid } from '@/features/catalog';
import { useFavoriteList, useFavorites } from '../hooks/useFavorites';

export default function FavoritesPage() {
  useDocumentTitle('Favoritos');
  const { data, isLoading } = useFavoriteList();
  const favorites = useFavorites();
  if (!isLoading && !data?.length) return <Empty title="Aún no guardas favoritos"><Link to="/tienda" className="underline">Explora la tienda</Link></Empty>;
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Favoritos</h1>
      <ProductGrid products={data} loading={isLoading} favorites={favorites.ids} onToggleFavorite={favorites.toggle} />
    </>
  );
}
