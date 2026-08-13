/**
 * Import/Export Router
 * Router لاستيراد وتصدير المحتوى
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { pages, sections, sectionButtons, textContent, images } from '../../../drizzle/schema';
import { createLogger } from '../../_core/logger';

const logger = createLogger('importExport');

/**
 * Schema لتصدير المحتوى
 */
const exportSchema = z.object({
  includePages: z.boolean().default(true),
  includeSections: z.boolean().default(true),
  includeSectionButtons: z.boolean().default(true),
  includeTextContent: z.boolean().default(true),
  includeImages: z.boolean().default(true),
});

/**
 * Schema لاستيراد المحتوى
 */
const importSchema = z.object({
  pages: z.array(z.any()).optional(),
  sections: z.array(z.any()).optional(),
  sectionButtons: z.array(z.any()).optional(),
  textContent: z.array(z.any()).optional(),
  images: z.array(z.any()).optional(),
});

/**
 * Import/Export Router
 */
export const importExportRouter = router({
  /**
   * تصدير المحتوى
   */
  export: protectedProcedure.input(exportSchema).query(async ({ input }) => {
    const db = await ensureDatabaseAvailable();
    const exportData: Record<string, unknown> = {};

    try {
      if (input.includePages) {
        exportData.pages = await db.select().from(pages);
      }

      if (input.includeSections) {
        exportData.sections = await db.select().from(sections);
      }

      if (input.includeSectionButtons) {
        exportData.sectionButtons = await db.select().from(sectionButtons);
      }

      if (input.includeTextContent) {
        exportData.textContent = await db.select().from(textContent);
      }

      if (input.includeImages) {
        exportData.images = await db.select().from(images);
      }

      exportData.exportDate = new Date().toISOString();
      exportData.version = '1.0';

      logger.info('Content exported successfully');
      return exportData;
    } catch (error) {
      logger.error('Failed to export content', error);
      throw new Error('فشل تصدير المحتوى', { cause: error });
    }
  }),

  /**
   * استيراد المحتوى
   */
  import: protectedProcedure.input(importSchema).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    try {
      // استيراد الصفحات
      if (input.pages && input.pages.length > 0) {
        for (const page of input.pages) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { id, createdAt, updatedAt, ...pageData } = page as any;
          await db.insert(pages).values(pageData);
        }
        logger.info(`Imported ${input.pages.length} pages`);
      }

      // استيراد الأقسام
      if (input.sections && input.sections.length > 0) {
        for (const section of input.sections) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { id, createdAt, updatedAt, ...sectionData } = section as any;
          await db.insert(sections).values(sectionData);
        }
        logger.info(`Imported ${input.sections.length} sections`);
      }

      // استيراد أزرار الأقسام
      if (input.sectionButtons && input.sectionButtons.length > 0) {
        for (const button of input.sectionButtons) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { id, createdAt, updatedAt, ...buttonData } = button as any;
          await db.insert(sectionButtons).values(buttonData);
        }
        logger.info(`Imported ${input.sectionButtons.length} section buttons`);
      }

      // استيراد المحتوى النصي
      if (input.textContent && input.textContent.length > 0) {
        for (const text of input.textContent) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { id, createdAt, updatedAt, ...textData } = text as any;
          await db.insert(textContent).values(textData);
        }
        logger.info(`Imported ${input.textContent.length} text content items`);
      }

      // استيراد الصور
      if (input.images && input.images.length > 0) {
        for (const image of input.images) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { id, createdAt, updatedAt, ...imageData } = image as any;
          await db.insert(images).values(imageData);
        }
        logger.info(`Imported ${input.images.length} images`);
      }

      logger.info('Content imported successfully');
      return { success: true };
    } catch (error) {
      logger.error('Failed to import content', error);
      throw new Error('فشل استيراد المحتوى', { cause: error });
    }
  }),

  /**
   * الحصول على نظرة عامة على المحتوى للتصدير
   */
  getOverview: protectedProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();

    try {
      const [pagesCount, sectionsCount, buttonsCount, textCount, imagesCount] = await Promise.all([
        db
          .select()
          .from(pages)
          .then((data) => data.length),
        db
          .select()
          .from(sections)
          .then((data) => data.length),
        db
          .select()
          .from(sectionButtons)
          .then((data) => data.length),
        db
          .select()
          .from(textContent)
          .then((data) => data.length),
        db
          .select()
          .from(images)
          .then((data) => data.length),
      ]);

      return {
        pages: pagesCount,
        sections: sectionsCount,
        sectionButtons: buttonsCount,
        textContent: textCount,
        images: imagesCount,
      };
    } catch (error) {
      logger.error('Failed to get content overview', error);
      throw new Error('فشل الحصول على نظرة عامة على المحتوى', { cause: error });
    }
  }),
});
