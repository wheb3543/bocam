import { relations } from 'drizzle-orm/relations';
import { whatsappTemplates, messageSettings } from './schema';

export const messageSettingsRelations = relations(messageSettings, ({ one }) => ({
  whatsappTemplate: one(whatsappTemplates, {
    fields: [messageSettings.whatsappTemplateId],
    references: [whatsappTemplates.id],
  }),
}));

export const whatsappTemplatesRelations = relations(whatsappTemplates, ({ many }) => ({
  messageSettings: many(messageSettings),
}));
