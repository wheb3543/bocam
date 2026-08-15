import { mergeRouters } from '../../_core/trpc';
import { conversationsRouter } from './conversations';
import { messagesRouter } from './messages';
import { templatesRouter } from './templates';
import { analyticsRouter } from './analytics';
import { settingsRouter } from './settings';

export const whatsappAppRouter = mergeRouters(
  conversationsRouter,
  messagesRouter,
  templatesRouter,
  analyticsRouter,
  settingsRouter
);
