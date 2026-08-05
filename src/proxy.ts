import { NextResponse, type NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/tokens";
import { COOKIE_NAMES, USER_ROLE } from "@/constants";

const CUSTOMER_ROUTES = ["/dashboard", "/checkout"];
const ADMIN_ROUTES = ["/admin"];
const GUEST_ONLY_ROUTES = ["/login", "/register"];

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://ik.imagekit.io https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; ")
  );
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Basic CSRF hardening: cookies are SameSite=Lax already, but explicitly
  // reject cross-origin state-changing API calls as a second layer.
  if (pathname.startsWith("/api/") && ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN_ORIGIN", message: "Cross-origin request blocked" } },
        { status: 403 }
      );
    }
  }

  const accessToken = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const session = accessToken ? await verifyAccessToken(accessToken) : null;

  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isCustomerRoute = CUSTOMER_ROUTES.some((route) => pathname.startsWith(route));
  const isGuestOnlyRoute = GUEST_ONLY_ROUTES.some((route) => pathname.startsWith(route));

  if (isAdminRoute) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }
    // Signed in but not an admin: sending them to /login would just bounce
    // straight back to "/" via the guest-only-route check below, with no
    // indication of why. Send them home directly instead.
    if (session.role !== USER_ROLE.ADMIN && session.role !== USER_ROLE.SUPER_ADMIN) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/", request.url)));
    }
  }

  if (isCustomerRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  if (isGuestOnlyRoute && session) {
    return applySecurityHeaders(NextResponse.redirect(new URL("/", request.url)));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
