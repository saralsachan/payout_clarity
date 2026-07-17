import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import {
  buildOAuthUrl,
  generateOAuthState,
  normalizeShopDomain,
} from "@/lib/shopify/oauth";

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const shop = searchParams.get("shop");
  if (!shop) {
    return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });
  }

  try {
    const shopDomain = normalizeShopDomain(shop);
    const state = generateOAuthState(user.id);
    const url = buildOAuthUrl(shopDomain, state);

    const response = NextResponse.redirect(url);
    response.cookies.set("shopify_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    response.cookies.set("shopify_oauth_shop", shopDomain, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid shop domain";
    return NextResponse.redirect(new URL(`/connect?error=${encodeURIComponent(message)}`, request.url));
  }
}
