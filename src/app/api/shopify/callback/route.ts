import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { exchangeCodeForToken, verifyOAuthState } from "@/lib/shopify/oauth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const shop = searchParams.get("shop");

  if (!code || !state || !shop) {
    return NextResponse.redirect(`${origin}/connect?error=oauth_failed`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("shopify_oauth_state")?.value;

  if (!savedState || savedState !== state || !verifyOAuthState(state, user.id)) {
    return NextResponse.redirect(`${origin}/connect?error=invalid_state`);
  }

  try {
    const { accessToken, scope } = await exchangeCodeForToken(shop, code);
    const admin = createAdminClient();

    await admin.from("shopify_connections").upsert(
      {
        user_id: user.id,
        shop_domain: shop,
        access_token: accessToken,
        scopes: scope,
        status: "active",
        connected_at: new Date().toISOString(),
      },
      { onConflict: "user_id,shop_domain" },
    );

    const response = NextResponse.redirect(`${origin}/connect/syncing`);
    response.cookies.delete("shopify_oauth_state");
    response.cookies.delete("shopify_oauth_shop");
    return response;
  } catch {
    return NextResponse.redirect(`${origin}/connect?error=token_exchange_failed`);
  }
}
