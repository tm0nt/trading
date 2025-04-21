// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/auth", "/api/config/general", "/api/auth/"];

const STATIC_FILES = [
  "/favicon.ico",
  "/uploads/", // Permite acesso a todos os arquivos na pasta uploads
  "/images/", // Se tiver outras pastas de arquivos estáticos
  "/public/", // Permite acesso direto à pasta public
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session")?.value;

  // 1. Primeiro verifique se é um arquivo estático
  const isStaticFile = STATIC_FILES.some((path) => pathname.startsWith(path));

  // 2. Permita acesso irrestrito a arquivos estáticos
  if (isStaticFile) {
    return NextResponse.next();
  }

  // 3. Verifique rotas públicas
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isAuthPage = pathname.startsWith("/auth");
  const isRoot = pathname === "/";

  // Redirecionamentos para usuários logados
  if (token && (isAuthPage || isRoot)) {
    return NextResponse.redirect(new URL("/trading", request.url));
  }

  // Redirecionamentos para usuários não logados
  if (!token && (!isPublic || isRoot)) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api/auth/logout).*)"],
};
