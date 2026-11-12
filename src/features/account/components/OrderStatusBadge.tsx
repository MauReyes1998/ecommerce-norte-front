import { Badge } from '@/shared/ui';
import { ORDER_STATUS_LABEL } from '@/shared/lib/format';
import { OrderStatus } from '@/shared/types';

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => <Badge tone={status}>{ORDER_STATUS_LABEL[status]}</Badge>;
