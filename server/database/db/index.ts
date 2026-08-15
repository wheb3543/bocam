// Database module - modularized for better maintainability
// This file re-exports all database functions from their respective modules

// Core database connection functions
export { getDb, getHospitalDb } from './connection';

// Users & Access Management
export {
  upsertUser,
  getUserByOpenId,
  getUserByUsername,
  getUserById,
  getUserByEmail,
  isUserAllowed,
  createAccessRequest,
  getAllAccessRequests,
  getPendingAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
} from './users';

// Appointments & Doctors
export {
  getAllDoctors,
  getDoctorById,
  createAppointment,
  getAllAppointments,
  getAppointmentsPaginated,
  updateAppointmentStatus,
  bulkUpdateAppointmentStatus,
} from './appointments';

// WhatsApp
export {
  normalizePhoneNumber,
  getCustomerInfoByPhone,
  getAllCustomerRecordsByPhone,
  getAllWhatsAppConversations,
  getWhatsAppConversationById,
  getWhatsAppConversationByPhone,
  createWhatsAppConversation,
  updateWhatsAppConversation,
  getWhatsAppMessagesByConversation,
  getLatestInboundWhatsAppMessage,
  getWhatsAppMessageByWhatsAppId,
  createWhatsAppMessage,
  updateWhatsAppMessage,
  getAllWhatsAppTemplates,
  getWhatsAppTemplateById,
  createWhatsAppTemplate,
  updateWhatsAppTemplate,
  deleteWhatsAppTemplate,
  createWhatsAppWebhookEvent,
  searchWhatsAppConversations,
  getUnreadWhatsAppConversationsCount,
} from './whatsapp';

// WhatsApp Extras (Alerts, Security, Quality, etc.)
export {
  createWhatsAppAccountAlert,
  createWhatsAppSecurityEvent,
  createWhatsAppPhoneQuality,
  createWhatsAppConversationQuality,
  createWhatsAppUserOptIn,
  updateWhatsAppUserOptIn,
  createWhatsAppTemplateQuality,
  getWhatsAppTemplateByMetaName,
} from './whatsappExtras';

// Campaigns
export {
  getCampaigns,
  getCampaignById,
  getCampaignBySlug,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignStats,
  getCampaignLinkedOffers,
  getCampaignLinkedCamps,
  getCampaignLinkedDoctors,
  linkOffersToCampaign,
  linkCampsToCampaign,
  linkDoctorsToCampaign,
  getCampaignAllLinks,
  getCampaignsOverview,
} from './campaigns';

// Patients
export {
  getPatientByPhone,
  getPatientById,
  createPatient,
  updatePatientLastLogin,
  updatePatientProfile,
  sanitizePatient,
  type SafePatient,
  createOtp,
  verifyOtp,
  verifyPatientPassword,
  getPatientAppointments,
  getPatientOfferLeads,
  getPatientCampRegistrations,
  getPatientResults,
  createPatientResult,
  updatePatientResultStatus,
} from './patients';

// Tasks
export {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getTasksStats,
  getTaskComments,
  addTaskComment,
  deleteTaskComment,
  getTaskAttachments,
  addTaskAttachment,
  deleteTaskAttachment,
  getTasksByUser,
  getTasksByCampaign,
  getOverdueTasks,
} from './tasks';

// Leads
export {
  getAllLeads,
  getLeadsByStatus,
  getLeadsByCampaign,
  getLeadById,
  createLead,
  updateLead,
  searchLeads,
  getLeadStatusHistory,
  createLeadStatusHistory,
  getLeadsStats,
} from './leads';

// Settings
export { getSetting, upsertSetting } from './settings';

// Message Settings
export {
  getAllMessageSettings,
  getMessageSettingsByCategory,
  getMessageSettingByType,
  updateMessageSetting,
  updateMessageSettingCompat,
  toggleMessageSettingEnabled,
} from './messageSettings';

// Webhook Events
export {
  getWebhookEvents,
  getUnhandledWebhookEventsCount,
  getUniqueEventTypes,
  logWebhookEvent,
  markWebhookEventAsProcessed,
} from './webhookEvents';

// User Preferences
export { getUserPreference, setUserPreference, getAllUserPreferences } from './userPreferences';

// Shared Templates
export {
  getSharedTemplate,
  getAllSharedTemplates,
  getSharedTemplates,
  createSharedTemplate,
  deleteSharedTemplate,
  updateSharedTemplate,
} from './sharedTemplates';

// Offer Leads
export { getOfferLeadsPaginated } from './offerLeads';

// Camp Registrations
export { getCampRegistrationsPaginated } from './campRegistrations';

// Unified Leads
export { getAllUnifiedLeads } from './unifiedLeads';
