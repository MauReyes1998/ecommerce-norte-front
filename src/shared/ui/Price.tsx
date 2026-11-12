import { formatMXN } from '@/shared/lib/format';

interface Props { price: number; salePrice?: number | null; size?: 'sm' | 'md' | 'lg' }

export function Price({ price, salePrice, size = 'md' }: Props) {
  const cls = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }[size];
  const onSale = salePrice !== null && salePrice !== undefined && salePrice < price;
  return (
    <span className={`inline-flex items-baseline gap-2 ${cls}`}>
      <span className={onSale ? 'price-sale font-semibold' : 'font-semibold'}>{formatMXN(onSale ? (salePrice as number) : price)}</span>
      {onSale && <s className="text-muted">{formatMXN(price)}</s>}
    </span>
  );
}
