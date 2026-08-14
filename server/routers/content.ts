/**
 * Content Management Router
 * Router الرئيسي لنظام إدارة المحتوى
 */

import { router } from '../_core/trpc';
import { textContentRouter } from './content/textContent';
import { imagesRouter } from './content/images';
import { colorSchemeRouter } from './content/colorScheme';
import { seoSettingsRouter } from './content/seo';
import { auditLogRouter } from './content/auditLog';
import { contentVersionsRouter } from './content/contentVersions';
import { pagesRouter } from './content/pages';
import { sectionsRouter } from './content/sections';
import { sectionButtonsRouter } from './content/sectionButtons';
import { importExportRouter } from './content/importExport';
import { approvalsRouter } from './content/approvals';

/**
 * Router الرئيسي لنظام إدارة المحتوى
 * يجمع جميع الـ Routers الفرعية
 */
export const contentRouter = router({
  textContent: textContentRouter,
  images: imagesRouter,
  colorScheme: colorSchemeRouter,
  seoSettings: seoSettingsRouter,
  auditLog: auditLogRouter,
  contentVersions: contentVersionsRouter,
  pages: pagesRouter,
  sections: sectionsRouter,
  sectionButtons: sectionButtonsRouter,
  importExport: importExportRouter,
  approvals: approvalsRouter,
});
