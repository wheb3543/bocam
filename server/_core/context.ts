import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { User } from '../../drizzle/schema';
import { sdk } from './sdk';
import jwt from 'jsonwebtoken';
import { getUserById } from '../database/db';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET: string = process.env.JWT_SECRET;
const COOKIE_NAME = 'admin_session';

export type TrpcContext = {
  req: CreateExpressContextOptions['req'];
  res: CreateExpressContextOptions['res'];
  user: User | null;
  features?: Record<string, boolean>;
};

// Helper to parse cookies from header
function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};

  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });

  return cookies;
}

// Helper to verify local auth token
function verifyLocalAuthToken(
  token: string
): { userId: number; username: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; username: string; role: string; type: string };
    if (decoded.type !== 'admin') return null;
    return { userId: decoded.userId, username: decoded.username, role: decoded.role };
  } catch {
    return null;
  }
}

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;

  // Try local auth first (username/password)
  const cookies = parseCookies(opts.req.headers.cookie);
  const localToken = cookies[COOKIE_NAME];
  if (localToken) {
    const decoded = verifyLocalAuthToken(localToken);
    if (decoded) {
      const localUser = await getUserById(decoded.userId);
      if (localUser && localUser.isActive === 'yes') {
        user = localUser;
      }
    }
  }

  // Fall back to OAuth if local auth failed
  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
