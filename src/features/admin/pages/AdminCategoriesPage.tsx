import { FormEvent, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button, ErrorBox, Input, Modal, Select, useToast } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { AdminCategory, CategoryInput } from '../api/admin.api';
import { useAdminCategories, useCategoryMutations } from '../hooks/useAdmin';

const empty: CategoryInput = { name: '', parentId: null, sortOrder: 0, isActive: true, imageUrl: '' };

export default function AdminCategoriesPage() {
  useDocumentTitle('Categorías');
  const { data, isLoading } = useAdminCategories();
  const m = useCategoryMutations();
  const toast = useToast((s) => s.push);
  const [editing, setEditing] = useState<AdminCategory | 'new' | null>(null);
  const [form, setForm] = useState<CategoryInput>(empty);
  const open = (c: AdminCategory | 'new') => { setEditing(c); setForm(c === 'new' ? empty : { name: c.name, slug: c.slug, parentId: c.parentId, sortOrder: c.sortOrder, isActive: c.isActive, imageUrl: c.imageUrl ?? '' }); };
  const err = (m.create.error ?? m.update.error ?? m.remove.error) as { message: string; details?: string[] } | null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const body = { ...form, slug: form.slug || undefined, imageUrl: form.imageUrl || null, parentId: form.parentId || null };
    const onSuccess = () => { setEditing(null); toast('Categoría guardada'); };
    if (editing === 'new') m.create.mutate(body, { onSuccess });
    else m.update.mutate({ id: (editing as AdminCategory).id, ...body }, { onSuccess });
  };

  const roots = data?.filter((c) => !c.parentId) ?? [];
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between"><h1 className="text-2xl font-bold">Categorías</h1><Button onClick={() => open('new')}>Nueva categoría</Button></header>
      {m.remove.error && <ErrorBox message={m.remove.error.message} />}
      {isLoading ? <p className="text-muted">Cargando…</p> : (
        <div className="grid gap-6 lg:grid-cols-2">
          {roots.map((root) => (
            <section key={root.id} className="border border-line bg-white">
              <header className="flex items-center justify-between border-b border-line bg-paper p-3">
                <h2 className="font-bold">{root.name} <span className="text-xs font-normal text-muted">/{root.slug}</span></h2>
                <button onClick={() => open(root)} className="p-1" aria-label={`Editar ${root.name}`}><Pencil className="h-4 w-4" /></button>
              </header>
              <ul>
                {data?.filter((c) => c.parentId === root.id).map((c) => (
                  <li key={c.id} className="flex items-center gap-3 border-t border-line px-3 py-2 text-sm">
                    <span className={c.isActive ? '' : 'text-muted line-through'}>{c.name}</span>
                    <span className="text-xs text-muted">/{c.slug}</span>
                    {c.productCount !== undefined && <span className="text-xs text-muted">· {c.productCount} productos</span>}
                    <span className="ml-auto flex gap-1">
                      <button onClick={() => open(c)} className="p-1" aria-label={`Editar ${c.name}`}><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => confirm(`¿Eliminar "${c.name}"?`) && m.remove.mutate(c.id, { onSuccess: () => toast('Categoría eliminada') })} className="p-1 text-muted hover:text-accent" aria-label={`Eliminar ${c.name}`}><Trash2 className="h-4 w-4" /></button>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Nueva categoría' : 'Editar categoría'}>
        <form onSubmit={submit} className="space-y-4" noValidate>
          {err && editing && <ErrorBox message={err.details?.join('. ') ?? err.message} />}
          <Input label="Nombre" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Slug" value={form.slug ?? ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} hint="Se genera del nombre si lo dejas vacío" />
          <Select label="Categoría padre" value={form.parentId ?? ''} onChange={(e) => setForm({ ...form, parentId: e.target.value || null })}>
            <option value="">Ninguna (es raíz)</option>
            {roots.filter((r) => !editing || editing === 'new' || r.id !== editing.id).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
          <Input label="URL de imagen (opcional)" value={form.imageUrl ?? ''} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          <Input label="Orden" type="number" min={0} value={form.sortOrder ?? 0} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-ink" checked={form.isActive ?? true} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Activa</label>
          <Button type="submit" loading={m.create.isPending || m.update.isPending}>Guardar</Button>
        </form>
      </Modal>
    </div>
  );
}
