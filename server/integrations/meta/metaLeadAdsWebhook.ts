export type MetaLeadgenNotification = {
  externalLeadId: string;
  externalFormId: string;
  externalPageId: string;
  eventKey: string;
  raw: Record<string, unknown>;
};

/** يستخرج إشعارات leadgen الرسمية فقط؛ لا يجلب حقول النموذج أو يسجل بيانات العميل في callback. */
export function extractMetaLeadgenNotifications(payload: unknown): MetaLeadgenNotification[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }
  const entries = Array.isArray((payload as { entry?: unknown[] }).entry)
    ? ((payload as { entry: unknown[] }).entry ?? [])
    : [];
  const notifications: MetaLeadgenNotification[] = [];
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }
    const entryRecord = entry as Record<string, unknown>;
    const pageId = typeof entryRecord.id === 'string' ? entryRecord.id : null;
    const changes = Array.isArray(entryRecord.changes) ? entryRecord.changes : [];
    for (const change of changes) {
      if (!change || typeof change !== 'object') {
        continue;
      }
      const changeRecord = change as Record<string, unknown>;
      const value =
        changeRecord.value && typeof changeRecord.value === 'object'
          ? (changeRecord.value as Record<string, unknown>)
          : null;
      if (changeRecord.field !== 'leadgen' || !value || !pageId) {
        continue;
      }
      const leadId = typeof value.leadgen_id === 'string' ? value.leadgen_id : null;
      const formId = typeof value.form_id === 'string' ? value.form_id : null;
      if (!leadId || !formId) {
        continue;
      }
      const eventTime = typeof value.created_time === 'number' ? value.created_time : Date.now();
      notifications.push({
        externalLeadId: leadId,
        externalFormId: formId,
        externalPageId: pageId,
        eventKey: `meta-leadgen:${pageId}:${leadId}:${eventTime}`.slice(0, 255),
        raw: { pageId, change: changeRecord },
      });
    }
  }
  return notifications;
}
