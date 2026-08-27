import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as oidc from "openid-client";
import { getCurrentUser } from "../../../../lib/auth";
import {
  GOOGLE_FLOW_COOKIE,
  GOOGLE_FLOW_TTL_SECONDS,
  GOOGLE_PORTALS,
  googleConfiguration,
  googlePortalConfig,
  googleRedirectUri,
  hashOAuthValue,
  parseGooglePortal,
} from "../../../../lib/google-oauth";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: Request) {
  const portal = parseGooglePortal(new URL(request.url).searchParams.get("portal"));
  if (!portal) redirect("/masuk?oauth_error=invalid_request");

  const fallback = googlePortalConfig(portal).failure;
  const linkingUser = portal === GOOGLE_PORTALS.LINK ? await getCurrentUser() : null;
  if (portal === GOOGLE_PORTALS.LINK && !linkingUser) redirect("/masuk?oauth_error=login_required");

  try {
    const config = await googleConfiguration();
    const state = oidc.randomState();
    const nonce = oidc.randomNonce();
    const codeVerifier = oidc.randomPKCECodeVerifier();
    const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
    const browserBinding = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + GOOGLE_FLOW_TTL_SECONDS * 1000);

    await prisma.$transaction([
      prisma.oAuthFlow.deleteMany({ where: { expiresAt: { lte: new Date() } } }),
      prisma.oAuthFlow.create({
        data: {
          stateHash: hashOAuthValue(state),
          browserBindingHash: hashOAuthValue(browserBinding),
          codeVerifier,
          nonce,
          portal,
          intent: portal === GOOGLE_PORTALS.LINK ? "LINK" : "LOGIN",
          userId: linkingUser?.id,
          expiresAt,
        },
        select: { id: true },
      }),
    ]);

    const cookieStore = await cookies();
    cookieStore.set(GOOGLE_FLOW_COOKIE, browserBinding, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api/auth/google/callback",
      expires: expiresAt,
      maxAge: GOOGLE_FLOW_TTL_SECONDS,
    });

    const authorizationUrl = oidc.buildAuthorizationUrl(config, {
      redirect_uri: googleRedirectUri(),
      response_type: "code",
      scope: "openid profile email",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
      nonce,
    });
    redirect(authorizationUrl.href);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    redirect(`${fallback}?oauth_error=configuration`);
  }
}
