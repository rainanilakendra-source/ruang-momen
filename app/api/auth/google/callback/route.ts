import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as oidc from "openid-client";
import { createSession, getCurrentUser } from "../../../../lib/auth";
import {
  GOOGLE_FLOW_COOKIE,
  GOOGLE_PORTALS,
  GOOGLE_PROVIDER,
  googleConfiguration,
  googlePortalConfig,
  googleRedirectUri,
  hashOAuthValue,
  oauthHashMatches,
  parseGooglePortal,
  portalAllowsRole,
} from "../../../../lib/google-oauth";
import { prisma } from "../../../../lib/prisma";
import { ROLES } from "../../../../lib/roles";
import { prepareSecondFactor } from "../../../../lib/two-factor";
import { consumeRateLimit, requestRateLimitKey } from "../../../../lib/rate-limit";

type FailureCode = "cancelled" | "invalid_state" | "expired" | "invalid_identity" | "email_unverified" | "email_exists" | "already_linked" | "email_mismatch" | "role_mismatch" | "provider_error";

function failure(path: string, code: FailureCode): never {
  redirect(`${path}?oauth_error=${code}`);
}

export async function GET(request: Request) {
  const rateLimit = consumeRateLimit(requestRateLimitKey("oauth-callback", request.headers), 30, 10 * 60 * 1000);
  if (!rateLimit.allowed) return new Response("Too many requests", { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds), "Cache-Control": "no-store" } });
  const incomingUrl = new URL(request.url);
  const state = incomingUrl.searchParams.get("state");
  const cookieStore = await cookies();
  const browserBinding = cookieStore.get(GOOGLE_FLOW_COOKIE)?.value;
  cookieStore.delete(GOOGLE_FLOW_COOKIE);

  if (!state || !browserBinding) failure("/masuk", incomingUrl.searchParams.has("error") ? "cancelled" : "invalid_state");

  const flow = await prisma.oAuthFlow.findUnique({
    where: { stateHash: hashOAuthValue(state) },
    select: { id: true, browserBindingHash: true, codeVerifier: true, nonce: true, portal: true, intent: true, userId: true, expiresAt: true },
  });
  const portal = parseGooglePortal(flow?.portal ?? null);
  const fallback = portal ? googlePortalConfig(portal).failure : "/masuk";
  if (!flow || !portal || !oauthHashMatches(flow.browserBindingHash, hashOAuthValue(browserBinding))) failure(fallback, "invalid_state");

  const consumed = await prisma.oAuthFlow.deleteMany({ where: { id: flow.id } });
  if (consumed.count !== 1) failure(fallback, "invalid_state");
  if (flow.expiresAt <= new Date()) failure(fallback, "expired");
  if (incomingUrl.searchParams.has("error")) failure(fallback, "cancelled");

  let claims: ReturnType<oidc.TokenEndpointResponseHelpers["claims"]>;
  try {
    const config = await googleConfiguration();
    const callbackUrl = new URL(googleRedirectUri());
    callbackUrl.search = incomingUrl.search;
    const tokens = await oidc.authorizationCodeGrant(config, callbackUrl, {
      pkceCodeVerifier: flow.codeVerifier,
      expectedState: state,
      expectedNonce: flow.nonce,
      idTokenExpected: true,
    });
    claims = tokens.claims();
  } catch {
    failure(fallback, "provider_error");
  }

  const subject = claims?.sub;
  const email = typeof claims?.email === "string" ? claims.email.trim().toLowerCase() : "";
  if (!subject || !email) failure(fallback, "invalid_identity");
  if (claims?.email_verified !== true) failure(fallback, "email_unverified");

  if (flow.intent === "LINK" && portal === GOOGLE_PORTALS.LINK) {
    const currentUser = await getCurrentUser();
    if (!flow.userId || currentUser?.id !== flow.userId) failure(fallback, "invalid_state");
    if (currentUser.email.toLowerCase() !== email) failure(fallback, "email_mismatch");

    const linked = await prisma.oAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider: GOOGLE_PROVIDER, providerAccountId: subject } },
      select: { userId: true },
    });
    if (linked && linked.userId !== currentUser.id) failure(fallback, "already_linked");
    if (!linked) {
      const userGoogle = await prisma.oAuthAccount.findUnique({
        where: { userId_provider: { userId: currentUser.id, provider: GOOGLE_PROVIDER } },
        select: { id: true },
      });
      if (userGoogle) failure(fallback, "already_linked");
      try {
        await prisma.oAuthAccount.create({ data: { userId: currentUser.id, provider: GOOGLE_PROVIDER, providerAccountId: subject }, select: { id: true } });
      } catch {
        const racedLink = await prisma.oAuthAccount.findUnique({
          where: { provider_providerAccountId: { provider: GOOGLE_PROVIDER, providerAccountId: subject } },
          select: { userId: true },
        });
        if (racedLink?.userId !== currentUser.id) failure(fallback, "already_linked");
      }
    }
    redirect("/dashboard/akun?oauth_success=linked");
  }

  if (portal === GOOGLE_PORTALS.LINK) failure(fallback, "invalid_state");
  const linked = await prisma.oAuthAccount.findUnique({
    where: { provider_providerAccountId: { provider: GOOGLE_PROVIDER, providerAccountId: subject } },
    select: { user: { select: { id: true, email: true, role: true, twoFactorEnabled: true } } },
  });

  let user = linked?.user ?? null;
  if (!user) {
    const emailOwner = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (emailOwner) failure(fallback, "email_exists");
    if (portal !== GOOGLE_PORTALS.USER) failure(fallback, "role_mismatch");

    const displayName = typeof claims?.name === "string" ? claims.name.trim().slice(0, 80) : "";
    const safeName = displayName.length >= 2 ? displayName : email.split("@")[0]!.slice(0, 80).padEnd(2, "_");
    try {
      user = await prisma.user.create({
        data: {
          name: safeName,
          email,
          role: ROLES.USER,
          oauthAccounts: { create: { provider: GOOGLE_PROVIDER, providerAccountId: subject } },
        },
        select: { id: true, email: true, role: true, twoFactorEnabled: true },
      });
    } catch {
      failure(fallback, "email_exists");
    }
  }

  if (!portalAllowsRole(portal, user.role)) failure(fallback, "role_mismatch");
  const secondFactorPath = await prepareSecondFactor(user, portal);
  if (secondFactorPath) redirect(secondFactorPath);
  await createSession(user.id);
  redirect(googlePortalConfig(portal).destination);
}
