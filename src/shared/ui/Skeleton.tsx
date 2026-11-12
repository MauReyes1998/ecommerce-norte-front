export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-neutral-100 ${className}`} aria-hidden />
);

export const ProductCardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="aspect-product w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/3" />
  </div>
);
