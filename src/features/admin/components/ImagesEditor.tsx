import { useRef } from 'react';
import { ArrowLeft, ArrowRight, Trash2, Upload } from 'lucide-react';
import { assetUrl } from '@/shared/lib/http';
import { ProductImage } from '@/shared/types';
import { Button } from '@/shared/ui';

interface Props { images: ProductImage[]; onUpload: (files: File[]) => void; onReorder: (ids: string[]) => void; onRemove: (id: string) => void; uploading?: boolean }

export function ImagesEditor({ images, onUpload, onReorder, onRemove, uploading }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const move = (i: number, dir: -1 | 1) => {
    const ids = images.map((x) => x.id);
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    onReorder(ids);
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <figure key={img.id} className="relative w-28">
            <img src={assetUrl(img.url)} alt={img.alt} className="aspect-product w-full object-cover" />
            {i === 0 && <figcaption className="absolute left-1 top-1 bg-ink px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Principal</figcaption>}
            <div className="mt-1 flex justify-between">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 disabled:opacity-30" aria-label="Mover a la izquierda"><ArrowLeft className="h-4 w-4" /></button>
              <button type="button" onClick={() => onRemove(img.id)} className="p-1 text-muted hover:text-accent" aria-label="Eliminar imagen"><Trash2 className="h-4 w-4" /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="p-1 disabled:opacity-30" aria-label="Mover a la derecha"><ArrowRight className="h-4 w-4" /></button>
            </div>
          </figure>
        ))}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => { const f = Array.from(e.target.files ?? []); if (f.length) onUpload(f); e.target.value = ''; }} />
      <Button type="button" variant="outline" loading={uploading} onClick={() => input.current?.click()}><Upload className="h-4 w-4" /> Subir imágenes</Button>
      <p className="text-xs text-muted">JPG, PNG o WebP, máx. 5 MB cada una, hasta 8 por producto. Recomendado 800×1067 (3:4).</p>
    </div>
  );
}
