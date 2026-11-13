import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Trash2 } from 'lucide-react';
import { Button, ErrorBox, Input, Pagination, Textarea, useToast } from '@/shared/ui';
import { cn, formatDate } from '@/shared/lib/format';
import { useAuth } from '@/features/auth';
import { Review } from '../api/product.api';
import { useReviewMutations, useReviews } from '../hooks/useReviews';

/** Estrellas de solo lectura o, con onChange, selector de calificación. */
function Stars({ value, onChange, size = 'h-4 w-4', label }: { value: number; onChange?: (n: number) => void; size?: string; label?: string }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <span className={cn('inline-flex items-center gap-0.5', onChange && 'cursor-pointer')} role={onChange ? 'radiogroup' : 'img'} aria-label={label ?? `${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
            onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => onChange(n)} className="p-0.5">
            <Star className={cn(size, n <= shown ? 'fill-amber-400 text-amber-400' : 'text-neutral-300')} />
          </button>
        ) : (
          <Star key={n} className={cn(size, n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300')} aria-hidden />
        ),
      )}
    </span>
  );
}

const empty = { rating: 5, title: '', body: '' };

export function Reviews({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useReviews(slug, page);
  const m = useReviewMutations(slug);
  const toast = useToast((s) => s.push);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(empty);

  // Si ya reseñó, el formulario arranca con su reseña para editarla.
  useEffect(() => {
    if (data?.mine) setForm({ rating: data.mine.rating, title: data.mine.title ?? '', body: data.mine.body });
  }, [data?.mine]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    m.save.mutate({ rating: form.rating, title: form.title || undefined, body: form.body }, {
      onSuccess: () => { setEditing(false); toast(data?.mine ? 'Reseña actualizada' : 'Gracias por tu reseña'); },
    });
  };
  const remove = (r: Review) => {
    if (!window.confirm('¿Eliminar esta reseña?')) return;
    m.remove.mutate(r.id, { onSuccess: () => toast('Reseña eliminada'), onError: (e) => toast(e.message, 'error') });
  };

  if (error) return null; // la ficha del producto no se cae por las reseñas
  const summary = data?.summary;
  const showForm = !!data?.canReview && (editing || !data.mine);
  const saveErr = m.save.error as { message: string; details?: string[] } | null;

  return (
    <section className="mt-20 border-t border-line pt-10" aria-labelledby="resenas">
      <h2 id="resenas" className="mb-6 text-2xl font-bold">Reseñas</h2>
      <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
        {/* Resumen y formulario */}
        <div className="space-y-6">
          {summary && summary.count > 0 ? (
            <div>
              <p className="flex items-end gap-3"><span className="text-5xl font-black leading-none">{summary.average.toFixed(1)}</span><span className="pb-1 text-sm text-muted">de 5 · {summary.count} {summary.count === 1 ? 'reseña' : 'reseñas'}</span></p>
              <Stars value={summary.average} size="h-5 w-5" />
              <ul className="mt-4 space-y-1 text-xs">
                {([5, 4, 3, 2, 1] as const).map((n) => (
                  <li key={n} className="flex items-center gap-2">
                    <span className="w-3 text-right">{n}</span><Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
                    <span className="h-2 flex-1 bg-neutral-100"><span className="block h-2 bg-amber-400" style={{ width: `${(summary.distribution[n] / summary.count) * 100}%` }} /></span>
                    <span className="w-6 text-muted">{summary.distribution[n]}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : !isLoading && <p className="text-sm text-muted">Este producto aún no tiene reseñas.</p>}

          {showForm ? (
            <form onSubmit={submit} className="space-y-3 border border-line p-4" noValidate>
              <p className="text-sm font-semibold">{data?.mine ? 'Edita tu reseña' : 'Compraste este producto: cuéntanos qué tal'}</p>
              {saveErr && <ErrorBox message={saveErr.details?.join('. ') ?? saveErr.message} />}
              <div><span className="label">Calificación</span><Stars value={form.rating} onChange={(n) => setForm({ ...form, rating: n })} size="h-6 w-6" label="Elige tu calificación" /></div>
              <Input label="Título (opcional)" maxLength={80} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Textarea label="Tu reseña" required minLength={10} maxLength={1000} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} hint="Talla, tela, cómo te quedó… lo que le sirva a otro cliente." />
              <div className="flex gap-2">
                <Button type="submit" loading={m.save.isPending}>Publicar</Button>
                {data?.mine && <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>}
              </div>
            </form>
          ) : data?.mine ? (
            <p className="text-sm text-muted">Ya reseñaste este producto. <button onClick={() => setEditing(true)} className="underline">Editar</button></p>
          ) : !user ? (
            <p className="text-sm text-muted"><Link to="/cuenta/entrar" className="underline">Inicia sesión</Link> para dejar una reseña si ya lo compraste.</p>
          ) : data && !data.canReview ? (
            <p className="text-sm text-muted">Solo quienes ya compraron este producto pueden reseñarlo.</p>
          ) : null}
        </div>

        {/* Lista */}
        <div>
          {isLoading && <p className="text-sm text-muted">Cargando reseñas…</p>}
          <ul className="divide-y divide-line">
            {data?.data.map((r) => (
              <li key={r.id} className="py-5">
                <div className="flex items-center justify-between gap-3">
                  <Stars value={r.rating} />
                  <span className="text-xs text-muted">{formatDate(r.createdAt)}</span>
                </div>
                {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
                <p className="mt-1 text-sm leading-relaxed text-neutral-700">{r.body}</p>
                <p className="mt-2 flex items-center gap-3 text-xs text-muted">
                  <span>{r.author}{r.isMine ? ' (tú)' : ''} · Compra verificada</span>
                  {user?.role === 'ADMIN' && (
                    <button onClick={() => remove(r)} className="inline-flex items-center gap-1 text-muted hover:text-accent" aria-label="Eliminar reseña"><Trash2 className="h-3.5 w-3.5" /> Eliminar</button>
                  )}
                </p>
              </li>
            ))}
          </ul>
          {data && data.meta.totalPages > 1 && <Pagination meta={data.meta} onPage={setPage} />}
        </div>
      </div>
    </section>
  );
}
