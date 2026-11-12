import { Link, useParams } from 'react-router-dom';

/** Solo en local sin MP_ACCESS_TOKEN: simula la pantalla de pago para probar el flujo. */
export default function FakePaymentPage() {
  const { id } = useParams();
  return (
    <div className="container-x max-w-md py-20 text-center">
      <h1 className="text-2xl font-bold">Pago simulado</h1>
      <p className="mt-2 text-sm text-muted">El backend no tiene configurado Mercado Pago. Aquí iría el Checkout Pro.</p>
      <div className="mt-8 flex flex-col gap-3">
        <Link to={`/pedido/${id}?pago=exito`} className="btn-primary">Simular pago aprobado</Link>
        <Link to={`/pedido/${id}?pago=error`} className="btn-outline">Simular pago rechazado</Link>
      </div>
      <p className="mt-6 text-xs text-muted">Para marcarlo como pagado de verdad, manda el webhook con un pago real o cambia el estatus desde el panel admin.</p>
    </div>
  );
}
