import { router } from '../../_core/trpc';
import { connectionRouter } from './settings/routes/connectionRoutes';
import { autoReplyRouter } from './settings/routes/autoReplyRoutes';
import { schedulerRouter } from './settings/routes/schedulerRoutes';
import { securityRouter } from './settings/routes/securityRoutes';
import { qualityRouter } from './settings/routes/qualityRoutes';
import { subscriptionRouter } from './settings/routes/subscriptionRoutes';
import { webhookRouter } from './settings/routes/webhookRoutes';

export const settingsRouter = router({
  connection: connectionRouter,
  autoReply: autoReplyRouter,
  scheduler: schedulerRouter,
  security: securityRouter,
  quality: qualityRouter,
  userSubscriptions: subscriptionRouter,
  webhookEvents: webhookRouter,
});
