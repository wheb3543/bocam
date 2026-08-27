import { z } from 'zod';
import { and, asc, eq, inArray, isNull, like, or } from 'drizzle-orm';
import { router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { media, mediaFolders } from '../../../drizzle/schema';
import { permissionProcedure } from '../permissionProcedures';

const mediaTypeSchema = z.enum(['image', 'video', 'audio', 'document', 'other']);

const mediaInput = z.object({
  key: z.string().min(1).max(255),
  url: z.string().min(1).max(500),
  type: mediaTypeSchema,
  mimeType: z.string().max(100).optional(),
  fileName: z.string().max(255).optional(),
  altAr: z.string().optional(),
  altEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  folderId: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  duration: z.number().nullable().optional(),
  format: z.string().max(20).optional(),
  size: z.number().nullable().optional(),
  thumbnailUrl: z.string().max(500).optional(),
});

function normalizeFolderName(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

const mediaViewProcedure = permissionProcedure('media.view', 'عرض مكتبة الوسائط');
const mediaUploadProcedure = permissionProcedure('media.upload', 'رفع وفهرسة الوسائط');
const mediaOrganizeProcedure = permissionProcedure('media.organize', 'تنظيم مجلدات ووسائط المكتبة');
const mediaRenameProcedure = permissionProcedure('media.rename', 'إعادة تسمية الوسائط');
const mediaDeleteProcedure = permissionProcedure('media.delete', 'حذف الوسائط');

export const mediaLibraryRouter = router({
  list: mediaViewProcedure
    .input(
      z.object({
        folderId: z.number().optional(),
        type: mediaTypeSchema.optional(),
        search: z.string().max(120).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      const conditions = [isNull(media.deletedAt)];

      if (input.folderId) {
        conditions.push(eq(media.folderId, input.folderId));
      }
      if (input.type) {
        conditions.push(eq(media.type, input.type));
      }
      if (input.search) {
        const query = `%${input.search.trim()}%`;
        const searchCondition = or(
          like(media.fileName, query),
          like(media.altAr, query),
          like(media.key, query)
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      return db
        .select({
          id: media.id,
          key: media.key,
          url: media.url,
          type: media.type,
          mimeType: media.mimeType,
          fileName: media.fileName,
          altAr: media.altAr,
          altEn: media.altEn,
          descriptionAr: media.descriptionAr,
          width: media.width,
          height: media.height,
          duration: media.duration,
          format: media.format,
          size: media.size,
          thumbnailUrl: media.thumbnailUrl,
          folderId: media.folderId,
          createdAt: media.createdAt,
          folderName: mediaFolders.name,
        })
        .from(media)
        .leftJoin(mediaFolders, eq(media.folderId, mediaFolders.id))
        .where(and(...conditions))
        .orderBy(asc(media.createdAt));
    }),

  create: mediaUploadProcedure.input(mediaInput).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();
    const [inserted] = await db.insert(media).values(input).$returningId();
    return { id: Number(inserted.id) };
  }),

  moveMany: mediaOrganizeProcedure
    .input(z.object({ ids: z.array(z.number()).min(1).max(100), folderId: z.number().nullable() }))
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      if (input.folderId) {
        const [folder] = await db
          .select({ id: mediaFolders.id })
          .from(mediaFolders)
          .where(eq(mediaFolders.id, input.folderId))
          .limit(1);
        if (!folder) {
          throw new Error('المجلد المحدد غير موجود');
        }
      }
      await db.update(media).set({ folderId: input.folderId }).where(inArray(media.id, input.ids));
      return { success: true, moved: input.ids.length };
    }),

  deleteMany: mediaDeleteProcedure
    .input(z.object({ ids: z.array(z.number()).min(1).max(100) }))
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      await db.update(media).set({ deletedAt: new Date() }).where(inArray(media.id, input.ids));
      return { success: true, deleted: input.ids.length };
    }),

  rename: mediaRenameProcedure
    .input(z.object({ id: z.number(), fileName: z.string().min(1).max(255) }))
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      await db.update(media).set({ fileName: input.fileName }).where(eq(media.id, input.id));
      return { success: true };
    }),

  folders: router({
    list: mediaViewProcedure.query(async () => {
      const db = await ensureDatabaseAvailable();
      return db.select().from(mediaFolders).orderBy(asc(mediaFolders.path));
    }),

    create: mediaOrganizeProcedure
      .input(
        z.object({ name: z.string().min(1).max(120), parentId: z.number().nullable().optional() })
      )
      .mutation(async ({ input }) => {
        const db = await ensureDatabaseAvailable();
        const name = normalizeFolderName(input.name);
        let parentPath = '';
        if (input.parentId) {
          const [parent] = await db
            .select()
            .from(mediaFolders)
            .where(eq(mediaFolders.id, input.parentId))
            .limit(1);
          if (!parent) {
            throw new Error('المجلد الأب غير موجود');
          }
          parentPath = parent.path;
        }
        const path = `${parentPath}/${name}`.replace(/\/+/g, '/');
        const [inserted] = await db
          .insert(mediaFolders)
          .values({ name, parentId: input.parentId ?? null, path })
          .$returningId();
        return { id: Number(inserted.id), name, path };
      }),

    rename: mediaOrganizeProcedure
      .input(z.object({ id: z.number(), name: z.string().min(1).max(120) }))
      .mutation(async ({ input }) => {
        const db = await ensureDatabaseAvailable();
        const name = normalizeFolderName(input.name);
        const [folder] = await db
          .select()
          .from(mediaFolders)
          .where(eq(mediaFolders.id, input.id))
          .limit(1);
        if (!folder) {
          throw new Error('المجلد غير موجود');
        }
        let parentPath = '';
        if (folder.parentId) {
          const [parent] = await db
            .select()
            .from(mediaFolders)
            .where(eq(mediaFolders.id, folder.parentId))
            .limit(1);
          if (parent) {
            parentPath = parent.path;
          }
        }
        const path = `${parentPath}/${name}`.replace(/\/+/g, '/');
        await db.update(mediaFolders).set({ name, path }).where(eq(mediaFolders.id, input.id));
        return { success: true, name, path };
      }),
  }),
});
