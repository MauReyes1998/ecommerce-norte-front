import { lazy, Suspense } from 'react';
import { createBrowserRouter, Link, RouterProvider } from 'react-router-dom';
import { RequireAuth } from '@/features/auth';
import { StoreLayout } from './layout/StoreLayout';
import { RouteError } from './RouteError';

// Cada feature se carga cuando se visita por primera vez.
const HomePage = lazy(() => import('@/features/catalog').then((m) => ({ default: m.HomePage })));
const CatalogPage = lazy(() => import('@/features/catalog').then((m) => ({ default: m.CatalogPage })));
const ProductPage = lazy(() => import('@/features/product').then((m) => ({ default: m.ProductPage })));
const CheckoutPage = lazy(() => import('@/features/checkout').then((m) => ({ default: m.CheckoutPage })));
const FakePaymentPage = lazy(() => import('@/features/checkout').then((m) => ({ default: m.FakePaymentPage })));
const LoginPage = lazy(() => import('@/features/auth').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/features/auth').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/features/auth').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/features/auth').then((m) => ({ default: m.ResetPasswordPage })));
const AdminCustomersPage = lazy(() => import('@/features/admin').then((m) => ({ default: m.AdminCustomersPage })));
const AccountLayout = lazy(() => import('@/features/account').then((m) => ({ default: m.AccountLayout })));
const OrdersPage = lazy(() => import('@/features/account').then((m) => ({ default: m.OrdersPage })));
const OrderDetailPage = lazy(() => import('@/features/account').then((m) => ({ default: m.OrderDetailPage })));
const AddressesPage = lazy(() => import('@/features/account').then((m) => ({ default: m.AddressesPage })));
const FavoritesPage = lazy(() => import('@/features/account').then((m) => ({ default: m.FavoritesPage })));
const ProfilePage = lazy(() => import('@/features/account').then((m) => ({ default: m.ProfilePage })));
const AdminLayout = lazy(() => import('@/features/admin').then((m) => ({ default: m.AdminLayout })));
const DashboardPage = lazy(() => import('@/features/admin').then((m) => ({ default: m.DashboardPage })));
const AdminProductsPage = lazy(() => import('@/features/admin').then((m) => ({ default: m.AdminProductsPage })));
const AdminProductFormPage = lazy(() => import('@/features/admin').then((m) => ({ default: m.AdminProductFormPage })));
const AdminCategoriesPage = lazy(() => import('@/features/admin').then((m) => ({ default: m.AdminCategoriesPage })));
const AdminOrdersPage = lazy(() => import('@/features/admin').then((m) => ({ default: m.AdminOrdersPage })));
const AdminCouponsPage = lazy(() => import('@/features/admin').then((m) => ({ default: m.AdminCouponsPage })));

const Loading = () => <div className="container-x py-20 text-center text-sm text-muted">Cargando…</div>;
const NotFound = () => (
  <div className="container-x py-24 text-center">
    <p className="text-6xl font-black">404</p>
    <p className="mt-2 text-muted">Esta página no existe.</p>
    <Link to="/" className="btn-outline mt-6">Volver al inicio</Link>
  </div>
);

const router = createBrowserRouter([
  {
    element: <StoreLayout />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/tienda', element: <CatalogPage /> },
      { path: '/tienda/:categoria', element: <CatalogPage /> },
      { path: '/buscar', element: <CatalogPage mode="search" /> },
      { path: '/producto/:slug', element: <ProductPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/pago/simulado/:id', element: <FakePaymentPage /> },
      { path: '/pedido/:id', element: <OrderDetailPage /> },
      { path: '/cuenta/entrar', element: <LoginPage /> },
      { path: '/cuenta/registro', element: <RegisterPage /> },
      { path: '/cuenta/recuperar', element: <ForgotPasswordPage /> },
      { path: '/cuenta/restablecer', element: <ResetPasswordPage /> },
      {
        element: <RequireAuth />,
        children: [{
          path: '/cuenta', element: <AccountLayout />,
          children: [
            { index: true, element: <OrdersPage /> },
            { path: 'direcciones', element: <AddressesPage /> },
            { path: 'favoritos', element: <FavoritesPage /> },
            { path: 'perfil', element: <ProfilePage /> },
          ],
        }],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    element: <RequireAuth admin />,
    errorElement: <RouteError />,
    children: [{
      path: '/admin', element: <AdminLayout />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: 'productos', element: <AdminProductsPage /> },
        { path: 'productos/nuevo', element: <AdminProductFormPage /> },
        { path: 'productos/:id', element: <AdminProductFormPage /> },
        { path: 'categorias', element: <AdminCategoriesPage /> },
        { path: 'pedidos', element: <AdminOrdersPage /> },
        { path: 'clientes', element: <AdminCustomersPage /> },
        { path: 'cupones', element: <AdminCouponsPage /> },
      ],
    }],
  },
]);

export const AppRouter = () => <Suspense fallback={<Loading />}><RouterProvider router={router} /></Suspense>;
