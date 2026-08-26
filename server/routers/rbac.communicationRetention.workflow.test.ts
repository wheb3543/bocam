import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (file: string) => readFileSync(resolve(process.cwd(), file), 'utf8');

describe('الإنفاذ الدقيق للاحتفاظ بمحادثات التواصل', () => {
  it('يفصل أرشفة وحذف WhatsApp عن إجراء الإدارة العام', () => {
    const sourceText = source('server/routers/whatsapp/conversations.ts');
    expect(sourceText).toContain("permissionProcedure(\n  'communications.archive'");
    expect(sourceText).toContain("permissionProcedure(\n  'communications.delete'");
    expect(sourceText).toContain('archive: communicationArchiveProcedure');
    expect(sourceText).toContain('delete: communicationDeleteProcedure');
    expect(sourceText).toContain('bulkArchive: communicationArchiveProcedure');
  });

  it('يحمي أرشفة وحذف الصندوق الموحد ويسجل العملية في التدقيق', () => {
    const sourceText = source('server/routers/socialInbox.ts');
    expect(sourceText).toContain('archive: socialInboxArchiveProcedure');
    expect(sourceText).toContain('delete: socialInboxDeleteProcedure');
    expect(sourceText).toContain("action: input.isArchived ? 'archived' : 'unarchived'");
    expect(sourceText).toContain("action: 'deleted'");
  });
});
