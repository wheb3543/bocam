import { and, count, eq, inArray, isNotNull, lte } from 'drizzle-orm';
import {
  cmsTrashRetentionPolicies,
  contentApprovals,
  contentAuditLog,
  contentVersions,
  images,
  pages,
  sectionButtons,
  sections,
  textContent,
} from '../../../drizzle/schema';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { createLogger } from '../../_core/logger';
import { invalidateImagesCache, invalidateTextContentCache } from '../../routers/public/content';
import { invalidateAdminPagesCache } from '../../routers/content/pages';
import { invalidateAdminSectionsCache } from '../../routers/content/sections';
import { invalidateAdminTextContentCache } from '../../routers/content/textContent';

const logger = createLogger('cmsTrashRetention');
export const CMS_TRASH_RETENTION_POLICY_KEY = 'global';
export const DEFAULT_CMS_TRASH_RETENTION_DAYS = 30;

export type CmsTrashEntityType = 'textContent' | 'image' | 'page' | 'section' | 'sectionButton';
type PurgeCounters = Record<CmsTrashEntityType, number>;

export type CmsTrashPurgeResult = {
  taskUid: string;
  executedAt: string;
  cutoffAt: string | null;
  retentionDays: number;
  skipped: string | null;
  purged: PurgeCounters;
  deletedVersions: number;
  deletedApprovals: number;
};

function emptyPurgeCounters(): PurgeCounters {
  return { textContent: 0, image: 0, page: 0, section: 0, sectionButton: 0 };
}

export async function getCmsTrashRetentionPolicy(db: any) {
  const [policy] = await db
    .select()
    .from(cmsTrashRetentionPolicies)
    .where(eq(cmsTrashRetentionPolicies.policyKey, CMS_TRASH_RETENTION_POLICY_KEY))
    .limit(1);

  if (policy) {
    return policy;
  }

  await db.insert(cmsTrashRetentionPolicies).values({
    policyKey: CMS_TRASH_RETENTION_POLICY_KEY,
    retentionDays: DEFAULT_CMS_TRASH_RETENTION_DAYS,
    isEnabled: true,
  });

  const [createdPolicy] = await db
    .select()
    .from(cmsTrashRetentionPolicies)
    .where(eq(cmsTrashRetentionPolicies.policyKey, CMS_TRASH_RETENTION_POLICY_KEY))
    .limit(1);
  return createdPolicy;
}

async function invalidatePurgedEntityCaches(entityTypes: Set<CmsTrashEntityType>) {
  if (entityTypes.has('textContent')) {
    await invalidateAdminTextContentCache();
    invalidateTextContentCache();
  }
  if (entityTypes.has('image')) {
    invalidateImagesCache();
  }
  if (entityTypes.has('page')) {
    await invalidateAdminPagesCache();
  }
  if (entityTypes.has('section')) {
    await invalidateAdminSectionsCache();
  }
}

async function purgeEntityType(
  tx: any,
  options: {
    entityType: CmsTrashEntityType;
    table: any;
    versionEntityType: 'text' | 'image' | 'page' | 'section' | 'sectionButton';
    auditEntityType: 'text' | 'image' | 'page' | 'section' | 'sectionButton';
    approvalEntityType: CmsTrashEntityType;
    cutoff: Date;
    taskUid: string;
    retentionDays: number;
  }
) {
  const candidates = await tx
    .select()
    .from(options.table)
    .where(and(isNotNull(options.table.deletedAt), lte(options.table.deletedAt, options.cutoff)));

  const candidateIds = candidates.map((record: { id: number }) => record.id);
  const blockedIds = new Set<number>();
  if (candidateIds.length > 0 && options.entityType === 'page') {
    const [linkedSections, linkedText, linkedImages] = await Promise.all([
      tx
        .select({ pageId: sections.pageId })
        .from(sections)
        .where(inArray(sections.pageId, candidateIds)),
      tx
        .select({ pageId: textContent.pageId })
        .from(textContent)
        .where(inArray(textContent.pageId, candidateIds)),
      tx.select({ pageId: images.pageId }).from(images).where(inArray(images.pageId, candidateIds)),
    ]);
    [...linkedSections, ...linkedText, ...linkedImages].forEach(
      (record: { pageId: number | null }) => {
        if (record.pageId) {
          blockedIds.add(record.pageId);
        }
      }
    );
  }
  if (candidateIds.length > 0 && options.entityType === 'section') {
    const [linkedButtons, linkedText, linkedImages] = await Promise.all([
      tx
        .select({ sectionId: sectionButtons.sectionId })
        .from(sectionButtons)
        .where(inArray(sectionButtons.sectionId, candidateIds)),
      tx
        .select({ sectionId: textContent.sectionId })
        .from(textContent)
        .where(inArray(textContent.sectionId, candidateIds)),
      tx
        .select({ sectionId: images.sectionId })
        .from(images)
        .where(inArray(images.sectionId, candidateIds)),
    ]);
    [...linkedButtons, ...linkedText, ...linkedImages].forEach(
      (record: { sectionId: number | null }) => {
        if (record.sectionId) {
          blockedIds.add(record.sectionId);
        }
      }
    );
  }
  const records = candidates.filter((record: { id: number }) => !blockedIds.has(record.id));

  if (records.length === 0) {
    return { count: 0, deletedVersions: 0, deletedApprovals: 0 };
  }

  const ids = records.map((record: { id: number }) => record.id);
  const [versions] = await tx
    .select({ total: count() })
    .from(contentVersions)
    .where(
      and(
        eq(contentVersions.entityType, options.versionEntityType),
        inArray(contentVersions.entityId, ids)
      )
    );
  const [approvals] = await tx
    .select({ total: count() })
    .from(contentApprovals)
    .where(
      and(
        eq(contentApprovals.entityType, options.approvalEntityType),
        inArray(contentApprovals.entityId, ids)
      )
    );

  await tx
    .delete(contentVersions)
    .where(
      and(
        eq(contentVersions.entityType, options.versionEntityType),
        inArray(contentVersions.entityId, ids)
      )
    );
  await tx
    .delete(contentApprovals)
    .where(
      and(
        eq(contentApprovals.entityType, options.approvalEntityType),
        inArray(contentApprovals.entityId, ids)
      )
    );
  await tx.delete(options.table).where(inArray(options.table.id, ids));

  await tx.insert(contentAuditLog).values(
    records.map((record: { id: number; deletedAt: Date | null; status: string }) => ({
      entityType: options.auditEntityType,
      entityId: record.id,
      action: 'delete',
      oldValue: JSON.stringify({
        finalDeletion: true,
        deletedAt: record.deletedAt,
        status: record.status,
      }),
      newValue: JSON.stringify({ finalDeletion: true, retainedForDays: options.retentionDays }),
      reason: `حذف نهائي تلقائي بعد ${options.retentionDays} يوماً بواسطة مهمة احتفاظ CMS ${options.taskUid}`,
    }))
  );

  return {
    count: records.length,
    deletedVersions: versions?.total ?? 0,
    deletedApprovals: approvals?.total ?? 0,
  };
}

