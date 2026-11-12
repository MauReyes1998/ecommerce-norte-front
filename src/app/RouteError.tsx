import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

/** Pantalla amigable cuando una página truena, en lugar del error crudo de React Router. */
export function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : 'Error desconocido';
  return (
    <div className="container-x py-24 text-center">
      <p className="text-5xl font-black">Ups</p>
      <p className="mt-2 text-muted">Algo salió mal al mostrar esta página.</p>
      <pre className="mx-auto mt-4 max-w-lg overflow-x-auto bg-paper p-3 text-left text-xs text-muted">{message}</pre>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={() => window.location.reload()} className="btn-primary">Recargar</button>
        <Link to="/" className="btn-outline">Ir al inicio</Link>
      </div>
    </div>
  );
}
