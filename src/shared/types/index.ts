/** Tipos que comparten varias features; cada feature define los suyos propios. */
export type Gender = 'HOMBRE' | 'MUJER' | 'UNISEX';

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  children: Category[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  gender: Gender;
  category: { id: string; name: string; slug: string };
  price: number;
  salePrice: number | null;
  currentPrice: number;
  onSale: boolean;
  discountPercent: number;
  isFeatured: boolean;
  isNew: boolean;
  images: ProductImage[];
  colors: { name: string; hex: string | null }[];
  sizes: string[];
  inStock: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string | null;
  stock: number;
  price: number;
  salePrice: number | null;
  currentPrice: number;
  available: boolean;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  variants: ProductVariant[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  extNumber: string;
  intNumber?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  references?: string | null;
}

export type OrderStatus = 'PENDIENTE' | 'PAGADO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO';

export interface OrderItem {
  id: string;
  productId: string | null;
  variantId: string | null;
  productName: string;
  sku: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageUrl?: string | null;
}

export interface Order {
  id: string;
  number: string;
  email: string;
  status: OrderStatus;
  paymentStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: ShippingAddress;
  paidAt: string | null;
  trackingCarrier?: string | null;
  trackingNumber?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderSummary {
  id: string;
  number: string;
  email: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  firstImage: string | null;
  createdAt: string;
}

export const MX_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua',
  'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
  'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo',
  'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
];