/**
 * ينفذ الحذف النهائي فقط عبر مهمة Heartbeat الموثقة والمطابقة للمعرف المحفوظ.
 * التنفيذ ذري لكل الدفعة ويحافظ على سجل تدقيق موجز دون إعادة حفظ بيانات المحتوى المحذوفة.
 */
export async function purgeExpiredCmsTrash(
  taskUid: string,
  now: Date = new Date()
): Promise<CmsTrashPurgeResult> {
  const db = await ensureDatabaseAvailable();
  const policy = await getCmsTrashRetentionPolicy(db);
  const baseResult: CmsTrashPurgeResult = {
    taskUid,
    executedAt: now.toISOString(),
    cutoffAt: null,
    retentionDays: policy?.retentionDays ?? DEFAULT_CMS_TRASH_RETENTION_DAYS,
    skipped: null,
    purged: emptyPurgeCounters(),
    deletedVersions: 0,
    deletedApprovals: 0,
  };

  if (!policy || !policy.isEnabled) {
    return { ...baseResult, skipped: 'policy-disabled' };
  }
  if (!policy.scheduleCronTaskUid || policy.scheduleCronTaskUid !== taskUid) {
    return { ...baseResult, skipped: 'unrecognized-task' };
  }

  const cutoff = new Date(now.getTime() - policy.retentionDays * 24 * 60 * 60 * 1000);
  const result = await db.transaction(async (tx: any) => {
    const entityOptions = [
      {
        entityType: 'sectionButton' as const,
        table: sectionButtons,
        versionEntityType: 'sectionButton' as const,
        auditEntityType: 'sectionButton' as const,
      },
      {
        entityType: 'textContent' as const,
        table: textContent,
        versionEntityType: 'text' as const,
        auditEntityType: 'text' as const,
      },
      {
        entityType: 'image' as const,
        table: images,
        versionEntityType: 'image' as const,
        auditEntityType: 'image' as const,
      },
      {
        entityType: 'section' as const,
        table: sections,
        versionEntityType: 'section' as const,
        auditEntityType: 'section' as const,
      },
      {
        entityType: 'page' as const,
        table: pages,
        versionEntityType: 'page' as const,
        auditEntityType: 'page' as const,
      },
    ];
    const purged = emptyPurgeCounters();
    let deletedVersions = 0;
    let deletedApprovals = 0;

    for (const entity of entityOptions) {
      const deleted = await purgeEntityType(tx, {
        ...entity,
        approvalEntityType: entity.entityType,
        cutoff,
        taskUid,
        retentionDays: policy.retentionDays,
      });
      purged[entity.entityType] = deleted.count;
      deletedVersions += deleted.deletedVersions;
      deletedApprovals += deleted.deletedApprovals;
    }

    const summary = {
      taskUid,
      executedAt: now.toISOString(),
      cutoffAt: cutoff.toISOString(),
      purged,
      deletedVersions,
      deletedApprovals,
    };
    await tx
      .update(cmsTrashRetentionPolicies)
      .set({ lastPurgeAt: now, lastPurgeSummary: JSON.stringify(summary) })
      .where(eq(cmsTrashRetentionPolicies.id, policy.id));

    return summary;
  });

  await invalidatePurgedEntityCaches(
    new Set(
      (Object.entries(result.purged) as Array<[CmsTrashEntityType, number]>)
        .filter(([, total]) => total > 0)
        .map(([entityType]) => entityType)
    )
  );
  logger.info('انتهى تنظيف سلة محتوى CMS وفق سياسة الاحتفاظ', result);

  return { ...baseResult, ...result };
}
