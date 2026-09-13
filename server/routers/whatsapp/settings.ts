import { router } from '../../_core/trpc';
import { connectionRouter } from './settings/routes/connectionRoutes';
import { autoReplyRouter } from './settings/routes/autoReplyRoutes';
import { schedulerRouter } from './settings/routes/schedulerRoutes';
import { securityRouter } from './settings/routes/securityRoutes';
import {
  qualityRouter,
  phoneQualityRouter,
  conversationQualityRouter,
} from './settings/routes/qualityRoutes';
import { subscriptionRouter } from './settings/routes/subscriptionRoutes';
import { webhookRouter } from './settings/routes/webhookRoutes';
import { accountHealthRouter } from './settings/routes/accountHealthRoutes';

export const settingsRouter = router({
  connection: connectionRouter,
  autoReply: autoReplyRouter,
  scheduler: schedulerRouter,
  security: securityRouter,
  quality: qualityRouter,
  phoneQuality: phoneQualityRouter,
  conversationQuality: conversationQualityRouter,
  userSubscriptions: subscriptionRouter,
  webhookEvents: webhookRouter,
  accountHealth: accountHealthRouter,
});
