import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const isLocalhost = (url: string | null) => {
  if (!url) return false
  return (
    url.includes("localhost") ||
    url.includes("127.0.0.1") ||
    url.startsWith("http://192.168.") ||
    url.startsWith("http://10.") ||
    url.startsWith("http://172.")
  )
}

const ALLOWED_ORIGINS = [
  "https://zetflix-official.vercel.app",
  "https://zetflix-tv.vercel.app",
  // Add more production allowed origins here
]

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin")
  const referer = request.headers.get("referer")
  const pathname = request.nextUrl.pathname

  // Allow localhost in development
  if (isLocalhost(origin) || isLocalhost(referer)) {
    const response = NextResponse.next()
    response.headers.set("Access-Control-Allow-Origin", origin || "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return response
  }

  // Allow admin whitelist page to be accessed directly
  if (pathname === "/" || pathname === "/admin/whitelist") {
    const response = NextResponse.next()
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    return response
  }

  // Check if the request is for movie or TV pages
  const isPlayerPage = pathname.startsWith("/movie/") || pathname.startsWith("/tv/")

  if (isPlayerPage) {
    // Check if the request is from an allowed origin
    const isAllowed = ALLOWED_ORIGINS.some((allowed) => {
      if (origin && origin.startsWith(allowed)) return true
      if (referer && referer.startsWith(allowed)) return true
      return false
    })

    // If not from an allowed origin and has a referer, block it
    if (!isAllowed && (origin || referer)) {
      return new NextResponse("Embedding not allowed", { status: 403 })
    }
  }

  const response = NextResponse.next()

  // Add enhanced security headers
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "no-referrer")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  const cspOrigins = [...ALLOWED_ORIGINS, "http://localhost:*", "http://127.0.0.1:*"].join(" ")
  response.headers.set("Content-Security-Policy", `frame-ancestors 'self' ${cspOrigins}`)

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
