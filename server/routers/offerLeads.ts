import { router } from '../_core/trpc';
import { offerRegistrationRouter } from './offerLeads/registration';
import { offerQueriesRouter } from './offerLeads/queries';
import { offerStatsRouter } from './offerLeads/stats';
import { offerStatusRouter } from './offerLeads/status';
import { offerAdminRouter } from './offerLeads/admin';

export const offerLeadsRouter = router({
  // Backward compatibility - direct procedure exports
  submit: offerRegistrationRouter.submit,
  list: offerQueriesRouter.list,
  listPaginated: offerQueriesRouter.listPaginated,
  stats: offerStatsRouter.stats,
  updateStatus: offerStatusRouter.updateStatus,
  bulkUpdateStatus: offerStatusRouter.bulkUpdateStatus,
  delete: offerAdminRouter.delete,
  generateReceiptNumber: offerAdminRouter.generateReceiptNumber,

  // New nested structure (with different names to avoid conflicts)
  registrationRouter: offerRegistrationRouter,
  queriesRouter: offerQueriesRouter,
  statsRouter: offerStatsRouter,
  statusRouter: offerStatusRouter,
  adminRouter: offerAdminRouter,
});
