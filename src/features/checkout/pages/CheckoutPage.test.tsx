import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCartStore } from '@/features/cart';
import { useAuthStore } from '@/features/auth';
import CheckoutPage from './CheckoutPage';

const http = vi.hoisted(() => ({ post: vi.fn(), get: vi.fn(), patch: vi.fn(), delete: vi.fn(), upload: vi.fn() }));
vi.mock('@/shared/lib/http', async (orig) => ({ ...(await orig<object>()), http }));

const item = { variantId: 'v1', productId: 'p1', slug: 'playera', name: 'Playera', imageUrl: null, size: 'M', color: 'Negro', unitPrice: 349, maxStock: 5, quantity: 2 };
const quote = { lines: [], subtotal: 698, shippingCost: 149, total: 847, isValid: true };

const renderPage = () => render(
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter><CheckoutPage /></MemoryRouter>
  </QueryClientProvider>,
);

describe('CheckoutPage', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [item], isOpen: false });
    useAuthStore.setState({ user: null, loading: false });
    http.post.mockReset();
    http.post.mockImplementation((path: string) => path === '/cart/quote' ? Promise.resolve(quote) : Promise.resolve({ order: { id: 'o1' }, checkoutUrl: null }));
  });

  it('muestra bolsa vacía sin productos', () => {
    useCartStore.setState({ items: [] });
    renderPage();
    expect(screen.getByText('Tu bolsa está vacía')).toBeInTheDocument();
  });

  it('muestra totales del servidor y pide correo al invitado', async () => {
    renderPage();
    expect(await screen.findByText('$847.00')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirmar y pagar/i })).toBeDisabled();
  });

  it('crea el pedido con la dirección y el correo', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('$847.00');
    await user.type(screen.getByLabelText('Correo'), 'ana@correo.com');
    await user.type(screen.getByLabelText('Nombre completo'), 'Ana López');
    await user.type(screen.getByLabelText('Teléfono'), '7221234567');
    await user.type(screen.getByLabelText('Código postal'), '52140');
    await user.type(screen.getByLabelText('Calle'), 'Av. Tecnológico');
    await user.type(screen.getByLabelText('Número exterior'), '1500');
    await user.type(screen.getByLabelText('Colonia'), 'La Michoacana');
    await user.type(screen.getByLabelText('Municipio o alcaldía'), 'Metepec');
    await user.click(screen.getByRole('button', { name: /confirmar y pagar/i }));

    await vi.waitFor(() => expect(http.post).toHaveBeenCalledWith('/orders', expect.objectContaining({
      email: 'ana@correo.com',
      items: [{ variantId: 'v1', quantity: 2 }],
      shippingAddress: expect.objectContaining({ fullName: 'Ana López', postalCode: '52140', state: 'Estado de México' }),
    })));
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
