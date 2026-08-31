import { and, eq, gte, inArray, isNotNull, isNull, lte } from 'drizzle-orm';
import { campaignAlertSchedules, campaigns } from '../../drizzle/schema';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';

type DbClient = Awaited<ReturnType<typeof ensureDatabaseAvailable>>;
import { createNotification } from '../_core/notificationHelper';
import { notifyEligibleRecipients } from './notificationPolicy';

const CAMPAIGN_ACTION_URL = '/admin/campaigns/campaigns';

function getCampaignWorkRecipients(input: {
  teamLeaderId: number | null;
  teamMembers: string | null;
}) {
  const recipientIds = new Set<number>();
  if (input.teamLeaderId && input.teamLeaderId > 0) {
    recipientIds.add(input.teamLeaderId);
  }
  try {
    const members = JSON.parse(input.teamMembers || '[]');
    if (Array.isArray(members)) {
      members.forEach((member) => {
        const userId = typeof member === 'number' ? member : Number(member?.userId ?? member?.id);
        if (Number.isInteger(userId) && userId > 0) {
          recipientIds.add(userId);
        }
      });
    }
  } catch {
    // تبقى القائمة فارغة لتستخدم سياسة المصدر الاحتياطية.
  }
  return Array.from(recipientIds);
}

export async function notifyCampaignLeaderAssigned(input: {
  userId: number;
  campaignId: number;
  campaignName: string;
}) {
  const db = await ensureDatabaseAvailable();
  return createNotification(db, {
    userId: input.userId,
    source: 'campaigns',
    type: 'campaign_assigned',
    title: 'تم إسناد قيادة حملة إليك',
    message: `تم إسناد قيادة حملة ${input.campaignName} إليك.`,
    entityType: 'campaign',
    entityId: input.campaignId,
    actionUrl: CAMPAIGN_ACTION_URL,
    actionLabel: 'فتح الحملات',
    priority: 'high',
  });
}

async function getCampaignAlertSchedule(db: DbClient) {
  const [schedule] = await db.select().from(campaignAlertSchedules).limit(1);
  if (schedule) {
    return schedule;
  }
  const [created] = await db
    .insert(campaignAlertSchedules)
    .values({ enabled: 'yes', endWarningDays: 7, budgetWarningPercent: 90 })
    .$returningId();
  return (
    await db
      .select()
      .from(campaignAlertSchedules)
      .where(eq(campaignAlertSchedules.id, created.id))
      .limit(1)
  )[0];
}

export async function attachCampaignAlertTask(db: DbClient, taskUid: string) {
  const schedule = await getCampaignAlertSchedule(db);
  await db
    .update(campaignAlertSchedules)
    .set({ scheduleCronTaskUid: taskUid, updatedAt: new Date() })
    .where(eq(campaignAlertSchedules.id, schedule.id));
  return getCampaignAlertSchedule(db);
}

export async function dispatchCampaignAlerts(taskUid: string, now = new Date()) {
  const db = await ensureDatabaseAvailable();
  const [schedule] = await db
    .select()
    .from(campaignAlertSchedules)
    .where(eq(campaignAlertSchedules.scheduleCronTaskUid, taskUid))
    .limit(1);
  if (!schedule || schedule.enabled !== 'yes') {
    return { skipped: 'disabled_or_orphan', alerted: 0 };
  }

  const endWindow = new Date(now.getTime() + schedule.endWarningDays * 24 * 60 * 60 * 1000);
  const endingCampaigns = await db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      endDate: campaigns.endDate,
      teamLeaderId: campaigns.teamLeaderId,
      teamMembers: campaigns.teamMembers,
    })
    .from(campaigns)
    .where(
      and(
        eq(campaigns.status, 'active'),
        isNotNull(campaigns.endDate),
        isNull(campaigns.endDateNotifiedAt),
        gte(campaigns.endDate, now),
        lte(campaigns.endDate, endWindow)
      )
    );
  const budgetCampaigns = await db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      plannedBudget: campaigns.plannedBudget,
      actualBudget: campaigns.actualBudget,
      budgetAlertLevel: campaigns.budgetAlertLevel,
      teamLeaderId: campaigns.teamLeaderId,
      teamMembers: campaigns.teamMembers,
    })
    .from(campaigns)
    .where(
      and(
        eq(campaigns.status, 'active'),
        isNotNull(campaigns.plannedBudget),
        isNotNull(campaigns.actualBudget),
        inArray(campaigns.budgetAlertLevel, [0, schedule.budgetWarningPercent])
      )
    );

  let alerted = 0;
  for (const campaign of endingCampaigns) {
    const recipientIds = getCampaignWorkRecipients(campaign);
    const result = await notifyEligibleRecipients(db, {
      source: 'campaigns',
      type: 'campaign_ending',
      title: 'حملة نشطة تقترب من النهاية',
      message: `تقترب الحملة ${campaign.name} من تاريخ نهايتها.`,
      entityType: 'campaign',
      entityId: campaign.id,
      actionUrl: CAMPAIGN_ACTION_URL,
      actionLabel: 'مراجعة الحملة',
      priority: 'medium',
      data: JSON.stringify({ event: 'campaign_ending', endDate: campaign.endDate?.toISOString() }),
      audience: { userIds: recipientIds, includeSourceRecipients: recipientIds.length === 0 },
    });
    if (result.recipients > 0) {
      await db
        .update(campaigns)
        .set({ endDateNotifiedAt: now })
        .where(eq(campaigns.id, campaign.id));
      alerted += 1;
    }
  }
  for (const campaign of budgetCampaigns) {
    const planned = Number(campaign.plannedBudget);
    const actual = Number(campaign.actualBudget);
    const percent = planned > 0 ? Math.round((actual / planned) * 100) : 0;
    const level =
      percent >= 100
        ? 100
        : percent >= schedule.budgetWarningPercent
          ? schedule.budgetWarningPercent
          : 0;
    if (level === 0 || level <= campaign.budgetAlertLevel) {
      continue;
    }
    const recipientIds = getCampaignWorkRecipients(campaign);
    const result = await notifyEligibleRecipients(db, {
      source: 'campaigns',
      type: 'campaign_budget_threshold',
      title: level === 100 ? 'تم تجاوز ميزانية حملة' : 'حملة تقترب من حد الميزانية',
      message: `بلغ إنفاق الحملة ${campaign.name} نسبة ${percent}% من ميزانيتها المخططة.`,
      entityType: 'campaign',
      entityId: campaign.id,
      actionUrl: CAMPAIGN_ACTION_URL,
      actionLabel: 'مراجعة الحملة',
      priority: level === 100 ? 'high' : 'medium',
      data: JSON.stringify({ event: 'campaign_budget_threshold', percent, level }),
      audience: { userIds: recipientIds, includeSourceRecipients: recipientIds.length === 0 },
    });
    if (result.recipients > 0) {
      await db
        .update(campaigns)
        .set({ budgetAlertLevel: level })
        .where(eq(campaigns.id, campaign.id));
      alerted += 1;
    }
  }
  await db
    .update(campaignAlertSchedules)
    .set({ lastRunAt: now, updatedAt: now })
    .where(eq(campaignAlertSchedules.id, schedule.id));
  return { skipped: null, alerted };
}
