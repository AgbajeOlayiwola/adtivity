// middleware.ts
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value

  if (!token) {
    const loginUrl = "/login"
    // loginUrl.pathname = "/login"
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"], // protect only /admin
}
