import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Heart, Truck } from 'lucide-react';
import { ProductVariant } from '@/shared/types';
import { Button, ErrorBox, Price, Skeleton, useToast } from '@/shared/ui';
import { cn, formatMXN, GENDER_LABEL } from '@/shared/lib/format';
import { useSeo } from '@/shared/hooks/useDocumentTitle';
import { useCart, FREE_SHIPPING_FROM } from '@/features/cart';
import { useFavorites } from '@/features/account';
import { ProductGrid } from '@/features/catalog';
import { useProduct, useRelated } from '../hooks/useProduct';
import { Gallery } from '../components/Gallery';
import { VariantPicker } from '../components/VariantPicker';
import { SizeGuide } from '../components/SizeGuide';

export default function ProductPage() {
  const { slug = '' } = useParams();
  const { data: product, isLoading, error } = useProduct(slug);
  const related = useRelated(slug);
  const cart = useCart();
  const toast = useToast((s) => s.push);
  const favorites = useFavorites();
  useSeo({
    title: product?.name,
    description: product ? `${product.name} desde ${formatMXN(product.currentPrice)}. ${product.description}` : undefined,
    image: product?.images[0]?.url,
    path: `/producto/${slug}`,
    type: 'product',
  });

  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Preselecciona el primer color con stock al cargar.
  useEffect(() => {
    if (!product) return;
    const first = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
    setColor(first?.color ?? null); setSize(null); setTouched(false);
  }, [product]);

  const variant: ProductVariant | undefined = useMemo(
    () => product?.variants.find((v) => v.color === color && v.size === size), [product, color, size]);

  if (error) return <div className="container-x py-20"><ErrorBox message={error.message} /><Link to="/tienda" className="btn-outline mt-6">Ir a la tienda</Link></div>;
  if (isLoading || !product) {
    return <div className="container-x grid gap-10 py-10 md:grid-cols-2"><Skeleton className="aspect-product" /><div className="space-y-4"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-6 w-1/4" /><Skeleton className="h-40" /></div></div>;
  }

  const isShoes = product.variants.some((v) => /^\d/.test(v.size));

  const addToCart = () => {
    setTouched(true);
    if (!variant) return;
    cart.add({ variantId: variant.id, productId: product.id, slug: product.slug, name: product.name, imageUrl: product.images[0]?.url ?? null,
      size: variant.size, color: variant.color, unitPrice: variant.currentPrice, maxStock: variant.stock });
    toast('Agregado a tu bolsa');
  };

  return (
    <div className="container-x py-8">
      <nav className="mb-6 text-xs text-muted" aria-label="Migas de pan">
        <Link to="/" className="hover:underline">Inicio</Link> / <Link to={`/tienda/${product.gender.toLowerCase()}`} className="hover:underline">{GENDER_LABEL[product.gender]}</Link> / <Link to={`/tienda/${product.category.slug}`} className="hover:underline">{product.category.name}</Link>
      </nav>

      <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
        <Gallery images={product.images} name={product.name} />

        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
              <button onClick={() => favorites.toggle(product)} aria-pressed={favorites.ids.has(product.id)} aria-label="Favorito" className="rounded-full border border-line p-2 hover:border-ink">
                <Heart className={cn('h-5 w-5', favorites.ids.has(product.id) && 'fill-accent text-accent')} />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <Price price={variant?.price ?? product.price} salePrice={variant?.salePrice ?? product.salePrice} size="lg" />
              {product.onSale && <span className="bg-accent px-2 py-0.5 text-xs font-bold text-white">-{product.discountPercent}%</span>}
            </div>
          </div>

          <VariantPicker variants={product.variants} color={color} size={size} onColor={(c) => { setColor(c); setSize(null); }} onSize={setSize} />

          {touched && !variant && <p className="text-sm text-accent" role="alert">Elige una talla para continuar.</p>}
          {variant && variant.stock > 0 && variant.stock <= 3 && <p className="text-sm text-accent">Quedan {variant.stock}</p>}

          <Button full onClick={addToCart} disabled={!!variant && variant.stock === 0}>
            {variant && variant.stock === 0 ? 'Agotado' : 'Agregar a la bolsa'}
          </Button>

          <p className="flex items-center gap-2 text-sm text-muted"><Truck className="h-4 w-4" /> Envío gratis desde {formatMXN(FREE_SHIPPING_FROM)} · 3 a 5 días hábiles</p>

          <details open className="border-t border-line py-4">
            <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide">Descripción</summary>
            <p className="mt-3 text-sm leading-relaxed text-neutral-700">{product.description}</p>
          </details>
          <SizeGuide shoes={isShoes} />
          <details className="border-t border-line py-4">
            <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide">Envíos y cambios</summary>
            <p className="mt-3 text-sm leading-relaxed text-neutral-700">Enviamos a todo México. Tienes 30 días para cambios por talla en prendas sin usar y con etiqueta.</p>
          </details>
        </div>
      </div>

      {related.data && related.data.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-2xl font-bold">También te puede gustar</h2>
          <ProductGrid products={related.data} favorites={favorites.ids} onToggleFavorite={favorites.toggle} />
        </section>
      )}
    </div>
  );
}
