import { NextResponse } from "next/server";
import { CUSTOMER_COOKIE_NAME } from "@/lib/checkout/customer-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(`${new URL(request.url).origin}/login`);
  response.cookies.set(CUSTOMER_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });

  return response;
}
