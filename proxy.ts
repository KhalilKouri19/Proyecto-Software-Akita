import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token;

    // Si no hay sesión y trata de acceder a /seguimiento, redirigir al login
    if (!token && req.nextUrl.pathname.startsWith("/seguimiento")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Si el usuario autenticado es admin, no puede acceder al seguimiento
    if (token?.role === "admin" && req.nextUrl.pathname.startsWith("/seguimiento")) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Permitir el acceso, validamos manualmente arriba
    },
  }
);

export const config = {
  matcher: ["/seguimiento/:path*", "/admin/:path*"], // Protege ambas rutas
};
