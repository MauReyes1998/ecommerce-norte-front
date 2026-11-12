import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Gender } from '@/shared/types';
import { Button, ErrorBox, Input, Select, Textarea, useToast } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { AdminVariant, ProductInput } from '../api/admin.api';
import { useAdminCategories, useAdminProduct, useProductMutations } from '../hooks/useAdmin';
import { VariantsEditor } from '../components/VariantsEditor';
import { ImagesEditor } from '../components/ImagesEditor';

const empty: ProductInput = { name: '', description: '', gender: 'HOMBRE', categoryId: '', basePrice: 0, salePrice: null, isFeatured: false, isActive: true, variants: [] };

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isNew = !id;
  useDocumentTitle(isNew ? 'Nuevo producto' : 'Editar producto');
  const navigate = useNavigate();
  const toast = useToast((s) => s.push);
  const { data: product, isLoading } = useAdminProduct(id);
  const { data: categories } = useAdminCategories();
  const m = useProductMutations(id);
  const [form, setForm] = useState<ProductInput>(empty);
  const [variants, setVariants] = useState<AdminVariant[]>([]);

  useEffect(() => {
    if (!product) return;
    setForm({ name: product.name, slug: product.slug, description: product.description, gender: product.gender, categoryId: product.category.id,
      basePrice: product.basePrice, salePrice: product.salePrice, isFeatured: product.isFeatured, isActive: product.isActive, variants: [] });
    setVariants(product.variants);
  }, [product]);

  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const err = (m.create.error ?? m.update.error) as { message: string; details?: string[] } | null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const body: ProductInput = { ...form, slug: form.slug || undefined, salePrice: form.salePrice || null, variants };
    if (isNew) m.create.mutate(body, { onSuccess: (p) => { toast('Producto creado. Ahora sube sus fotos.'); navigate(`/admin/productos/${p.id}`); } });
    else m.update.mutate(body, { onSuccess: () => toast('Cambios guardados') });
  };

  if (!isNew && isLoading) return <p className="text-muted">Cargando…</p>;
  const subcats = categories?.filter((c) => c.parentId) ?? [];
  const skuPrefix = `NOR-${(form.name || 'XXX').replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase()}`;

  return (
    <form onSubmit={submit} className="max-w-5xl space-y-8" noValidate>
      <header className="flex items-center justify-between">
        <div><Link to="/admin/productos" className="text-xs text-muted hover:underline">← Productos</Link><h1 className="text-2xl font-bold">{isNew ? 'Nuevo producto' : form.name}</h1></div>
        <Button type="submit" loading={m.create.isPending || m.update.isPending}>{isNew ? 'Crear producto' : 'Guardar cambios'}</Button>
      </header>
      {err && <ErrorBox message={err.details?.join('. ') ?? err.message} />}

      <section className="grid gap-4 border border-line bg-white p-5 sm:grid-cols-2">
        <Input label="Nombre" required value={form.name} onChange={(e) => set('name', e.target.value)} className="sm:col-span-2" />
        <Input label="Slug (URL)" value={form.slug ?? ''} onChange={(e) => set('slug', e.target.value)} hint="Se genera solo si lo dejas vacío" />
        <Select label="Género" value={form.gender} onChange={(e) => set('gender', e.target.value as Gender)}>
          <option value="HOMBRE">Hombre</option><option value="MUJER">Mujer</option><option value="UNISEX">Unisex</option>
        </Select>
        <Select label="Categoría" required value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
          <option value="">Elige una…</option>
          {subcats.map((c) => <option key={c.id} value={c.id}>{categories?.find((p) => p.id === c.parentId)?.name} / {c.name}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Precio" type="number" min={1} step="0.01" required value={form.basePrice || ''} onChange={(e) => set('basePrice', Number(e.target.value))} />
          <Input label="Precio de oferta" type="number" min={1} step="0.01" value={form.salePrice ?? ''} onChange={(e) => set('salePrice', e.target.value ? Number(e.target.value) : null)} hint="Vacío = sin oferta" />
        </div>
        <Textarea label="Descripción" required minLength={10} value={form.description} onChange={(e) => set('description', e.target.value)} className="sm:col-span-2" />
        <div className="flex gap-6 text-sm sm:col-span-2">
          <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-ink" checked={!!form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} /> Destacado en inicio</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-ink" checked={form.isActive ?? true} onChange={(e) => set('isActive', e.target.checked)} /> Visible en la tienda</label>
        </div>
      </section>

      <section className="border border-line bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">Variantes (talla y color)</h2>
        <VariantsEditor variants={variants} onChange={setVariants} skuPrefix={skuPrefix} />
      </section>

      <section className="border border-line bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">Imágenes</h2>
        {isNew ? <p className="text-sm text-muted">Primero crea el producto; después podrás subir sus fotos aquí.</p> : (
          <ImagesEditor images={product?.images ?? []} uploading={m.upload.isPending}
            onUpload={(files) => m.upload.mutate(files, { onSuccess: () => toast('Imágenes subidas'), onError: (e) => toast(e.message, 'error') })}
            onReorder={(ids) => m.reorder.mutate(ids)} onRemove={(imageId) => confirm('¿Eliminar esta imagen?') && m.removeImage.mutate(imageId)} />
        )}
      </section>
    </form>
  );
}
