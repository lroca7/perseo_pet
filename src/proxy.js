import withAuth from 'next-auth/middleware';

export function proxy(req, event) {
  return withAuth(req, event);
}

export default proxy;

export const config = {
  // Proteger la ruta del dashboard y las páginas de detalle de mascota
  matcher: ['/dashboard/:path*', '/pet/:path*', '/api/pets/:path*', '/api/activities/:path*'],
};
