const PHONE = import.meta.env.VITE_WHATSAPP ?? '5217221234567';

export const whatsappUrl = (text = 'Hola, tengo una duda sobre un producto de NORTE') =>
  `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
