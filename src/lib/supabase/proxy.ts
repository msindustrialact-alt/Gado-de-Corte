import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";

function isRotaPublica(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/auth");
}

function redirecionarComSessao(
  request: NextRequest,
  supabaseResponse: NextResponse,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";

  const redirectResponse = NextResponse.redirect(url);

  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  supabaseResponse.headers.forEach((value, key) => {
    if (
      key.toLowerCase() === "cache-control" ||
      key.toLowerCase() === "expires" ||
      key.toLowerCase() === "pragma"
    ) {
      redirectResponse.headers.set(key, value);
    }
  });

  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias.",
    );
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  // Não executar lógica entre createServerClient e getClaims: isso pode
  // impedir o refresh do token e deslogar o usuário de forma intermitente.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const { pathname } = request.nextUrl;

  if (!user && !isRotaPublica(pathname)) {
    return redirecionarComSessao(request, supabaseResponse, "/login");
  }

  if (user && pathname === "/login") {
    return redirecionarComSessao(request, supabaseResponse, "/dashboard");
  }

  return supabaseResponse;
}
