import { router } from '../_core/trpc';
import { campRegistrationRouter } from './campRegistrations/registration';
import { campQueriesRouter } from './campRegistrations/queries';
import { campStatsRouter } from './campRegistrations/stats';
import { campStatusRouter } from './campRegistrations/status';
import { campAdminRouter } from './campRegistrations/admin';

export const campRegistrationsRouter = router({
  // Backward compatibility - direct procedure exports
  submit: campRegistrationRouter.submit,
  list: campQueriesRouter.list,
  listPaginated: campQueriesRouter.listPaginated,
  stats: campStatsRouter.stats,
  updateStatus: campStatusRouter.updateStatus,
  bulkUpdateStatus: campStatusRouter.bulkUpdateStatus,
  delete: campAdminRouter.delete,
  generateReceiptNumber: campAdminRouter.generateReceiptNumber,
  scheduleReport: campAdminRouter.scheduleReport,

  // New nested structure (with different names to avoid conflicts)
  registrationRouter: campRegistrationRouter,
  queriesRouter: campQueriesRouter,
  statsRouter: campStatsRouter,
  statusRouter: campStatusRouter,
  adminRouter: campAdminRouter,
});
