import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      // Check if user email is in allowed list
      const userEmail = userInfo.email;
      if (!userEmail) {
        res.redirect(302, "/unauthorized?reason=no_email");
        return;
      }

      const isAllowed = await db.isUserAllowed(userEmail);
      if (!isAllowed) {
        console.log(`[OAuth] Unauthorized access attempt by ${userEmail}`);
        
        // Create access request automatically with openId
        await db.createAccessRequest({
          openId: userInfo.openId,
          name: userInfo.name || 'مستخدم جديد',
          email: userEmail,
          phone: null,
          reason: 'طلب تلقائي عند محاولة تسجيل الدخول',
        });
        
        res.redirect(302, "/access-request?email=" + encodeURIComponent(userEmail));
        return;
      }

      // User is allowed, proceed with login
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Update last signed in
      const user = await db.getUserByEmail(userEmail);
      if (user && user.id) {
        // Update last signed in time via SQL
        const { eq } = await import('drizzle-orm');
        const { users } = await import('../../drizzle/schema');
        const dbConn = await db.getDb();
        if (dbConn) {
          await dbConn.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
        }
      }

      res.redirect(302, "/admin");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
