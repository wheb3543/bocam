import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { publicProcedure, adminProcedure, router } from '../_core/trpc';
import { getUserByUsername, getUserByEmail, getUserById } from '../database/db';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { getDb } from '../database/db';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET: string = process.env.JWT_SECRET;
const COOKIE_NAME = 'admin_session';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Helper to create JWT token
function createAuthToken(userId: number, username: string, role: string): string {
  return jwt.sign({ userId, username, role, type: 'admin' }, JWT_SECRET, { expiresIn: '1y' });
}

// Helper to verify JWT token
function verifyAuthToken(token: string): { userId: number; username: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { type: string; userId: number; username: string; role: string };
    if (decoded.type !== 'admin') return null;
    return { userId: decoded.userId, username: decoded.username, role: decoded.role };
  } catch {
    return null;
  }
}

export const authRouter = router({
  // تسجيل دخول بـ username أو email + password
  login: publicProcedure
    .input(
      z.object({
        identifier: z
          .string()
          .min(3, 'اسم المستخدم أو البريد الإلكتروني يجب أن يكون 3 أحرف على الأقل'),
        password: z.string().min(1, 'كلمة المرور مطلوبة'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { identifier, password } = input;

      // Try to find user by username first, then by email
      let user = await getUserByUsername(identifier);
      if (!user) {
        user = await getUserByEmail(identifier);
      }

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'اسم المستخدم أو البريد الإلكتروني أو كلمة المرور غير صحيحة',
        });
      }

      // Check if user is active
      if (user.isActive !== 'yes') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'الحساب معطل. يرجى التواصل مع المسؤول',
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'اسم المستخدم أو البريد الإلكتروني أو كلمة المرور غير صحيحة',
        });
      }

      // Update last signed in
      const db = await getDb();
      if (db) {
        await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
      }

      // Create token and set cookie
      const token = createAuthToken(user.id, user.username, user.role);

      ctx.res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'lax',
        maxAge: ONE_YEAR_MS,
        path: '/',
      });

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }),

  // تسجيل خروج
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(COOKIE_NAME, { path: '/' });
    return { success: true };
  }),

  // الحصول على بيانات المستخدم الحالي
  me: publicProcedure.query(async ({ ctx }) => {
    // Use ctx.user which is already set by context.ts
    if (!ctx.user) return null;

    return {
      id: ctx.user.id,
      username: ctx.user.username,
      name: ctx.user.name,
      email: ctx.user.email,
      role: ctx.user.role,
      lastSignedIn: ctx.user.lastSignedIn,
    };
  }),

  // تسجيل مستخدم جديد (للمسؤولين فقط)
  register: adminProcedure
    .input(
      z.object({
        username: z.string().min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
        password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
        name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
        email: z.string().email('البريد الإلكتروني غير صحيح').optional(),
        role: z.enum(['user', 'admin', 'manager', 'staff', 'viewer', 'team_leader']).default('user'),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });
      }

      // Check if username already exists
      const existingUsername = await getUserByUsername(input.username);
      if (existingUsername) {
        throw new TRPCError({ code: 'CONFLICT', message: 'اسم المستخدم موجود بالفعل' });
      }

      // Check if email already exists (if provided)
      if (input.email) {
        const existingEmail = await getUserByEmail(input.email);
        if (existingEmail) {
          throw new TRPCError({ code: 'CONFLICT', message: 'البريد الإلكتروني موجود بالفعل' });
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Create user
      const result = await db.insert(users).values({
        username: input.username,
        password: hashedPassword,
        name: input.name,
        email: input.email,
        role: input.role,
        isActive: 'yes',
        loginMethod: 'manual',
      });

      return { success: true, userId: Number(result[0].insertId) };
    }),

  // تحديث الملف الشخصي
  updateProfile: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').optional(),
        email: z.string().email('البريد الإلكتروني غير صحيح').optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'يجب تسجيل الدخول أولاً' });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });
      }

      // Check if email already exists (if provided and different from current)
      if (input.email && input.email !== ctx.user.email) {
        const existingEmail = await getUserByEmail(input.email);
        if (existingEmail) {
          throw new TRPCError({ code: 'CONFLICT', message: 'البريد الإلكتروني موجود بالفعل' });
        }
      }

      // Update user
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.email !== undefined) updateData.email = input.email;

      await db.update(users).set(updateData).where(eq(users.id, ctx.user.id));

      // Return updated user
      const updatedUser = await getUserById(ctx.user.id);
      return updatedUser;
    }),
});
