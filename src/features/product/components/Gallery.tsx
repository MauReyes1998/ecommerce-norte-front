import { useState } from 'react';
import { assetUrl } from '@/shared/lib/http';
import { ProductImage } from '@/shared/types';
import { cn } from '@/shared/lib/format';

export function Gallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [{ id: 'ph', url: '', alt: name, sortOrder: 0 }];
  return (
    <div className="grid gap-3 md:grid-cols-[72px_1fr]">
      <ul className="order-2 flex gap-2 overflow-x-auto md:order-1 md:flex-col" aria-label="Miniaturas">
        {list.map((img, i) => (
          <li key={img.id}>
            <button onClick={() => setActive(i)} aria-label={`Foto ${i + 1}`} aria-current={i === active}
              className={cn('block aspect-product w-16 overflow-hidden border-2', i === active ? 'border-ink' : 'border-transparent')}>
              <img src={assetUrl(img.url)} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          </li>
        ))}
      </ul>
      <div className="order-1 aspect-product overflow-hidden bg-neutral-100 md:order-2">
        <img src={assetUrl(list[active]?.url)} alt={list[active]?.alt ?? name} className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
