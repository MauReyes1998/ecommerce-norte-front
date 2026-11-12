const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });

/** 1299 -> "$1,299.00" */
export const formatMXN = (value: number) => mxn.format(value);

export const formatDate = (iso: string | Date) =>
  new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente de pago',
  PAGADO: 'Pagado',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

export const GENDER_LABEL: Record<string, string> = { HOMBRE: 'Hombre', MUJER: 'Mujer', UNISEX: 'Unisex' };

export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');
