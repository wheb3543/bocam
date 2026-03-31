var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  accessRequests: () => accessRequests,
  appointments: () => appointments,
  auditLogs: () => auditLogs,
  campRegistrations: () => campRegistrations,
  campaignCamps: () => campaignCamps,
  campaignDoctors: () => campaignDoctors,
  campaignOffers: () => campaignOffers,
  campaigns: () => campaigns,
  camps: () => camps,
  comments: () => comments,
  doctors: () => doctors,
  followUpTasks: () => followUpTasks,
  leadStatusHistory: () => leadStatusHistory,
  leads: () => leads,
  messageSettings: () => messageSettings,
  messageTemplates: () => messageTemplates,
  offerLeads: () => offerLeads,
  offers: () => offers,
  patientOtps: () => patientOtps,
  patientResults: () => patientResults,
  patients: () => patients,
  projects: () => projects,
  savedFilters: () => savedFilters,
  settings: () => settings,
  sharedColumnTemplates: () => sharedColumnTemplates,
  taskAttachments: () => taskAttachments,
  taskComments: () => taskComments,
  taskDeliverables: () => taskDeliverables,
  tasks: () => tasks,
  teamMembers: () => teamMembers,
  teams: () => teams,
  userPreferences: () => userPreferences,
  users: () => users,
  whatsappAnalytics: () => whatsappAnalytics,
  whatsappAutoReplies: () => whatsappAutoReplies,
  whatsappBroadcasts: () => whatsappBroadcasts,
  whatsappConversations: () => whatsappConversations,
  whatsappMessages: () => whatsappMessages,
  whatsappTemplates: () => whatsappTemplates
});
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index } from "drizzle-orm/mysql-core";
var users, campaigns, leads, leadStatusHistory, settings, doctors, appointments, accessRequests, offers, camps, offerLeads, campRegistrations, teams, teamMembers, projects, tasks, taskDeliverables, taskComments, taskAttachments, whatsappConversations, whatsappMessages, whatsappTemplates, whatsappBroadcasts, whatsappAutoReplies, whatsappAnalytics, messageSettings, messageTemplates, comments, followUpTasks, userPreferences, sharedColumnTemplates, auditLogs, savedFilters, patients, patientOtps, patientResults, campaignOffers, campaignCamps, campaignDoctors;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
      id: int("id").autoincrement().primaryKey(),
      openId: varchar("openId", { length: 64 }),
      username: varchar("username", { length: 50 }).notNull().unique(),
      password: varchar("password", { length: 255 }).notNull(),
      name: text("name"),
      email: varchar("email", { length: 320 }),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: mysqlEnum("role", ["user", "admin", "manager", "staff", "viewer", "team_leader"]).default("user").notNull(),
      isActive: mysqlEnum("isActive", ["yes", "no"]).default("yes").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn")
    });
    campaigns = mysqlTable("campaigns", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      slug: varchar("slug", { length: 255 }).notNull().unique(),
      description: text("description"),
      // Campaign Type & Status
      type: mysqlEnum("type", ["digital", "field", "awareness", "mixed"]).default("digital").notNull(),
      status: mysqlEnum("status", ["draft", "active", "paused", "completed", "cancelled"]).default("draft").notNull(),
      // Budget
      plannedBudget: int("plannedBudget"),
      // الميزانية المخططة
      actualBudget: int("actualBudget"),
      // الميزانية الفعلية
      currency: varchar("currency", { length: 10 }).default("YER"),
      // Dates
      startDate: timestamp("startDate"),
      endDate: timestamp("endDate"),
      // Platforms (JSON array)
      platforms: text("platforms"),
      // ["facebook", "instagram", "google", "whatsapp", "field"]
      // Goals & KPIs
      goals: text("goals"),
      // الأهداف (JSON)
      targetLeads: int("targetLeads"),
      // هدف العملاء المحتملين
      targetBookings: int("targetBookings"),
      // هدف الحجوزات
      targetROI: int("targetROI"),
      // هدف عائد الاستثمار (%)
      // Team
      teamLeaderId: int("teamLeaderId"),
      // قائد الفريق
      teamMembers: text("teamMembers"),
      // JSON array of user IDs
      // Meta/Facebook Integration
      metaPixelId: varchar("metaPixelId", { length: 100 }),
      metaAccessToken: text("metaAccessToken"),
      // WhatsApp Integration
      whatsappEnabled: boolean("whatsappEnabled").default(false).notNull(),
      whatsappWelcomeMessage: text("whatsappWelcomeMessage"),
      // Legacy field
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    leads = mysqlTable("leads", {
      id: int("id").autoincrement().primaryKey(),
      campaignId: int("campaignId").notNull(),
      fullName: varchar("fullName", { length: 255 }).notNull(),
      phone: varchar("phone", { length: 20 }).notNull(),
      email: varchar("email", { length: 320 }),
      status: mysqlEnum("status", ["new", "contacted", "booked", "not_interested", "no_answer", "pending", "confirmed", "completed", "cancelled"]).default("new").notNull(),
      source: varchar("source", { length: 100 }),
      utmSource: varchar("utmSource", { length: 100 }),
      utmMedium: varchar("utmMedium", { length: 100 }),
      utmCampaign: varchar("utmCampaign", { length: 100 }),
      utmTerm: varchar("utmTerm", { length: 100 }),
      utmContent: varchar("utmContent", { length: 100 }),
      utmPlacement: varchar("utmPlacement", { length: 100 }),
      notes: text("notes"),
      emailSent: boolean("emailSent").default(false).notNull(),
      whatsappSent: boolean("whatsappSent").default(false).notNull(),
      bookingConfirmationSent: boolean("bookingConfirmationSent").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    leadStatusHistory = mysqlTable("leadStatusHistory", {
      id: int("id").autoincrement().primaryKey(),
      leadId: int("leadId").notNull(),
      userId: int("userId"),
      oldStatus: varchar("oldStatus", { length: 50 }),
      newStatus: varchar("newStatus", { length: 50 }).notNull(),
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    settings = mysqlTable("settings", {
      id: int("id").autoincrement().primaryKey(),
      key: varchar("key", { length: 100 }).notNull().unique(),
      value: text("value"),
      description: text("description"),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    doctors = mysqlTable("doctors", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      slug: varchar("slug", { length: 255 }).notNull().unique(),
      specialty: varchar("specialty", { length: 255 }).notNull(),
      image: varchar("image", { length: 500 }),
      bio: text("bio"),
      experience: varchar("experience", { length: 255 }),
      languages: varchar("languages", { length: 255 }),
      consultationFee: varchar("consultationFee", { length: 100 }),
      procedures: text("procedures"),
      // JSON array of available procedures
      isVisiting: mysqlEnum("isVisiting", ["yes", "no"]).default("no").notNull(),
      // Visiting doctor flag
      available: mysqlEnum("available", ["yes", "no"]).default("yes").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    appointments = mysqlTable("appointments", {
      id: int("id").autoincrement().primaryKey(),
      campaignId: int("campaignId").notNull(),
      doctorId: int("doctorId").notNull(),
      fullName: varchar("fullName", { length: 255 }).notNull(),
      phone: varchar("phone", { length: 20 }).notNull(),
      email: varchar("email", { length: 320 }),
      age: int("age"),
      // Patient age
      procedure: varchar("procedure", { length: 255 }),
      // Selected procedure
      preferredDate: varchar("preferredDate", { length: 50 }),
      preferredTime: varchar("preferredTime", { length: 50 }),
      appointmentDate: timestamp("appointmentDate"),
      // Confirmed appointment date/time
      notes: text("notes"),
      // Patient notes
      additionalNotes: text("additionalNotes"),
      // Additional patient notes
      staffNotes: text("staffNotes"),
      // Staff notes (admin only)
      status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed"]).default("pending").notNull(),
      source: varchar("source", { length: 100 }),
      // Booking source (web, phone, manual)
      utmSource: varchar("utmSource", { length: 100 }),
      utmMedium: varchar("utmMedium", { length: 100 }),
      utmCampaign: varchar("utmCampaign", { length: 100 }),
      utmTerm: varchar("utmTerm", { length: 100 }),
      utmContent: varchar("utmContent", { length: 100 }),
      utmPlacement: varchar("utmPlacement", { length: 100 }),
      referrer: varchar("referrer", { length: 500 }),
      fbclid: varchar("fbclid", { length: 255 }),
      gclid: varchar("gclid", { length: 255 }),
      receiptNumber: varchar("receiptNumber", { length: 50 }),
      // رقم السند التسلسلي
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    }, (table) => ({
      phoneIdx: index("appointments_phone_idx").on(table.phone),
      emailIdx: index("appointments_email_idx").on(table.email),
      statusIdx: index("appointments_status_idx").on(table.status),
      createdAtIdx: index("appointments_createdAt_idx").on(table.createdAt),
      doctorIdIdx: index("appointments_doctorId_idx").on(table.doctorId)
    }));
    accessRequests = mysqlTable("accessRequests", {
      id: int("id").autoincrement().primaryKey(),
      openId: varchar("openId", { length: 64 }),
      name: text("name").notNull(),
      email: varchar("email", { length: 320 }).notNull(),
      phone: varchar("phone", { length: 20 }),
      reason: text("reason"),
      status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
      requestedAt: timestamp("requestedAt").defaultNow().notNull(),
      reviewedAt: timestamp("reviewedAt"),
      reviewedBy: int("reviewedBy")
    });
    offers = mysqlTable("offers", {
      id: int("id").autoincrement().primaryKey(),
      title: varchar("title", { length: 255 }).notNull(),
      slug: varchar("slug", { length: 255 }).notNull().unique(),
      description: text("description"),
      imageUrl: varchar("imageUrl", { length: 500 }),
      isActive: boolean("isActive").default(true).notNull(),
      startDate: timestamp("startDate"),
      endDate: timestamp("endDate"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    camps = mysqlTable("camps", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      slug: varchar("slug", { length: 255 }).notNull().unique(),
      description: text("description"),
      imageUrl: varchar("imageUrl", { length: 500 }),
      startDate: timestamp("startDate"),
      endDate: timestamp("endDate"),
      isActive: boolean("isActive").default(true).notNull(),
      // New fields for advanced camp management
      freeOffers: text("freeOffers"),
      // Free offers (one per line)
      discountedOffers: text("discountedOffers"),
      // Discounted offers (one per line)
      availableProcedures: text("availableProcedures"),
      // JSON array of available procedures
      galleryImages: text("galleryImages"),
      // JSON array of image URLs
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    offerLeads = mysqlTable("offerLeads", {
      id: int("id").autoincrement().primaryKey(),
      offerId: int("offerId").notNull(),
      campaignId: int("campaignId"),
      // Optional: link to campaign
      fullName: varchar("fullName", { length: 255 }).notNull(),
      phone: varchar("phone", { length: 20 }).notNull(),
      email: varchar("email", { length: 320 }),
      notes: text("notes"),
      status: mysqlEnum("status", ["new", "contacted", "booked", "not_interested", "no_answer", "pending", "confirmed", "completed", "cancelled"]).default("new").notNull(),
      statusNotes: text("statusNotes"),
      source: varchar("source", { length: 100 }),
      utmSource: varchar("utmSource", { length: 100 }),
      utmMedium: varchar("utmMedium", { length: 100 }),
      utmCampaign: varchar("utmCampaign", { length: 100 }),
      utmTerm: varchar("utmTerm", { length: 100 }),
      utmContent: varchar("utmContent", { length: 100 }),
      utmPlacement: varchar("utmPlacement", { length: 100 }),
      referrer: varchar("referrer", { length: 500 }),
      fbclid: varchar("fbclid", { length: 255 }),
      gclid: varchar("gclid", { length: 255 }),
      receiptNumber: varchar("receiptNumber", { length: 50 }),
      // رقم السند التسلسلي
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    }, (table) => ({
      phoneIdx: index("offerLeads_phone_idx").on(table.phone),
      emailIdx: index("offerLeads_email_idx").on(table.email),
      statusIdx: index("offerLeads_status_idx").on(table.status),
      createdAtIdx: index("offerLeads_createdAt_idx").on(table.createdAt),
      offerIdIdx: index("offerLeads_offerId_idx").on(table.offerId)
    }));
    campRegistrations = mysqlTable("campRegistrations", {
      id: int("id").autoincrement().primaryKey(),
      campId: int("campId").notNull(),
      campaignId: int("campaignId"),
      // Optional: link to campaign
      fullName: varchar("fullName", { length: 255 }).notNull(),
      phone: varchar("phone", { length: 20 }).notNull(),
      email: varchar("email", { length: 320 }),
      age: int("age"),
      gender: mysqlEnum("gender", ["male", "female"]),
      procedures: text("procedures"),
      // JSON array of selected procedures
      medicalCondition: text("medicalCondition"),
      notes: text("notes"),
      status: mysqlEnum("status", ["pending", "confirmed", "attended", "cancelled"]).default("pending").notNull(),
      statusNotes: text("statusNotes"),
      attendanceDate: timestamp("attendanceDate"),
      source: varchar("source", { length: 100 }),
      utmSource: varchar("utmSource", { length: 100 }),
      utmMedium: varchar("utmMedium", { length: 100 }),
      utmCampaign: varchar("utmCampaign", { length: 100 }),
      utmTerm: varchar("utmTerm", { length: 100 }),
      utmContent: varchar("utmContent", { length: 100 }),
      utmPlacement: varchar("utmPlacement", { length: 100 }),
      referrer: varchar("referrer", { length: 500 }),
      fbclid: varchar("fbclid", { length: 255 }),
      gclid: varchar("gclid", { length: 255 }),
      receiptNumber: varchar("receiptNumber", { length: 50 }),
      // رقم السند التسلسلي
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    }, (table) => ({
      phoneIdx: index("campRegistrations_phone_idx").on(table.phone),
      emailIdx: index("campRegistrations_email_idx").on(table.email),
      statusIdx: index("campRegistrations_status_idx").on(table.status),
      createdAtIdx: index("campRegistrations_createdAt_idx").on(table.createdAt),
      campIdIdx: index("campRegistrations_campId_idx").on(table.campId)
    }));
    teams = mysqlTable("teams", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      slug: varchar("slug", { length: 255 }).notNull().unique(),
      description: text("description"),
      leaderId: int("leaderId"),
      // User ID of team leader
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    teamMembers = mysqlTable("teamMembers", {
      id: int("id").autoincrement().primaryKey(),
      teamId: int("teamId").notNull(),
      userId: int("userId").notNull(),
      role: mysqlEnum("role", ["leader", "member"]).default("member").notNull(),
      joinedAt: timestamp("joinedAt").defaultNow().notNull()
    });
    projects = mysqlTable("projects", {
      id: int("id").autoincrement().primaryKey(),
      title: varchar("title", { length: 255 }).notNull(),
      slug: varchar("slug", { length: 255 }).notNull().unique(),
      description: text("description"),
      startDate: timestamp("startDate"),
      endDate: timestamp("endDate"),
      status: mysqlEnum("status", ["planning", "active", "completed", "on_hold", "cancelled"]).default("planning").notNull(),
      priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
      createdBy: int("createdBy").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    tasks = mysqlTable("tasks", {
      id: int("id").autoincrement().primaryKey(),
      projectId: int("projectId"),
      // Optional: link to project
      teamId: int("teamId"),
      campaignId: int("campaignId"),
      // Link to campaign
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      assignedTo: int("assignedTo"),
      // User ID
      priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
      status: mysqlEnum("status", ["todo", "in_progress", "review", "completed", "cancelled"]).default("todo").notNull(),
      category: mysqlEnum("category", ["content", "design", "ads", "seo", "social_media", "analytics", "other"]).default("other").notNull(),
      dueDate: timestamp("dueDate"),
      completedAt: timestamp("completedAt"),
      estimatedHours: int("estimatedHours"),
      actualHours: int("actualHours"),
      tags: text("tags"),
      // JSON array of tags
      createdBy: int("createdBy").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    taskDeliverables = mysqlTable("taskDeliverables", {
      id: int("id").autoincrement().primaryKey(),
      taskId: int("taskId").notNull(),
      userId: int("userId").notNull(),
      // Who submitted
      fileUrl: varchar("fileUrl", { length: 500 }),
      notes: text("notes"),
      status: mysqlEnum("status", ["pending", "approved", "rejected", "revision_needed"]).default("pending").notNull(),
      reviewNotes: text("reviewNotes"),
      submittedAt: timestamp("submittedAt").defaultNow().notNull(),
      reviewedBy: int("reviewedBy"),
      // Who reviewed
      reviewedAt: timestamp("reviewedAt")
    });
    taskComments = mysqlTable("task_comments", {
      id: int("id").autoincrement().primaryKey(),
      taskId: int("taskId").notNull(),
      userId: int("userId").notNull(),
      content: text("content").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    taskAttachments = mysqlTable("task_attachments", {
      id: int("id").autoincrement().primaryKey(),
      taskId: int("taskId").notNull(),
      userId: int("userId").notNull(),
      fileName: varchar("fileName", { length: 255 }).notNull(),
      fileUrl: text("fileUrl").notNull(),
      fileType: varchar("fileType", { length: 100 }),
      fileSize: int("fileSize"),
      attachmentType: mysqlEnum("attachmentType", ["deliverable", "reference", "other"]).default("other").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    whatsappConversations = mysqlTable("whatsapp_conversations", {
      id: int("id").autoincrement().primaryKey(),
      phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
      customerName: varchar("customerName", { length: 255 }),
      lastMessage: text("lastMessage"),
      lastMessageAt: timestamp("lastMessageAt"),
      unreadCount: int("unreadCount").default(0).notNull(),
      isImportant: int("isImportant").default(0).notNull(),
      // 0 = false, 1 = true
      isArchived: int("isArchived").default(0).notNull(),
      // Link to booking/appointment
      leadId: int("leadId"),
      appointmentId: int("appointmentId"),
      offerLeadId: int("offerLeadId"),
      campRegistrationId: int("campRegistrationId"),
      assignedToUserId: int("assignedToUserId"),
      // Assigned staff member
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    whatsappMessages = mysqlTable("whatsapp_messages", {
      id: int("id").autoincrement().primaryKey(),
      conversationId: int("conversationId").notNull(),
      direction: mysqlEnum("direction", ["inbound", "outbound"]).notNull(),
      content: text("content").notNull(),
      messageType: mysqlEnum("messageType", ["text", "image", "document", "audio", "video", "location"]).default("text").notNull(),
      mediaUrl: varchar("mediaUrl", { length: 500 }),
      status: mysqlEnum("status", ["sent", "delivered", "read", "failed"]).default("sent").notNull(),
      whatsappMessageId: varchar("whatsappMessageId", { length: 255 }),
      // WhatsApp API message ID
      sentBy: int("sentBy"),
      // User ID who sent (for outbound)
      isAutomated: int("isAutomated").default(0).notNull(),
      // 0 = manual, 1 = automated
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    whatsappTemplates = mysqlTable("whatsapp_templates", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      category: mysqlEnum("category", ["confirmation", "reminder", "thank_you", "follow_up", "cancellation", "custom"]).notNull(),
      content: text("content").notNull(),
      variables: text("variables"),
      // JSON array of variable names like ["name", "date", "time"]
      isActive: int("isActive").default(1).notNull(),
      usageCount: int("usageCount").default(0).notNull(),
      createdBy: int("createdBy").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    whatsappBroadcasts = mysqlTable("whatsapp_broadcasts", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      message: text("message").notNull(),
      templateId: int("templateId"),
      targetFilter: text("targetFilter"),
      // JSON filter criteria
      recipientCount: int("recipientCount").default(0).notNull(),
      sentCount: int("sentCount").default(0).notNull(),
      deliveredCount: int("deliveredCount").default(0).notNull(),
      readCount: int("readCount").default(0).notNull(),
      failedCount: int("failedCount").default(0).notNull(),
      status: mysqlEnum("status", ["draft", "scheduled", "sending", "completed", "failed"]).default("draft").notNull(),
      scheduledAt: timestamp("scheduledAt"),
      completedAt: timestamp("completedAt"),
      createdBy: int("createdBy").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    whatsappAutoReplies = mysqlTable("whatsapp_auto_replies", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      triggerType: mysqlEnum("triggerType", ["keyword", "outside_hours", "first_message", "faq"]).notNull(),
      triggerValue: varchar("triggerValue", { length: 500 }),
      // Keyword or FAQ question
      replyMessage: text("replyMessage").notNull(),
      isActive: int("isActive").default(1).notNull(),
      priority: int("priority").default(0).notNull(),
      // Higher priority rules are checked first
      usageCount: int("usageCount").default(0).notNull(),
      createdBy: int("createdBy").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    whatsappAnalytics = mysqlTable("whatsapp_analytics", {
      id: int("id").autoincrement().primaryKey(),
      date: varchar("date", { length: 10 }).notNull(),
      // YYYY-MM-DD
      messagesSent: int("messagesSent").default(0).notNull(),
      messagesReceived: int("messagesReceived").default(0).notNull(),
      conversationsStarted: int("conversationsStarted").default(0).notNull(),
      averageResponseTime: int("averageResponseTime").default(0).notNull(),
      // in minutes
      conversionRate: int("conversionRate").default(0).notNull(),
      // percentage * 100
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    messageSettings = mysqlTable("message_settings", {
      id: int("id").autoincrement().primaryKey(),
      // Message Type Identifier
      messageType: varchar("messageType", { length: 100 }).notNull().unique(),
      // Display name in Arabic
      displayName: varchar("displayName", { length: 255 }).notNull(),
      // Category: patient_journey, executive_reports, task_management, doctor_notifications
      category: mysqlEnum("category", ["patient_journey", "executive_reports", "task_management", "doctor_notifications"]).notNull(),
      // Message content template
      messageContent: text("messageContent").notNull(),
      // Enabled/Disabled
      isEnabled: int("isEnabled").default(1).notNull(),
      // 1 = enabled, 0 = disabled
      // Delivery channel: whatsapp_api, whatsapp_integration, both
      deliveryChannel: mysqlEnum("deliveryChannel", ["whatsapp_api", "whatsapp_integration", "both"]).default("whatsapp_integration").notNull(),
      // Variables available in template (JSON array)
      availableVariables: text("availableVariables"),
      // ["name", "date", "time", "doctor", "service"]
      // Description
      description: text("description"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    messageTemplates = mysqlTable("message_templates", {
      id: int("id").autoincrement().primaryKey(),
      // Template name in Meta (must match exactly)
      templateName: varchar("templateName", { length: 255 }).notNull().unique(),
      // Display name in Arabic for UI
      displayName: varchar("displayName", { length: 255 }).notNull(),
      // Template category in Meta
      category: mysqlEnum("category", ["MARKETING", "UTILITY", "AUTHENTICATION"]).notNull(),
      // Template language code (e.g., "ar", "en")
      languageCode: varchar("languageCode", { length: 10 }).default("ar").notNull(),
      // Template status from Meta
      status: mysqlEnum("status", ["PENDING", "APPROVED", "REJECTED", "DISABLED"]).default("PENDING").notNull(),
      // Template content (for reference)
      headerText: text("headerText"),
      bodyText: text("bodyText").notNull(),
      footerText: text("footerText"),
      // Buttons configuration (JSON)
      buttons: text("buttons"),
      // [{"type": "QUICK_REPLY", "text": "تأكيد الحجز ✅"}, {"type": "QUICK_REPLY", "text": "إلغاء الحجز ❌"}]
      // Variables in template (JSON array)
      variables: text("variables"),
      // ["name", "date", "time", "doctor"]
      // Meta template ID (if available)
      metaTemplateId: varchar("metaTemplateId", { length: 255 }),
      // Link to message_settings (optional)
      linkedMessageType: varchar("linkedMessageType", { length: 100 }),
      // Usage tracking
      usageCount: int("usageCount").default(0).notNull(),
      lastUsedAt: timestamp("lastUsedAt"),
      // Metadata
      description: text("description"),
      createdBy: int("createdBy").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    comments = mysqlTable("comments", {
      id: int("id").autoincrement().primaryKey(),
      // Entity type and ID (polymorphic relationship)
      entityType: mysqlEnum("entityType", ["appointment", "lead", "offerLead", "campRegistration"]).notNull(),
      entityId: int("entityId").notNull(),
      // Comment content
      content: text("content").notNull(),
      // Author
      userId: int("userId").notNull(),
      userName: varchar("userName", { length: 255 }).notNull(),
      // Metadata
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    }, (table) => ({
      entityIdx: index("comments_entity_idx").on(table.entityType, table.entityId),
      createdAtIdx: index("comments_createdAt_idx").on(table.createdAt)
    }));
    followUpTasks = mysqlTable("followUpTasks", {
      id: int("id").autoincrement().primaryKey(),
      // Entity type and ID (polymorphic relationship)
      entityType: mysqlEnum("entityType", ["appointment", "lead", "offerLead", "campRegistration"]).notNull(),
      entityId: int("entityId").notNull(),
      // Task details
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      // Status and priority
      status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
      priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
      // Due date
      dueDate: timestamp("dueDate"),
      // Assignment
      assignedToId: int("assignedToId"),
      assignedToName: varchar("assignedToName", { length: 255 }),
      // Creator
      createdById: int("createdById").notNull(),
      createdByName: varchar("createdByName", { length: 255 }).notNull(),
      // Completion
      completedAt: timestamp("completedAt"),
      completedById: int("completedById"),
      completedByName: varchar("completedByName", { length: 255 }),
      // Metadata
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    }, (table) => ({
      entityIdx: index("tasks_entity_idx").on(table.entityType, table.entityId),
      statusIdx: index("tasks_status_idx").on(table.status),
      dueDateIdx: index("tasks_dueDate_idx").on(table.dueDate),
      assignedToIdx: index("tasks_assignedTo_idx").on(table.assignedToId)
    }));
    userPreferences = mysqlTable("userPreferences", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      // Preference key (e.g., 'appointmentVisibleColumns', 'offerLeadVisibleColumns')
      preferenceKey: varchar("preferenceKey", { length: 100 }).notNull(),
      // Preference value (JSON string)
      preferenceValue: text("preferenceValue").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    }, (table) => ({
      userKeyIdx: index("userPreferences_userKey_idx").on(table.userId, table.preferenceKey)
    }));
    sharedColumnTemplates = mysqlTable("sharedColumnTemplates", {
      id: int("id").autoincrement().primaryKey(),
      /** اسم القالب */
      name: varchar("name", { length: 100 }).notNull(),
      /** نوع الجدول: appointments, offerLeads, campRegistrations */
      tableKey: varchar("tableKey", { length: 50 }).notNull(),
      /** إعدادات الأعمدة المرئية (JSON) */
      columns: text("columns").notNull(),
      /** معرف المستخدم الذي أنشأ القالب (المدير) */
      createdBy: int("createdBy").notNull(),
      /** اسم المنشئ */
      createdByName: varchar("createdByName", { length: 255 }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    }, (table) => ({
      tableKeyIdx: index("sharedColumnTemplates_tableKey_idx").on(table.tableKey)
    }));
    auditLogs = mysqlTable("auditLogs", {
      id: int("id").autoincrement().primaryKey(),
      /** نوع الكيان: appointment, offerLead, campRegistration, lead */
      entityType: varchar("entityType", { length: 50 }).notNull(),
      /** معرف الكيان */
      entityId: int("entityId").notNull(),
      /** نوع الإجراء: status_change, bulk_update, delete, create, update */
      action: varchar("action", { length: 50 }).notNull(),
      /** القيمة القديمة (JSON) */
      oldValue: text("oldValue"),
      /** القيمة الجديدة (JSON) */
      newValue: text("newValue"),
      /** معرف المستخدم الذي أجرى التغيير */
      userId: int("userId"),
      /** اسم المستخدم الذي أجرى التغيير */
      userName: varchar("userName", { length: 255 }),
      /** ملاحظات إضافية */
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    }, (table) => ({
      entityIdx: index("auditLogs_entity_idx").on(table.entityType, table.entityId),
      actionIdx: index("auditLogs_action_idx").on(table.action),
      userIdx: index("auditLogs_user_idx").on(table.userId)
    }));
    savedFilters = mysqlTable("savedFilters", {
      id: int("id").autoincrement().primaryKey(),
      /** اسم الفلتر */
      name: varchar("name", { length: 100 }).notNull(),
      /** نوع الصفحة: appointments, offerLeads, campRegistrations */
      pageType: varchar("pageType", { length: 50 }).notNull(),
      /** إعدادات الفلاتر (JSON) */
      filterConfig: text("filterConfig").notNull(),
      /** معرف المستخدم */
      userId: int("userId").notNull(),
      /** هل هو فلتر افتراضي */
      isDefault: boolean("isDefault").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    }, (table) => ({
      userPageIdx: index("savedFilters_userPage_idx").on(table.userId, table.pageType)
    }));
    patients = mysqlTable("patients", {
      id: int("id").autoincrement().primaryKey(),
      /** الاسم الكامل */
      fullName: varchar("fullName", { length: 255 }).notNull(),
      /** رقم الهاتف (فريد - يستخدم لتسجيل الدخول) */
      phone: varchar("phone", { length: 20 }).notNull().unique(),
      /** العنوان */
      address: text("address"),
      /** العمر */
      age: int("age"),
      /** الجنس */
      gender: mysqlEnum("gender", ["male", "female"]).notNull(),
      /** البريد الإلكتروني (اختياري) */
      email: varchar("email", { length: 320 }),
      /** حالة الحساب */
      isActive: boolean("isActive").default(true).notNull(),
      /** آخر تسجيل دخول */
      lastLoginAt: timestamp("lastLoginAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    }, (table) => ({
      phoneIdx: index("patients_phone_idx").on(table.phone)
    }));
    patientOtps = mysqlTable("patientOtps", {
      id: int("id").autoincrement().primaryKey(),
      /** رقم الهاتف */
      phone: varchar("phone", { length: 20 }).notNull(),
      /** رمز التحقق */
      code: varchar("code", { length: 6 }).notNull(),
      /** تاريخ الانتهاء */
      expiresAt: timestamp("expiresAt").notNull(),
      /** هل تم استخدامه */
      isUsed: boolean("isUsed").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    }, (table) => ({
      phoneIdx: index("patientOtps_phone_idx").on(table.phone)
    }));
    patientResults = mysqlTable("patientResults", {
      id: int("id").autoincrement().primaryKey(),
      /** معرف المريض */
      patientId: int("patientId").notNull(),
      /** نوع النتيجة */
      resultType: mysqlEnum("resultType", ["lab", "radiology", "report"]).notNull(),
      /** عنوان النتيجة */
      title: varchar("title", { length: 255 }).notNull(),
      /** وصف */
      description: text("description"),
      /** رابط الملف */
      fileUrl: varchar("fileUrl", { length: 500 }),
      /** اسم الطبيب */
      doctorName: varchar("doctorName", { length: 255 }),
      /** تاريخ النتيجة */
      resultDate: timestamp("resultDate"),
      /** حالة النتيجة */
      status: mysqlEnum("status", ["pending", "ready", "delivered"]).default("pending").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    }, (table) => ({
      patientIdx: index("patientResults_patient_idx").on(table.patientId)
    }));
    campaignOffers = mysqlTable("campaignOffers", {
      id: int("id").autoincrement().primaryKey(),
      campaignId: int("campaignId").notNull(),
      offerId: int("offerId").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    }, (table) => ({
      campaignIdx: index("campaignOffers_campaign_idx").on(table.campaignId),
      offerIdx: index("campaignOffers_offer_idx").on(table.offerId),
      uniqueIdx: index("campaignOffers_unique_idx").on(table.campaignId, table.offerId)
    }));
    campaignCamps = mysqlTable("campaignCamps", {
      id: int("id").autoincrement().primaryKey(),
      campaignId: int("campaignId").notNull(),
      campId: int("campId").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    }, (table) => ({
      campaignIdx: index("campaignCamps_campaign_idx").on(table.campaignId),
      campIdx: index("campaignCamps_camp_idx").on(table.campId),
      uniqueIdx: index("campaignCamps_unique_idx").on(table.campaignId, table.campId)
    }));
    campaignDoctors = mysqlTable("campaignDoctors", {
      id: int("id").autoincrement().primaryKey(),
      campaignId: int("campaignId").notNull(),
      doctorId: int("doctorId").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    }, (table) => ({
      campaignIdx: index("campaignDoctors_campaign_idx").on(table.campaignId),
      doctorIdx: index("campaignDoctors_doctor_idx").on(table.doctorId),
      uniqueIdx: index("campaignDoctors_unique_idx").on(table.campaignId, table.doctorId)
    }));
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  approveAccessRequest: () => approveAccessRequest,
  bulkUpdateAppointmentStatus: () => bulkUpdateAppointmentStatus,
  createAccessRequest: () => createAccessRequest,
  createAppointment: () => createAppointment,
  createCampaign: () => createCampaign,
  createLead: () => createLead,
  createLeadStatusHistory: () => createLeadStatusHistory,
  createSharedTemplate: () => createSharedTemplate,
  createWhatsAppConversation: () => createWhatsAppConversation,
  createWhatsAppMessage: () => createWhatsAppMessage,
  createWhatsAppTemplate: () => createWhatsAppTemplate,
  deleteSharedTemplate: () => deleteSharedTemplate,
  deleteWhatsAppTemplate: () => deleteWhatsAppTemplate,
  getAllAccessRequests: () => getAllAccessRequests,
  getAllAppointments: () => getAllAppointments,
  getAllCampaigns: () => getAllCampaigns,
  getAllDoctors: () => getAllDoctors,
  getAllLeads: () => getAllLeads,
  getAllMessageSettings: () => getAllMessageSettings,
  getAllSharedTemplates: () => getAllSharedTemplates,
  getAllUnifiedLeads: () => getAllUnifiedLeads,
  getAllUserPreferences: () => getAllUserPreferences,
  getAllWhatsAppConversations: () => getAllWhatsAppConversations,
  getAllWhatsAppTemplates: () => getAllWhatsAppTemplates,
  getAppointmentsPaginated: () => getAppointmentsPaginated,
  getCampRegistrationsPaginated: () => getCampRegistrationsPaginated,
  getCampaignById: () => getCampaignById,
  getCampaignBySlug: () => getCampaignBySlug,
  getCampaignStats: () => getCampaignStats,
  getDb: () => getDb,
  getDoctorById: () => getDoctorById,
  getLeadById: () => getLeadById,
  getLeadStatusHistory: () => getLeadStatusHistory,
  getLeadsByCampaign: () => getLeadsByCampaign,
  getLeadsByStatus: () => getLeadsByStatus,
  getLeadsStats: () => getLeadsStats,
  getMessageSettingByType: () => getMessageSettingByType,
  getMessageSettingsByCategory: () => getMessageSettingsByCategory,
  getOfferLeadsPaginated: () => getOfferLeadsPaginated,
  getPendingAccessRequests: () => getPendingAccessRequests,
  getSetting: () => getSetting,
  getSharedTemplates: () => getSharedTemplates,
  getUnreadWhatsAppConversationsCount: () => getUnreadWhatsAppConversationsCount,
  getUserByEmail: () => getUserByEmail,
  getUserById: () => getUserById,
  getUserByOpenId: () => getUserByOpenId,
  getUserByUsername: () => getUserByUsername,
  getUserPreference: () => getUserPreference,
  getWhatsAppConversationById: () => getWhatsAppConversationById,
  getWhatsAppConversationByPhone: () => getWhatsAppConversationByPhone,
  getWhatsAppMessagesByConversation: () => getWhatsAppMessagesByConversation,
  getWhatsAppTemplateById: () => getWhatsAppTemplateById,
  isUserAllowed: () => isUserAllowed,
  rejectAccessRequest: () => rejectAccessRequest,
  searchLeads: () => searchLeads,
  searchWhatsAppConversations: () => searchWhatsAppConversations,
  setUserPreference: () => setUserPreference,
  toggleMessageSettingEnabled: () => toggleMessageSettingEnabled,
  updateAppointmentStatus: () => updateAppointmentStatus,
  updateCampaign: () => updateCampaign,
  updateLead: () => updateLead,
  updateMessageSetting: () => updateMessageSetting,
  updateSharedTemplate: () => updateSharedTemplate,
  updateWhatsAppConversation: () => updateWhatsAppConversation,
  updateWhatsAppMessage: () => updateWhatsAppMessage,
  updateWhatsAppTemplate: () => updateWhatsAppTemplate,
  upsertSetting: () => upsertSetting,
  upsertUser: () => upsertUser
});
import { eq, desc, and, like, or, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  if (!user.openId) {
    console.warn("[Database] Cannot upsert user: openId is required");
    return;
  }
  try {
    const existing = await getUserByOpenId(user.openId);
    if (existing) {
      await db.update(users).set({
        name: user.name ?? existing.name,
        email: user.email ?? existing.email,
        loginMethod: user.loginMethod ?? existing.loginMethod,
        lastSignedIn: user.lastSignedIn ?? /* @__PURE__ */ new Date()
      }).where(eq(users.openId, user.openId));
      console.log("[Database] User updated:", user.email);
    } else {
      console.warn("[Database] User not found, cannot create via upsertUser:", user.email);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserByUsername(username) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserById(id) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function isUserAllowed(email) {
  const user = await getUserByEmail(email);
  return user !== void 0 && user.isActive === "yes";
}
async function createAccessRequest(request) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(accessRequests).where(eq(accessRequests.email, request.email)).limit(1);
  if (existing.length > 0) {
    return existing[0];
  }
  const result = await db.insert(accessRequests).values(request);
  return { id: Number(result[0].insertId), ...request };
}
async function getAllAccessRequests() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(accessRequests).orderBy(desc(accessRequests.requestedAt));
}
async function getPendingAccessRequests() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(accessRequests).where(eq(accessRequests.status, "pending")).orderBy(desc(accessRequests.requestedAt));
}
async function approveAccessRequest(requestId, reviewerId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const request = await db.select().from(accessRequests).where(eq(accessRequests.id, requestId)).limit(1);
  if (request.length === 0) {
    throw new Error("Request not found");
  }
  if (!request[0].openId) {
    throw new Error("Request missing openId");
  }
  await db.insert(users).values({
    openId: request[0].openId,
    username: request[0].email.split("@")[0],
    password: "temp_password",
    name: request[0].name,
    email: request[0].email,
    role: "user",
    isActive: "yes"
  });
  await db.update(accessRequests).set({
    status: "approved",
    reviewedAt: /* @__PURE__ */ new Date(),
    reviewedBy: reviewerId
  }).where(eq(accessRequests.id, requestId));
}
async function rejectAccessRequest(requestId, reviewerId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(accessRequests).set({
    status: "rejected",
    reviewedAt: /* @__PURE__ */ new Date(),
    reviewedBy: reviewerId
  }).where(eq(accessRequests.id, requestId));
}
async function getAllCampaigns() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
}
async function getCampaignBySlug(slug) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(campaigns).where(eq(campaigns.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getCampaignById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createCampaign(campaign) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(campaigns).values(campaign);
  return result;
}
async function updateCampaign(id, campaign) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(campaigns).set(campaign).where(eq(campaigns.id, id));
}
async function getAllLeads() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt));
}
async function getLeadsByStatus(status) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).where(eq(leads.status, status)).orderBy(desc(leads.createdAt));
}
async function getLeadsByCampaign(campaignId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).where(eq(leads.campaignId, campaignId)).orderBy(desc(leads.createdAt));
}
async function getLeadById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createLead(lead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(leads).values(lead);
  return result;
}
async function updateLead(id, lead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(leads).set(lead).where(eq(leads.id, id));
}
async function searchLeads(searchTerm) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).where(
    or(
      like(leads.fullName, `%${searchTerm}%`),
      like(leads.phone, `%${searchTerm}%`),
      like(leads.email, `%${searchTerm}%`)
    )
  ).orderBy(desc(leads.createdAt));
}
async function getLeadStatusHistory(leadId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leadStatusHistory).where(eq(leadStatusHistory.leadId, leadId)).orderBy(desc(leadStatusHistory.createdAt));
}
async function createLeadStatusHistory(history) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(leadStatusHistory).values(history);
}
async function getSetting(key) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function upsertSetting(setting) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(settings).values(setting).onDuplicateKeyUpdate({
    set: { value: setting.value, updatedAt: /* @__PURE__ */ new Date() }
  });
}
async function getLeadsStats() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({
    total: sql`count(*)`,
    new: sql`sum(case when status = 'new' then 1 else 0 end)`,
    contacted: sql`sum(case when status = 'contacted' then 1 else 0 end)`,
    booked: sql`sum(case when status = 'booked' then 1 else 0 end)`,
    notInterested: sql`sum(case when status = 'not_interested' then 1 else 0 end)`,
    noAnswer: sql`sum(case when status = 'no_answer' then 1 else 0 end)`
  }).from(leads);
  return result[0];
}
async function getCampaignStats(campaignId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({
    total: sql`count(*)`,
    new: sql`sum(case when status = 'new' then 1 else 0 end)`,
    contacted: sql`sum(case when status = 'contacted' then 1 else 0 end)`,
    booked: sql`sum(case when status = 'booked' then 1 else 0 end)`,
    notInterested: sql`sum(case when status = 'not_interested' then 1 else 0 end)`,
    noAnswer: sql`sum(case when status = 'no_answer' then 1 else 0 end)`
  }).from(leads).where(eq(leads.campaignId, campaignId));
  return result[0];
}
async function getAllDoctors() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(doctors).where(eq(doctors.available, "yes"));
  return result;
}
async function getDoctorById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(doctors).where(eq(doctors.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createAppointment(appointment) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create appointment: database not available");
    return null;
  }
  try {
    const result = await db.insert(appointments).values(appointment);
    return { success: true, insertId: Number(result[0].insertId) };
  } catch (error) {
    console.error("[Database] Failed to create appointment:", error);
    throw error;
  }
}
async function getAllAppointments() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    id: appointments.id,
    campaignId: appointments.campaignId,
    doctorId: appointments.doctorId,
    fullName: appointments.fullName,
    phone: appointments.phone,
    email: appointments.email,
    age: appointments.age,
    procedure: appointments.procedure,
    preferredDate: appointments.preferredDate,
    preferredTime: appointments.preferredTime,
    additionalNotes: appointments.additionalNotes,
    staffNotes: appointments.staffNotes,
    notes: appointments.notes,
    status: appointments.status,
    source: appointments.source,
    receiptNumber: appointments.receiptNumber,
    appointmentDate: appointments.appointmentDate,
    utmSource: appointments.utmSource,
    utmMedium: appointments.utmMedium,
    utmCampaign: appointments.utmCampaign,
    utmTerm: appointments.utmTerm,
    utmContent: appointments.utmContent,
    utmPlacement: appointments.utmPlacement,
    referrer: appointments.referrer,
    fbclid: appointments.fbclid,
    gclid: appointments.gclid,
    createdAt: appointments.createdAt,
    updatedAt: appointments.updatedAt,
    doctorName: doctors.name,
    doctorSpecialty: doctors.specialty
  }).from(appointments).leftJoin(doctors, eq(appointments.doctorId, doctors.id));
  return result;
}
async function getAppointmentsPaginated(page = 1, limit = 20, searchTerm, doctorIds, sources, statuses, dateFilter, dateFrom, dateTo) {
  const db = await getDb();
  if (!db) return { data: [], total: 0, page, limit, totalPages: 0 };
  const isShowAll = limit === -1;
  const offset = isShowAll ? 0 : (page - 1) * limit;
  const whereConditions = [];
  if (searchTerm && searchTerm.trim()) {
    const searchPattern = `%${searchTerm.trim()}%`;
    whereConditions.push(
      or(
        like(appointments.fullName, searchPattern),
        like(appointments.phone, searchPattern),
        like(appointments.email, searchPattern)
      )
    );
  }
  if (doctorIds && doctorIds.length > 0) {
    whereConditions.push(inArray(appointments.doctorId, doctorIds));
  }
  if (sources && sources.length > 0) {
    whereConditions.push(inArray(appointments.source, sources));
  }
  if (statuses && statuses.length > 0) {
    whereConditions.push(inArray(appointments.status, statuses));
  }
  if (dateFrom && dateTo) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    whereConditions.push(
      and(
        sql`${appointments.createdAt} >= ${from.toISOString()}`,
        sql`${appointments.createdAt} <= ${to.toISOString()}`
      )
    );
  } else if (dateFilter && dateFilter !== "all") {
    const now = /* @__PURE__ */ new Date();
    let startDate;
    if (dateFilter === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateFilter === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
    } else if (dateFilter === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    if (startDate) {
      whereConditions.push(sql`${appointments.createdAt} >= ${startDate.toISOString()}`);
    }
  }
  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : void 0;
  const countQuery = db.select({ count: sql`count(*)` }).from(appointments);
  if (whereClause) {
    countQuery.where(whereClause);
  }
  const [countResult] = await countQuery;
  const total = Number(countResult?.count || 0);
  const dataQuery = db.select({
    id: appointments.id,
    campaignId: appointments.campaignId,
    doctorId: appointments.doctorId,
    fullName: appointments.fullName,
    phone: appointments.phone,
    email: appointments.email,
    age: appointments.age,
    procedure: appointments.procedure,
    preferredDate: appointments.preferredDate,
    preferredTime: appointments.preferredTime,
    additionalNotes: appointments.additionalNotes,
    staffNotes: appointments.staffNotes,
    notes: appointments.notes,
    status: appointments.status,
    source: appointments.source,
    receiptNumber: appointments.receiptNumber,
    appointmentDate: appointments.appointmentDate,
    utmSource: appointments.utmSource,
    utmMedium: appointments.utmMedium,
    utmCampaign: appointments.utmCampaign,
    utmTerm: appointments.utmTerm,
    utmContent: appointments.utmContent,
    utmPlacement: appointments.utmPlacement,
    referrer: appointments.referrer,
    fbclid: appointments.fbclid,
    gclid: appointments.gclid,
    createdAt: appointments.createdAt,
    updatedAt: appointments.updatedAt,
    doctorName: doctors.name,
    doctorSpecialty: doctors.specialty
  }).from(appointments).leftJoin(doctors, eq(appointments.doctorId, doctors.id));
  if (whereClause) {
    dataQuery.where(whereClause);
  }
  let result;
  if (isShowAll) {
    result = await dataQuery;
  } else {
    result = await dataQuery.limit(limit).offset(offset);
  }
  return {
    data: result,
    total,
    page,
    limit,
    totalPages: isShowAll ? 1 : Math.ceil(total / limit)
  };
}
async function updateAppointmentStatus(id, status, staffNotes) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update appointment: database not available");
    return;
  }
  try {
    const updateData = { status };
    if (staffNotes !== void 0) {
      updateData.staffNotes = staffNotes;
    }
    await db.update(appointments).set(updateData).where(eq(appointments.id, id));
  } catch (error) {
    console.error("[Database] Failed to update appointment:", error);
    throw error;
  }
}
async function bulkUpdateAppointmentStatus(ids, status, staffNotes) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot bulk update appointments: database not available");
    return { success: false, count: 0 };
  }
  try {
    const updateData = { status };
    if (staffNotes !== void 0) {
      updateData.staffNotes = staffNotes;
    }
    for (const id of ids) {
      await db.update(appointments).set(updateData).where(eq(appointments.id, id));
    }
    return { success: true, count: ids.length };
  } catch (error) {
    console.error("[Database] Failed to bulk update appointments:", error);
    throw error;
  }
}
async function getAllUnifiedLeads() {
  const db = await getDb();
  if (!db) return [];
  try {
    const appointmentsData = await db.select({
      id: appointments.id,
      fullName: appointments.fullName,
      phone: appointments.phone,
      email: appointments.email,
      notes: appointments.notes,
      status: appointments.status,
      createdAt: appointments.createdAt,
      utmSource: appointments.utmSource,
      utmMedium: appointments.utmMedium,
      utmCampaign: appointments.utmCampaign,
      doctorId: appointments.doctorId
    }).from(appointments).orderBy(desc(appointments.createdAt));
    const { offerLeads: offerLeads3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const offerLeadsData = await db.select({
      id: offerLeads3.id,
      fullName: offerLeads3.fullName,
      phone: offerLeads3.phone,
      email: offerLeads3.email,
      notes: offerLeads3.notes,
      status: offerLeads3.status,
      createdAt: offerLeads3.createdAt,
      source: offerLeads3.source,
      offerId: offerLeads3.offerId
    }).from(offerLeads3).orderBy(desc(offerLeads3.createdAt));
    const { campRegistrations: campRegistrations3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const campRegistrationsData = await db.select({
      id: campRegistrations3.id,
      fullName: campRegistrations3.fullName,
      phone: campRegistrations3.phone,
      email: campRegistrations3.email,
      notes: campRegistrations3.notes,
      status: campRegistrations3.status,
      createdAt: campRegistrations3.createdAt,
      source: campRegistrations3.source,
      campId: campRegistrations3.campId
    }).from(campRegistrations3).orderBy(desc(campRegistrations3.createdAt));
    const unifiedLeads = [
      ...appointmentsData.map((a) => ({
        ...a,
        type: "appointment",
        typeLabel: "\u0645\u0648\u0639\u062F \u0637\u0628\u064A\u0628",
        relatedId: a.doctorId
      })),
      ...offerLeadsData.map((o) => ({
        ...o,
        type: "offer",
        typeLabel: "\u062D\u062C\u0632 \u0639\u0631\u0636",
        relatedId: o.offerId,
        utmSource: o.source || "",
        utmMedium: "",
        utmCampaign: ""
      })),
      ...campRegistrationsData.map((c) => ({
        ...c,
        type: "camp",
        typeLabel: "\u062A\u0633\u062C\u064A\u0644 \u0645\u062E\u064A\u0645",
        relatedId: c.campId,
        utmSource: c.source || "",
        utmMedium: "",
        utmCampaign: ""
      }))
      // visitingDoctorAppointments will be added here when table is created
    ];
    unifiedLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return unifiedLeads;
  } catch (error) {
    console.error("[Database] Error getting unified leads:", error);
    return [];
  }
}
async function getAllWhatsAppConversations() {
  const db = await getDb();
  if (!db) return [];
  const { whatsappConversations: whatsappConversations3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  return db.select().from(whatsappConversations3).orderBy(desc(whatsappConversations3.lastMessageAt));
}
async function getWhatsAppConversationById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const { whatsappConversations: whatsappConversations3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const result = await db.select().from(whatsappConversations3).where(eq(whatsappConversations3.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getWhatsAppConversationByPhone(phone) {
  const db = await getDb();
  if (!db) return void 0;
  const { whatsappConversations: whatsappConversations3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const result = await db.select().from(whatsappConversations3).where(eq(whatsappConversations3.phoneNumber, phone)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createWhatsAppConversation(conversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { whatsappConversations: whatsappConversations3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const result = await db.insert(whatsappConversations3).values(conversation);
  return result;
}
async function updateWhatsAppConversation(id, conversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { whatsappConversations: whatsappConversations3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  return db.update(whatsappConversations3).set(conversation).where(eq(whatsappConversations3.id, id));
}
async function getWhatsAppMessagesByConversation(conversationId) {
  const db = await getDb();
  if (!db) return [];
  const { whatsappMessages: whatsappMessages3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  return db.select().from(whatsappMessages3).where(eq(whatsappMessages3.conversationId, conversationId)).orderBy(whatsappMessages3.createdAt);
}
async function createWhatsAppMessage(message) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { whatsappMessages: whatsappMessages3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const result = await db.insert(whatsappMessages3).values(message);
  return result;
}
async function updateWhatsAppMessage(id, message) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { whatsappMessages: whatsappMessages3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  return db.update(whatsappMessages3).set(message).where(eq(whatsappMessages3.id, id));
}
async function getAllWhatsAppTemplates() {
  const db = await getDb();
  if (!db) return [];
  const { whatsappTemplates: whatsappTemplates2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  return db.select().from(whatsappTemplates2).where(eq(whatsappTemplates2.isActive, 1)).orderBy(whatsappTemplates2.name);
}
async function getWhatsAppTemplateById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const { whatsappTemplates: whatsappTemplates2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const result = await db.select().from(whatsappTemplates2).where(eq(whatsappTemplates2.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createWhatsAppTemplate(template) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { whatsappTemplates: whatsappTemplates2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const result = await db.insert(whatsappTemplates2).values(template);
  return result;
}
async function updateWhatsAppTemplate(id, template) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { whatsappTemplates: whatsappTemplates2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  return db.update(whatsappTemplates2).set(template).where(eq(whatsappTemplates2.id, id));
}
async function deleteWhatsAppTemplate(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { whatsappTemplates: whatsappTemplates2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  return db.delete(whatsappTemplates2).where(eq(whatsappTemplates2.id, id));
}
async function searchWhatsAppConversations(searchTerm) {
  const db = await getDb();
  if (!db) return [];
  const { whatsappConversations: whatsappConversations3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  return db.select().from(whatsappConversations3).where(
    or(
      like(whatsappConversations3.customerName, `%${searchTerm}%`),
      like(whatsappConversations3.phoneNumber, `%${searchTerm}%`)
    )
  ).orderBy(desc(whatsappConversations3.lastMessageAt));
}
async function getUnreadWhatsAppConversationsCount() {
  const db = await getDb();
  if (!db) return 0;
  const { whatsappConversations: whatsappConversations3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const result = await db.select({
    count: sql`count(*)`
  }).from(whatsappConversations3).where(eq(whatsappConversations3.unreadCount, 0));
  return result[0]?.count || 0;
}
async function getAllMessageSettings() {
  const db = await getDb();
  if (!db) return [];
  const { messageSettings: messageSettings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  return db.select().from(messageSettings2).orderBy(messageSettings2.category, messageSettings2.id);
}
async function getMessageSettingsByCategory(category) {
  const db = await getDb();
  if (!db) return [];
  const { messageSettings: messageSettings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { sql: sql8 } = await import("drizzle-orm");
  return db.select().from(messageSettings2).where(sql8`${messageSettings2.category} = ${category}`).orderBy(messageSettings2.id);
}
async function getMessageSettingByType(messageType) {
  const db = await getDb();
  if (!db) return void 0;
  const { messageSettings: messageSettings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const result = await db.select().from(messageSettings2).where(eq(messageSettings2.messageType, messageType)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateMessageSetting(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { messageSettings: messageSettings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { id, ...updateData } = data;
  return db.update(messageSettings2).set(updateData).where(eq(messageSettings2.id, id));
}
async function toggleMessageSettingEnabled(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { messageSettings: messageSettings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const current = await db.select().from(messageSettings2).where(eq(messageSettings2.id, id)).limit(1);
  if (current.length === 0) throw new Error("Message setting not found");
  const newValue = current[0].isEnabled === 1 ? 0 : 1;
  return db.update(messageSettings2).set({ isEnabled: newValue }).where(eq(messageSettings2.id, id));
}
async function getOfferLeadsPaginated(page = 1, limit = 20, searchTerm, offerIds, sources, statuses, dateFilter, dateFrom, dateTo) {
  const db = await getDb();
  if (!db) return { data: [], total: 0, page, limit, totalPages: 0 };
  const isShowAll = limit === -1;
  const offset = isShowAll ? 0 : (page - 1) * limit;
  const { offerLeads: offerLeads3, offers: offers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const whereConditions = [];
  if (searchTerm && searchTerm.trim()) {
    const searchPattern = `%${searchTerm.trim()}%`;
    whereConditions.push(
      or(
        like(offerLeads3.fullName, searchPattern),
        like(offerLeads3.phone, searchPattern),
        like(offerLeads3.email, searchPattern)
      )
    );
  }
  if (offerIds && offerIds.length > 0) {
    whereConditions.push(inArray(offerLeads3.offerId, offerIds));
  }
  if (sources && sources.length > 0) {
    whereConditions.push(inArray(offerLeads3.source, sources));
  }
  if (statuses && statuses.length > 0) {
    whereConditions.push(inArray(offerLeads3.status, statuses));
  }
  if (dateFrom && dateTo) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    whereConditions.push(
      and(
        sql`${offerLeads3.createdAt} >= ${from.toISOString()}`,
        sql`${offerLeads3.createdAt} <= ${to.toISOString()}`
      )
    );
  } else if (dateFilter && dateFilter !== "all") {
    const now = /* @__PURE__ */ new Date();
    let startDate;
    if (dateFilter === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateFilter === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
    } else if (dateFilter === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    if (startDate) {
      whereConditions.push(sql`${offerLeads3.createdAt} >= ${startDate.toISOString()}`);
    }
  }
  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : void 0;
  const countQuery = db.select({ count: sql`count(*)` }).from(offerLeads3);
  if (whereClause) {
    countQuery.where(whereClause);
  }
  const [countResult] = await countQuery;
  const total = Number(countResult?.count || 0);
  const dataQuery = db.select({
    id: offerLeads3.id,
    offerId: offerLeads3.offerId,
    offerTitle: offers2.title,
    fullName: offerLeads3.fullName,
    phone: offerLeads3.phone,
    email: offerLeads3.email,
    notes: offerLeads3.notes,
    status: offerLeads3.status,
    statusNotes: offerLeads3.statusNotes,
    source: offerLeads3.source,
    utmSource: offerLeads3.utmSource,
    utmMedium: offerLeads3.utmMedium,
    utmCampaign: offerLeads3.utmCampaign,
    utmContent: offerLeads3.utmContent,
    utmTerm: offerLeads3.utmTerm,
    utmPlacement: offerLeads3.utmPlacement,
    referrer: offerLeads3.referrer,
    fbclid: offerLeads3.fbclid,
    gclid: offerLeads3.gclid,
    receiptNumber: offerLeads3.receiptNumber,
    campaignId: offerLeads3.campaignId,
    createdAt: offerLeads3.createdAt,
    updatedAt: offerLeads3.updatedAt
  }).from(offerLeads3).leftJoin(offers2, eq(offerLeads3.offerId, offers2.id));
  if (whereClause) {
    dataQuery.where(whereClause);
  }
  let result;
  if (isShowAll) {
    result = await dataQuery.orderBy(desc(offerLeads3.createdAt));
  } else {
    result = await dataQuery.orderBy(desc(offerLeads3.createdAt)).limit(limit).offset(offset);
  }
  return {
    data: result,
    total,
    page,
    limit,
    totalPages: isShowAll ? 1 : Math.ceil(total / limit)
  };
}
async function getCampRegistrationsPaginated(page = 1, limit = 20, searchTerm, campIds, sources, statuses, dateFilter, dateFrom, dateTo) {
  const db = await getDb();
  if (!db) return { data: [], total: 0, page, limit, totalPages: 0 };
  const isShowAll = limit === -1;
  const offset = isShowAll ? 0 : (page - 1) * limit;
  const { campRegistrations: campRegistrations3, camps: camps2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const whereConditions = [];
  if (searchTerm && searchTerm.trim()) {
    const searchPattern = `%${searchTerm.trim()}%`;
    whereConditions.push(
      or(
        like(campRegistrations3.fullName, searchPattern),
        like(campRegistrations3.phone, searchPattern),
        like(campRegistrations3.email, searchPattern)
      )
    );
  }
  if (campIds && campIds.length > 0) {
    whereConditions.push(inArray(campRegistrations3.campId, campIds));
  }
  if (sources && sources.length > 0) {
    whereConditions.push(inArray(campRegistrations3.source, sources));
  }
  if (statuses && statuses.length > 0) {
    whereConditions.push(inArray(campRegistrations3.status, statuses));
  }
  if (dateFrom && dateTo) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    whereConditions.push(
      and(
        sql`${campRegistrations3.createdAt} >= ${from.toISOString()}`,
        sql`${campRegistrations3.createdAt} <= ${to.toISOString()}`
      )
    );
  } else if (dateFilter && dateFilter !== "all") {
    const now = /* @__PURE__ */ new Date();
    let startDate;
    if (dateFilter === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateFilter === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
    } else if (dateFilter === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    if (startDate) {
      whereConditions.push(sql`${campRegistrations3.createdAt} >= ${startDate.toISOString()}`);
    }
  }
  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : void 0;
  const countQuery = db.select({ count: sql`count(*)` }).from(campRegistrations3);
  if (whereClause) {
    countQuery.where(whereClause);
  }
  const [countResult] = await countQuery;
  const total = Number(countResult?.count || 0);
  const dataQuery = db.select({
    id: campRegistrations3.id,
    campId: campRegistrations3.campId,
    campName: camps2.name,
    fullName: campRegistrations3.fullName,
    phone: campRegistrations3.phone,
    email: campRegistrations3.email,
    age: campRegistrations3.age,
    gender: campRegistrations3.gender,
    procedures: campRegistrations3.procedures,
    medicalCondition: campRegistrations3.medicalCondition,
    notes: campRegistrations3.notes,
    status: campRegistrations3.status,
    statusNotes: campRegistrations3.statusNotes,
    attendanceDate: campRegistrations3.attendanceDate,
    source: campRegistrations3.source,
    utmSource: campRegistrations3.utmSource,
    utmMedium: campRegistrations3.utmMedium,
    utmCampaign: campRegistrations3.utmCampaign,
    utmContent: campRegistrations3.utmContent,
    utmTerm: campRegistrations3.utmTerm,
    utmPlacement: campRegistrations3.utmPlacement,
    referrer: campRegistrations3.referrer,
    fbclid: campRegistrations3.fbclid,
    gclid: campRegistrations3.gclid,
    receiptNumber: campRegistrations3.receiptNumber,
    campaignId: campRegistrations3.campaignId,
    createdAt: campRegistrations3.createdAt,
    updatedAt: campRegistrations3.updatedAt
  }).from(campRegistrations3).leftJoin(camps2, eq(campRegistrations3.campId, camps2.id));
  if (whereClause) {
    dataQuery.where(whereClause);
  }
  let result;
  if (isShowAll) {
    result = await dataQuery.orderBy(desc(campRegistrations3.createdAt));
  } else {
    result = await dataQuery.orderBy(desc(campRegistrations3.createdAt)).limit(limit).offset(offset);
  }
  return {
    data: result,
    total,
    page,
    limit,
    totalPages: isShowAll ? 1 : Math.ceil(total / limit)
  };
}
async function getUserPreference(userId, preferenceKey) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user preference: database not available");
    return void 0;
  }
  const { userPreferences: userPreferences2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const result = await db.select().from(userPreferences2).where(and(
    eq(userPreferences2.userId, userId),
    eq(userPreferences2.preferenceKey, preferenceKey)
  )).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function setUserPreference(userId, preferenceKey, preferenceValue) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot set user preference: database not available");
    return;
  }
  const { userPreferences: userPreferences2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const existing = await getUserPreference(userId, preferenceKey);
  if (existing) {
    await db.update(userPreferences2).set({ preferenceValue, updatedAt: /* @__PURE__ */ new Date() }).where(and(
      eq(userPreferences2.userId, userId),
      eq(userPreferences2.preferenceKey, preferenceKey)
    ));
  } else {
    await db.insert(userPreferences2).values({
      userId,
      preferenceKey,
      preferenceValue
    });
  }
}
async function getAllUserPreferences(userId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user preferences: database not available");
    return [];
  }
  const { userPreferences: userPreferences2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  return await db.select().from(userPreferences2).where(eq(userPreferences2.userId, userId));
}
async function getSharedTemplates(tableKey) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get shared templates: database not available");
    return [];
  }
  return await db.select().from(sharedColumnTemplates).where(eq(sharedColumnTemplates.tableKey, tableKey)).orderBy(desc(sharedColumnTemplates.createdAt));
}
async function getAllSharedTemplates() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get all shared templates: database not available");
    return [];
  }
  return await db.select().from(sharedColumnTemplates).orderBy(desc(sharedColumnTemplates.createdAt));
}
async function createSharedTemplate(data) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create shared template: database not available");
    return null;
  }
  const result = await db.insert(sharedColumnTemplates).values({
    name: data.name,
    tableKey: data.tableKey,
    columns: data.columns,
    createdBy: data.createdBy,
    createdByName: data.createdByName
  });
  return result;
}
async function deleteSharedTemplate(id) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete shared template: database not available");
    return;
  }
  await db.delete(sharedColumnTemplates).where(eq(sharedColumnTemplates.id, id));
}
async function updateSharedTemplate(id, data) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update shared template: database not available");
    return;
  }
  const updateSet = {};
  if (data.name !== void 0) updateSet.name = data.name;
  if (data.columns !== void 0) updateSet.columns = data.columns;
  if (Object.keys(updateSet).length > 0) {
    await db.update(sharedColumnTemplates).set(updateSet).where(eq(sharedColumnTemplates.id, id));
  }
}
var _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    _db = null;
  }
});

// server/whatsappCloudAPI.ts
var whatsappCloudAPI_exports = {};
__export(whatsappCloudAPI_exports, {
  formatPhoneNumber: () => formatPhoneNumber,
  getWhatsAppAPIStatus: () => getWhatsAppAPIStatus,
  getWhatsAppBusinessAPIStatus: () => getWhatsAppBusinessAPIStatus,
  isWhatsAppBusinessAPIConfigured: () => isWhatsAppBusinessAPIConfigured,
  parseWhatsAppError: () => parseWhatsAppError,
  sendWhatsAppTemplateMessage: () => sendWhatsAppTemplateMessage,
  sendWhatsAppTextMessage: () => sendWhatsAppTextMessage,
  validatePhoneNumber: () => validatePhoneNumber
});
function getCredentials() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  return { phoneNumberId, accessToken };
}
function formatPhoneNumber(phone) {
  let cleaned = phone.replace(/[^\d]/g, "");
  if (cleaned.startsWith("00967")) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith("967")) {
  } else if (cleaned.startsWith("0")) {
    cleaned = "967" + cleaned.substring(1);
  } else if (cleaned.length === 9) {
    cleaned = "967" + cleaned;
  }
  return cleaned;
}
function getWhatsAppAPIStatus() {
  const { phoneNumberId, accessToken } = getCredentials();
  const configured = !!(phoneNumberId && accessToken);
  return {
    isReady: configured,
    isConnecting: false,
    hasQRCode: false,
    apiConfigured: configured,
    phoneNumberId: phoneNumberId || void 0,
    apiVersion: WHATSAPP_API_VERSION,
    mode: "cloud_api"
  };
}
function isWhatsAppBusinessAPIConfigured() {
  const { phoneNumberId, accessToken } = getCredentials();
  return !!(phoneNumberId && accessToken);
}
function getWhatsAppBusinessAPIStatus() {
  const { phoneNumberId } = getCredentials();
  return {
    configured: isWhatsAppBusinessAPIConfigured(),
    phoneNumberId
  };
}
function parseWhatsAppError(errorData) {
  const errorCode = errorData?.error?.code || errorData?.code || 0;
  const knownError = WHATSAPP_ERROR_CODES[errorCode];
  if (knownError) return knownError;
  return { code: errorCode, title: "Unknown error", message: errorData?.error?.message || errorData?.message || "Unknown error occurred", userFriendlyMessage: "\u062D\u062F\u062B \u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641", shouldRetry: false, category: "system" };
}
async function sendWhatsAppTextMessage(phone, message) {
  const { phoneNumberId, accessToken } = getCredentials();
  if (!phoneNumberId || !accessToken) {
    return {
      success: false,
      error: "\u0648\u0627\u062A\u0633\u0627\u0628 Cloud API \u063A\u064A\u0631 \u0645\u064F\u0639\u062F. \u064A\u0631\u062C\u0649 \u062A\u0639\u064A\u064A\u0646 WHATSAPP_PHONE_NUMBER_ID \u0648 META_ACCESS_TOKEN"
    };
  }
  try {
    const url = `${WHATSAPP_API_BASE}/${phoneNumberId}/messages`;
    const formattedPhone = formatPhoneNumber(phone);
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedPhone,
      type: "text",
      text: {
        preview_url: false,
        body: message
      }
    };
    console.log(`[WhatsApp Cloud API] Sending text to ${formattedPhone}:`, message.substring(0, 50) + "...");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data.error?.message || `HTTP ${response.status}`;
      const errorCode = data.error?.code;
      console.error(`[WhatsApp Cloud API] Error (${errorCode}):`, errorMsg);
      return {
        success: false,
        error: `${errorMsg} (\u0643\u0648\u062F: ${errorCode || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"})`
      };
    }
    const messageId = data.messages?.[0]?.id;
    console.log(`[WhatsApp Cloud API] Message sent successfully. ID: ${messageId}`);
    return {
      success: true,
      messageId
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641";
    console.error("[WhatsApp Cloud API] Exception:", errorMsg);
    return {
      success: false,
      error: errorMsg
    };
  }
}
async function sendWhatsAppTemplateMessage(phone, template, options) {
  const { phoneNumberId, accessToken } = getCredentials();
  if (!phoneNumberId || !accessToken) {
    return {
      success: false,
      error: "\u0648\u0627\u062A\u0633\u0627\u0628 Cloud API \u063A\u064A\u0631 \u0645\u064F\u0639\u062F"
    };
  }
  try {
    const url = `${WHATSAPP_API_BASE}/${phoneNumberId}/messages`;
    const formattedPhone = formatPhoneNumber(phone);
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedPhone,
      type: "template",
      template: {
        name: template.templateName,
        language: {
          code: template.languageCode
        }
      }
    };
    if (template.components && template.components.length > 0) {
      payload.template.components = template.components;
    }
    console.log(`[WhatsApp Cloud API] Sending template "${template.templateName}" to ${formattedPhone}`);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data.error?.message || `HTTP ${response.status}`;
      const errorCode = data.error?.code;
      console.error(`[WhatsApp Cloud API] Template error (${errorCode}):`, errorMsg);
      return {
        success: false,
        error: `${errorMsg} (\u0643\u0648\u062F: ${errorCode || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"})`
      };
    }
    const messageId = data.messages?.[0]?.id;
    console.log(`[WhatsApp Cloud API] Template sent successfully. ID: ${messageId}`);
    return {
      success: true,
      messageId
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641";
    console.error("[WhatsApp Cloud API] Template exception:", errorMsg);
    return {
      success: false,
      error: errorMsg
    };
  }
}
function validatePhoneNumber(phone) {
  const formatted = formatPhoneNumber(phone);
  if (formatted.length < 10 || formatted.length > 15) {
    return { valid: false, formatted, error: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D" };
  }
  if (!formatted.startsWith("967")) {
    return { valid: true, formatted, error: void 0 };
  }
  if (formatted.length !== 12) {
    return { valid: false, formatted, error: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0627\u0644\u064A\u0645\u0646\u064A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 9 \u0623\u0631\u0642\u0627\u0645 \u0628\u0639\u062F \u0643\u0648\u062F \u0627\u0644\u062F\u0648\u0644\u0629" };
  }
  return { valid: true, formatted };
}
var WHATSAPP_API_VERSION, WHATSAPP_API_BASE, WHATSAPP_ERROR_CODES;
var init_whatsappCloudAPI = __esm({
  "server/whatsappCloudAPI.ts"() {
    "use strict";
    WHATSAPP_API_VERSION = "v21.0";
    WHATSAPP_API_BASE = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;
    WHATSAPP_ERROR_CODES = {
      131049: { code: 131049, title: "Marketing messages to US users blocked", message: "Cannot send marketing messages to WhatsApp users in the United States", userFriendlyMessage: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0626\u0644 \u062A\u0633\u0648\u064A\u0642\u064A\u0629 \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0641\u064A \u0627\u0644\u0648\u0644\u0627\u064A\u0627\u062A \u0627\u0644\u0645\u062A\u062D\u062F\u0629", shouldRetry: false, category: "policy" },
      131026: { code: 131026, title: "Template not approved or paused", message: "The template is not approved, paused, or disabled", userFriendlyMessage: "\u0627\u0644\u0642\u0627\u0644\u0628 \u063A\u064A\u0631 \u0645\u0639\u062A\u0645\u062F \u0623\u0648 \u0645\u062A\u0648\u0642\u0641 \u0645\u0624\u0642\u062A\u0627\u064B", shouldRetry: false, category: "template" },
      131047: { code: 131047, title: "Messaging limit reached", message: "You have reached your messaging limit", userFriendlyMessage: "\u062A\u0645 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u062D\u062F \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647", shouldRetry: true, category: "rate_limit" },
      131051: { code: 131051, title: "Invalid phone number", message: "The phone number is blocked, invalid, or not registered on WhatsApp", userFriendlyMessage: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0645\u062D\u0638\u0648\u0631 \u0623\u0648 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D \u0623\u0648 \u063A\u064A\u0631 \u0645\u0633\u062C\u0644 \u0641\u064A \u0648\u0627\u062A\u0633\u0627\u0628", shouldRetry: false, category: "user" },
      130472: { code: 130472, title: "User number is part of an experiment", message: "The user number is part of an experiment", userFriendlyMessage: "\u0631\u0642\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u062C\u0632\u0621 \u0645\u0646 \u062A\u062C\u0631\u0628\u0629", shouldRetry: false, category: "user" },
      133016: { code: 133016, title: "Service temporarily unavailable", message: "WhatsApp service is temporarily unavailable", userFriendlyMessage: "\u062E\u062F\u0645\u0629 \u0648\u0627\u062A\u0633\u0627\u0628 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u0645\u0624\u0642\u062A\u0627\u064B", shouldRetry: true, category: "system" }
    };
  }
});

// server/redis.ts
import Redis from "ioredis";
function getRedisConnection() {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      // Required for BullMQ
      enableReadyCheck: false,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2e3);
        return delay;
      }
    });
    redisClient.on("error", (err) => {
      console.error("[Redis] Connection error:", err);
    });
    redisClient.on("connect", () => {
      console.log("[Redis] Connected successfully");
    });
  }
  return redisClient;
}
var redisClient;
var init_redis = __esm({
  "server/redis.ts"() {
    "use strict";
    redisClient = null;
  }
});

// server/queues/whatsappQueue.ts
var whatsappQueue_exports = {};
__export(whatsappQueue_exports, {
  cleanOldJobs: () => cleanOldJobs,
  getQueueStats: () => getQueueStats,
  queueWhatsAppMessage: () => queueWhatsAppMessage,
  retryFailedJobs: () => retryFailedJobs,
  whatsappQueue: () => whatsappQueue,
  whatsappWorker: () => whatsappWorker
});
import { Queue, Worker } from "bullmq";
async function checkRedisConnection() {
  if (redisCheckPromise) return redisCheckPromise;
  redisCheckPromise = (async () => {
    try {
      const redis = getRedisConnection();
      await redis.ping();
      isRedisAvailable = true;
      console.log("[WhatsApp Queue] Redis connection successful");
      return true;
    } catch (error) {
      isRedisAvailable = false;
      console.warn("[WhatsApp Queue] Redis not available, will send messages directly");
      return false;
    }
  })();
  return redisCheckPromise;
}
async function initializeQueue() {
  if (whatsappQueue) return whatsappQueue;
  const redisAvailable = await checkRedisConnection();
  if (!redisAvailable) return null;
  whatsappQueue = new Queue("whatsapp-messages", {
    connection: getRedisConnection(),
    defaultJobOptions: {
      attempts: 3,
      // Retry up to 3 times
      backoff: {
        type: "exponential",
        delay: 5e3
        // Start with 5 seconds
      },
      removeOnComplete: {
        age: 24 * 3600,
        // Keep completed jobs for 24 hours
        count: 1e3
        // Keep last 1000 completed jobs
      },
      removeOnFail: {
        age: 7 * 24 * 3600
        // Keep failed jobs for 7 days
      }
    }
  });
  return whatsappQueue;
}
async function initializeWorker() {
  if (whatsappWorker) return whatsappWorker;
  const redisAvailable = await checkRedisConnection();
  if (!redisAvailable) return null;
  whatsappWorker = new Worker(
    "whatsapp-messages",
    async (job) => {
      const { to, templateName, language, components, category, metadata } = job.data;
      console.log(`[WhatsApp Queue] Processing job ${job.id} for ${to}`);
      try {
        const result = await sendWhatsAppTemplateMessage(
          to,
          {
            templateName,
            languageCode: language,
            components
          },
          category ? { category } : void 0
        );
        console.log(`[WhatsApp Queue] Job ${job.id} completed successfully`);
        return {
          success: true,
          messageId: result.messageId,
          metadata
        };
      } catch (error) {
        console.error(`[WhatsApp Queue] Job ${job.id} failed:`, error);
        throw error;
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: 5
      // Process up to 5 messages concurrently
    }
  );
  return whatsappWorker;
}
async function queueWhatsAppMessage(data) {
  const queue = await initializeQueue();
  if (!queue) {
    console.log("[WhatsApp Queue] Redis unavailable, sending message directly");
    try {
      const result = await sendWhatsAppTemplateMessage(
        data.to,
        {
          templateName: data.templateName,
          languageCode: data.language,
          components: data.components
        },
        data.category ? { category: data.category } : void 0
      );
      console.log("[WhatsApp Queue] Message sent directly:", result.messageId);
      return result.messageId || "direct-send";
    } catch (error) {
      console.error("[WhatsApp Queue] Direct send failed:", error);
      throw error;
    }
  }
  const job = await queue.add("send-message", data, {
    priority: data.category === "authentication" ? 1 : data.category === "utility" ? 2 : 3
  });
  console.log(`[WhatsApp Queue] Added job ${job.id} to queue`);
  return job.id || "";
}
async function getQueueStats() {
  const queue = await initializeQueue();
  if (!queue) {
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      total: 0,
      redisAvailable: false
    };
  }
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount()
  ]);
  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
    redisAvailable: true
  };
}
async function retryFailedJobs() {
  const queue = await initializeQueue();
  if (!queue) return 0;
  const failedJobs = await queue.getFailed();
  let retried = 0;
  for (const job of failedJobs) {
    await job.retry();
    retried++;
  }
  console.log(`[WhatsApp Queue] Retried ${retried} failed jobs`);
  return retried;
}
async function cleanOldJobs() {
  const queue = await initializeQueue();
  if (!queue) return;
  await queue.clean(24 * 3600 * 1e3, 1e3, "completed");
  await queue.clean(7 * 24 * 3600 * 1e3, 0, "failed");
  console.log("[WhatsApp Queue] Old jobs cleaned");
}
var isRedisAvailable, redisCheckPromise, whatsappQueue, whatsappWorker;
var init_whatsappQueue = __esm({
  "server/queues/whatsappQueue.ts"() {
    "use strict";
    init_redis();
    init_whatsappCloudAPI();
    isRedisAvailable = false;
    redisCheckPromise = null;
    whatsappQueue = null;
    whatsappWorker = null;
    initializeWorker().then((worker) => {
      if (worker) {
        worker.on("completed", (job) => {
          console.log(`[WhatsApp Queue] Job ${job.id} has been completed`);
        });
        worker.on("failed", (job, err) => {
          console.error(`[WhatsApp Queue] Job ${job?.id} has failed with error:`, err.message);
        });
        worker.on("error", (err) => {
          console.error("[WhatsApp Queue] Worker error:", err);
        });
      }
    });
  }
});

// server/whatsapp.ts
var whatsapp_exports = {};
__export(whatsapp_exports, {
  sendBookingConfirmation: () => sendBookingConfirmation,
  sendCustomMessage: () => sendCustomMessage,
  sendWelcomeMessage: () => sendWelcomeMessage,
  sendWhatsAppMessage: () => sendWhatsAppMessage
});
async function sendWhatsAppMessage(params) {
  try {
    const formattedPhone = formatPhoneNumber(params.to);
    const result = await sendWhatsAppTextMessage(formattedPhone, params.message);
    if (result.success) {
      console.log(`[WhatsApp] Message sent successfully to ${formattedPhone}. ID: ${result.messageId}`);
      return true;
    } else {
      console.error(`[WhatsApp] Failed to send to ${formattedPhone}: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error("[WhatsApp] Failed to send message:", error);
    return false;
  }
}
async function sendWelcomeMessage(lead) {
  const defaultMessage = `\u0645\u0631\u062D\u0628\u0627\u064B ${lead.fullName}\u060C

\u0634\u0643\u0631\u0627\u064B \u0644\u062A\u0633\u062C\u064A\u0644\u0643 \u0641\u064A ${lead.campaignName} \u0628\u0627\u0644\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A \u0627\u0644\u0623\u0644\u0645\u0627\u0646\u064A - \u0635\u0646\u0639\u0627\u0621.

\u0633\u0646\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0642\u0631\u064A\u0628\u0627\u064B \u0644\u062A\u062D\u062F\u064A\u062F \u0645\u0648\u0639\u062F\u0643 \u0648\u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629.

\u0644\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u0639\u0627\u062C\u0644\u0629\u060C \u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627 \u0639\u0644\u0649 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0645\u062C\u0627\u0646\u064A: 8000018

\u0646\u0631\u0639\u0627\u0643\u0645 \u0643\u0623\u0647\u0627\u0644\u064A\u0646\u0627 \u{1F49A}`;
  const message = lead.welcomeMessage || defaultMessage;
  return sendWhatsAppMessage({
    to: lead.phone,
    message
  });
}
async function sendBookingConfirmation(lead) {
  const message = `\u0639\u0632\u064A\u0632\u064A/\u0639\u0632\u064A\u0632\u062A\u064A ${lead.fullName}\u060C

\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u062D\u062C\u0632\u0643 \u0628\u0646\u062C\u0627\u062D! \u2705

${lead.appointmentDate && lead.appointmentTime ? `
\u{1F4C5} \u0627\u0644\u062A\u0627\u0631\u064A\u062E: ${lead.appointmentDate}
\u{1F550} \u0627\u0644\u0648\u0642\u062A: ${lead.appointmentTime}
` : ""}

\u{1F4CD} \u0627\u0644\u0645\u0648\u0642\u0639: \u0627\u0644\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A \u0627\u0644\u0623\u0644\u0645\u0627\u0646\u064A - \u0635\u0646\u0639\u0627\u0621
\u0634\u0627\u0631\u0639 \u0627\u0644\u0633\u062A\u064A\u0646 \u0627\u0644\u0634\u0645\u0627\u0644\u064A (\u0628\u064A\u0646 \u062C\u0648\u0644\u0629 \u0639\u0645\u0631\u0627\u0646 \u0648\u062C\u0648\u0644\u0629 \u0627\u0644\u062C\u0645\u0646\u0629)

\u064A\u0631\u062C\u0649 \u0627\u0644\u062D\u0636\u0648\u0631 \u0642\u0628\u0644 \u0627\u0644\u0645\u0648\u0639\u062F \u0628\u0640 15 \u062F\u0642\u064A\u0642\u0629.

\u0644\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A: 8000018

\u0646\u0631\u0639\u0627\u0643\u0645 \u0643\u0623\u0647\u0627\u0644\u064A\u0646\u0627 \u{1F49A}
\u0627\u0644\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A \u0627\u0644\u0623\u0644\u0645\u0627\u0646\u064A`;
  return sendWhatsAppMessage({
    to: lead.phone,
    message
  });
}
async function sendCustomMessage(phone, message) {
  return sendWhatsAppMessage({
    to: phone,
    message
  });
}
var init_whatsapp = __esm({
  "server/whatsapp.ts"() {
    "use strict";
    init_whatsappCloudAPI();
  }
});

// server/messaging.ts
var messaging_exports = {};
__export(messaging_exports, {
  formatDateForMessage: () => formatDateForMessage,
  formatTimeForMessage: () => formatTimeForMessage,
  replaceMessageVariables: () => replaceMessageVariables,
  sendBookingConfirmationInteractive: () => sendBookingConfirmationInteractive,
  sendBookingConfirmedSuccess: () => sendBookingConfirmedSuccess,
  sendCampPatientArrivalWelcome: () => sendCampPatientArrivalWelcome,
  sendCampRegistrationConfirmationInteractive: () => sendCampRegistrationConfirmationInteractive,
  sendCampRegistrationConfirmedSuccess: () => sendCampRegistrationConfirmedSuccess,
  sendOfferBookingConfirmationInteractive: () => sendOfferBookingConfirmationInteractive,
  sendOfferBookingConfirmedSuccess: () => sendOfferBookingConfirmedSuccess,
  sendOfferPatientArrivalWelcome: () => sendOfferPatientArrivalWelcome,
  sendPatientArrivalWelcome: () => sendPatientArrivalWelcome
});
function replaceMessageVariables(template, variables) {
  let message = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, "g");
    message = message.replace(regex, value || "");
  }
  return message;
}
async function sendBookingConfirmationInteractive(data) {
  const setting = await getMessageSettingByType("booking_confirmation_interactive");
  if (!setting || setting.isEnabled === 0) {
    console.log("[Messaging] booking_confirmation_interactive is disabled");
    return { success: false, reason: "disabled" };
  }
  const message = replaceMessageVariables(setting.messageContent, {
    name: data.name,
    date: data.date,
    time: data.time,
    doctor: data.doctor,
    service: data.service
  });
  const { isWhatsAppBusinessAPIConfigured: isWhatsAppBusinessAPIConfigured2 } = await Promise.resolve().then(() => (init_whatsappCloudAPI(), whatsappCloudAPI_exports));
  if (isWhatsAppBusinessAPIConfigured2()) {
    console.log("[Messaging] Adding to WhatsApp Queue (interactive buttons)");
    const bookingTypeMap = {
      appointment: "APPOINTMENT",
      offer: "OFFER",
      camp: "CAMP"
    };
    const { queueWhatsAppMessage: queueWhatsAppMessage2 } = await Promise.resolve().then(() => (init_whatsappQueue(), whatsappQueue_exports));
    const jobId = await queueWhatsAppMessage2({
      to: data.phone,
      templateName: "booking_confirmation_interactive",
      language: "ar",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.name },
            { type: "text", text: data.date },
            { type: "text", text: data.time },
            { type: "text", text: data.doctor },
            { type: "text", text: data.service }
          ]
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: 0,
          parameters: [{ type: "payload", payload: `CONFIRM_${bookingTypeMap[data.bookingType]}_${data.bookingId}` }]
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: 1,
          parameters: [{ type: "payload", payload: `CANCEL_${bookingTypeMap[data.bookingType]}_${data.bookingId}` }]
        }
      ],
      category: "utility",
      metadata: {
        bookingId: data.bookingId,
        bookingType: data.bookingType,
        patientName: data.name
      }
    });
    return { success: true, message, jobId };
  } else {
    console.log("[Messaging] WhatsApp Business API not configured, using WhatsApp Integration");
    const { sendCustomMessage: sendCustomMessage2 } = await Promise.resolve().then(() => (init_whatsapp(), whatsapp_exports));
    const success = await sendCustomMessage2(data.phone, message);
    return { success, message };
  }
}
async function sendBookingConfirmedSuccess(data) {
  const setting = await getMessageSettingByType("booking_confirmed_success");
  if (!setting || setting.isEnabled === 0) {
    console.log("[Messaging] booking_confirmed_success is disabled");
    return { success: false, reason: "disabled" };
  }
  const message = replaceMessageVariables(setting.messageContent, {
    name: data.name,
    date: data.date,
    time: data.time,
    doctor: data.doctor
  });
  const { sendCustomMessage: sendCustomMessage2 } = await Promise.resolve().then(() => (init_whatsapp(), whatsapp_exports));
  const success = await sendCustomMessage2(data.phone, message);
  console.log("[Messaging] Sent booking confirmed success:", {
    phone: data.phone,
    success
  });
  return { success, message };
}
async function sendPatientArrivalWelcome(data) {
  const setting = await getMessageSettingByType("patient_arrival_welcome");
  if (!setting || setting.isEnabled === 0) {
    console.log("[Messaging] patient_arrival_welcome is disabled");
    return { success: false, reason: "disabled" };
  }
  const message = replaceMessageVariables(setting.messageContent, {
    name: data.name,
    doctor: data.doctor,
    time: data.time
  });
  const { sendCustomMessage: sendCustomMessage2 } = await Promise.resolve().then(() => (init_whatsapp(), whatsapp_exports));
  const success = await sendCustomMessage2(data.phone, message);
  console.log("[Messaging] Sent patient arrival welcome:", {
    phone: data.phone,
    success
  });
  return { success, message };
}
function formatDateForMessage(date) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}
function formatTimeForMessage(date) {
  return new Intl.DateTimeFormat("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(date);
}
async function sendOfferBookingConfirmationInteractive(data) {
  const setting = await getMessageSettingByType("offer_booking_confirmation_interactive");
  if (!setting || setting.isEnabled === 0) {
    console.log("[Messaging] offer_booking_confirmation_interactive is disabled");
    return { success: false, reason: "disabled" };
  }
  const message = replaceMessageVariables(setting.messageContent, {
    name: data.name,
    service: data.service,
    date: data.date,
    time: data.time
  });
  const { isWhatsAppBusinessAPIConfigured: isWhatsAppBusinessAPIConfigured2 } = await Promise.resolve().then(() => (init_whatsappCloudAPI(), whatsappCloudAPI_exports));
  if (isWhatsAppBusinessAPIConfigured2()) {
    console.log("[Messaging] Adding offer booking confirmation to WhatsApp Queue");
    const { queueWhatsAppMessage: queueWhatsAppMessage2 } = await Promise.resolve().then(() => (init_whatsappQueue(), whatsappQueue_exports));
    const jobId = await queueWhatsAppMessage2({
      to: data.phone,
      templateName: "offer_booking_confirmation_interactive",
      language: "ar",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.name },
            { type: "text", text: data.service },
            { type: "text", text: data.date },
            { type: "text", text: data.time }
          ]
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: 0,
          parameters: [{ type: "payload", payload: `CONFIRM_OFFER_${data.bookingId}` }]
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: 1,
          parameters: [{ type: "payload", payload: `CANCEL_OFFER_${data.bookingId}` }]
        }
      ],
      category: "utility",
      metadata: {
        bookingId: data.bookingId,
        bookingType: "offer",
        patientName: data.name
      }
    });
    return { success: true, message, jobId };
  } else {
    console.log("[Messaging] WhatsApp Business API not configured, using WhatsApp Integration");
    const { sendCustomMessage: sendCustomMessage2 } = await Promise.resolve().then(() => (init_whatsapp(), whatsapp_exports));
    const success = await sendCustomMessage2(data.phone, message);
    return { success, message };
  }
}
async function sendOfferBookingConfirmedSuccess(data) {
  const setting = await getMessageSettingByType("offer_booking_confirmed_success");
  if (!setting || setting.isEnabled === 0) {
    console.log("[Messaging] offer_booking_confirmed_success is disabled");
    return { success: false, reason: "disabled" };
  }
  const message = replaceMessageVariables(setting.messageContent, {
    name: data.name,
    service: data.service,
    date: data.date,
    time: data.time
  });
  const { sendCustomMessage: sendCustomMessage2 } = await Promise.resolve().then(() => (init_whatsapp(), whatsapp_exports));
  const success = await sendCustomMessage2(data.phone, message);
  console.log("[Messaging] Sent offer booking confirmed success:", {
    phone: data.phone,
    success
  });
  return { success, message };
}
async function sendOfferPatientArrivalWelcome(data) {
  const setting = await getMessageSettingByType("offer_patient_arrival_welcome");
  if (!setting || setting.isEnabled === 0) {
    console.log("[Messaging] offer_patient_arrival_welcome is disabled");
    return { success: false, reason: "disabled" };
  }
  const message = replaceMessageVariables(setting.messageContent, {
    name: data.name,
    service: data.service
  });
  const { sendCustomMessage: sendCustomMessage2 } = await Promise.resolve().then(() => (init_whatsapp(), whatsapp_exports));
  const success = await sendCustomMessage2(data.phone, message);
  console.log("[Messaging] Sent offer patient arrival welcome:", {
    phone: data.phone,
    success
  });
  return { success, message };
}
async function sendCampRegistrationConfirmationInteractive(data) {
  const setting = await getMessageSettingByType("camp_registration_confirmation_interactive");
  if (!setting || setting.isEnabled === 0) {
    console.log("[Messaging] camp_registration_confirmation_interactive is disabled");
    return { success: false, reason: "disabled" };
  }
  const message = replaceMessageVariables(setting.messageContent, {
    name: data.name,
    camp_name: data.campName,
    date: data.date,
    time: data.time,
    location: data.location
  });
  const { isWhatsAppBusinessAPIConfigured: isWhatsAppBusinessAPIConfigured2 } = await Promise.resolve().then(() => (init_whatsappCloudAPI(), whatsappCloudAPI_exports));
  if (isWhatsAppBusinessAPIConfigured2()) {
    console.log("[Messaging] Adding camp registration confirmation to WhatsApp Queue");
    const { queueWhatsAppMessage: queueWhatsAppMessage2 } = await Promise.resolve().then(() => (init_whatsappQueue(), whatsappQueue_exports));
    const jobId = await queueWhatsAppMessage2({
      to: data.phone,
      templateName: "camp_registration_confirmation_interactive",
      language: "ar",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.name },
            { type: "text", text: data.campName },
            { type: "text", text: data.date },
            { type: "text", text: data.time },
            { type: "text", text: data.location }
          ]
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: 0,
          parameters: [{ type: "payload", payload: `CONFIRM_CAMP_${data.bookingId}` }]
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: 1,
          parameters: [{ type: "payload", payload: `CANCEL_CAMP_${data.bookingId}` }]
        }
      ],
      category: "utility",
      metadata: {
        bookingId: data.bookingId,
        bookingType: "camp",
        patientName: data.name
      }
    });
    return { success: true, message, jobId };
  } else {
    console.log("[Messaging] WhatsApp Business API not configured, using WhatsApp Integration");
    const { sendCustomMessage: sendCustomMessage2 } = await Promise.resolve().then(() => (init_whatsapp(), whatsapp_exports));
    const success = await sendCustomMessage2(data.phone, message);
    return { success, message };
  }
}
async function sendCampRegistrationConfirmedSuccess(data) {
  const setting = await getMessageSettingByType("camp_registration_confirmed_success");
  if (!setting || setting.isEnabled === 0) {
    console.log("[Messaging] camp_registration_confirmed_success is disabled");
    return { success: false, reason: "disabled" };
  }
  const message = replaceMessageVariables(setting.messageContent, {
    name: data.name,
    camp_name: data.campName,
    date: data.date,
    time: data.time,
    location: data.location
  });
  const { sendCustomMessage: sendCustomMessage2 } = await Promise.resolve().then(() => (init_whatsapp(), whatsapp_exports));
  const success = await sendCustomMessage2(data.phone, message);
  console.log("[Messaging] Sent camp registration confirmed success:", {
    phone: data.phone,
    success
  });
  return { success, message };
}
async function sendCampPatientArrivalWelcome(data) {
  const setting = await getMessageSettingByType("camp_patient_arrival_welcome");
  if (!setting || setting.isEnabled === 0) {
    console.log("[Messaging] camp_patient_arrival_welcome is disabled");
    return { success: false, reason: "disabled" };
  }
  const message = replaceMessageVariables(setting.messageContent, {
    name: data.name,
    camp_name: data.campName
  });
  const { sendCustomMessage: sendCustomMessage2 } = await Promise.resolve().then(() => (init_whatsapp(), whatsapp_exports));
  const success = await sendCustomMessage2(data.phone, message);
  console.log("[Messaging] Sent camp patient arrival welcome:", {
    phone: data.phone,
    success
  });
  return { success, message };
}
var init_messaging = __esm({
  "server/messaging.ts"() {
    "use strict";
    init_db();
  }
});

// server/db/tasks.ts
var tasks_exports = {};
__export(tasks_exports, {
  addTaskAttachment: () => addTaskAttachment,
  addTaskComment: () => addTaskComment,
  createTask: () => createTask,
  deleteTask: () => deleteTask,
  deleteTaskAttachment: () => deleteTaskAttachment,
  deleteTaskComment: () => deleteTaskComment,
  getAllTasks: () => getAllTasks,
  getOverdueTasks: () => getOverdueTasks,
  getTaskAttachments: () => getTaskAttachments,
  getTaskById: () => getTaskById,
  getTaskComments: () => getTaskComments,
  getTasksByCampaign: () => getTasksByCampaign,
  getTasksByUser: () => getTasksByUser,
  getTasksStats: () => getTasksStats,
  updateTask: () => updateTask,
  updateTaskStatus: () => updateTaskStatus
});
import { eq as eq12, desc as desc7, and as and7, sql as sql5, like as like3, or as or3 } from "drizzle-orm";
async function getAllTasks(filters) {
  const db = await getDb();
  if (!db) return [];
  let conditions = [];
  if (filters?.status && filters.status !== "all") {
    conditions.push(eq12(tasks.status, filters.status));
  }
  if (filters?.priority && filters.priority !== "all") {
    conditions.push(eq12(tasks.priority, filters.priority));
  }
  if (filters?.category && filters.category !== "all") {
    conditions.push(eq12(tasks.category, filters.category));
  }
  if (filters?.assignedTo) {
    conditions.push(eq12(tasks.assignedTo, filters.assignedTo));
  }
  if (filters?.campaignId) {
    conditions.push(eq12(tasks.campaignId, filters.campaignId));
  }
  if (filters?.search) {
    conditions.push(
      or3(
        like3(tasks.title, `%${filters.search}%`),
        like3(tasks.description, `%${filters.search}%`)
      )
    );
  }
  const result = await db.select({
    task: tasks,
    assignedUser: {
      id: users.id,
      name: users.name,
      username: users.username
    },
    campaign: {
      id: campaigns.id,
      name: campaigns.name
    }
  }).from(tasks).leftJoin(users, eq12(tasks.assignedTo, users.id)).leftJoin(campaigns, eq12(tasks.campaignId, campaigns.id)).where(conditions.length > 0 ? and7(...conditions) : void 0).orderBy(desc7(tasks.createdAt));
  return result.map((r) => ({
    ...r.task,
    assignedUser: r.assignedUser?.id ? r.assignedUser : null,
    campaign: r.campaign?.id ? r.campaign : null
  }));
}
async function getTaskById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({
    task: tasks,
    assignedUser: {
      id: users.id,
      name: users.name,
      username: users.username
    },
    campaign: {
      id: campaigns.id,
      name: campaigns.name
    }
  }).from(tasks).leftJoin(users, eq12(tasks.assignedTo, users.id)).leftJoin(campaigns, eq12(tasks.campaignId, campaigns.id)).where(eq12(tasks.id, id)).limit(1);
  if (result.length === 0) return null;
  const r = result[0];
  return {
    ...r.task,
    assignedUser: r.assignedUser?.id ? r.assignedUser : null,
    campaign: r.campaign?.id ? r.campaign : null
  };
}
async function createTask(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tasks).values(data);
  return { id: result[0].insertId };
}
async function updateTask(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (data.status === "completed" && !data.completedAt) {
    data.completedAt = /* @__PURE__ */ new Date();
  }
  await db.update(tasks).set(data).where(eq12(tasks.id, id));
  return { success: true };
}
async function deleteTask(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(taskComments).where(eq12(taskComments.taskId, id));
  await db.delete(taskAttachments).where(eq12(taskAttachments.taskId, id));
  await db.delete(tasks).where(eq12(tasks.id, id));
  return { success: true };
}
async function updateTaskStatus(id, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData = { status };
  if (status === "completed") {
    updateData.completedAt = /* @__PURE__ */ new Date();
  }
  await db.update(tasks).set(updateData).where(eq12(tasks.id, id));
  return { success: true };
}
async function getTasksStats() {
  const db = await getDb();
  if (!db) return { total: 0, todo: 0, inProgress: 0, review: 0, completed: 0, overdue: 0 };
  const now = /* @__PURE__ */ new Date();
  const [total] = await db.select({ count: sql5`count(*)` }).from(tasks);
  const [todo] = await db.select({ count: sql5`count(*)` }).from(tasks).where(eq12(tasks.status, "todo"));
  const [inProgress] = await db.select({ count: sql5`count(*)` }).from(tasks).where(eq12(tasks.status, "in_progress"));
  const [review] = await db.select({ count: sql5`count(*)` }).from(tasks).where(eq12(tasks.status, "review"));
  const [completed] = await db.select({ count: sql5`count(*)` }).from(tasks).where(eq12(tasks.status, "completed"));
  const [overdue] = await db.select({ count: sql5`count(*)` }).from(tasks).where(and7(
    sql5`${tasks.dueDate} < ${now}`,
    sql5`${tasks.status} NOT IN ('completed', 'cancelled')`
  ));
  return {
    total: total?.count || 0,
    todo: todo?.count || 0,
    inProgress: inProgress?.count || 0,
    review: review?.count || 0,
    completed: completed?.count || 0,
    overdue: overdue?.count || 0
  };
}
async function getTaskComments(taskId) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    comment: taskComments,
    user: {
      id: users.id,
      name: users.name,
      username: users.username
    }
  }).from(taskComments).leftJoin(users, eq12(taskComments.userId, users.id)).where(eq12(taskComments.taskId, taskId)).orderBy(desc7(taskComments.createdAt));
  return result.map((r) => ({
    ...r.comment,
    user: r.user
  }));
}
async function addTaskComment(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(taskComments).values(data);
  return { id: result[0].insertId };
}
async function deleteTaskComment(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(taskComments).where(eq12(taskComments.id, id));
  return { success: true };
}
async function getTaskAttachments(taskId) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    attachment: taskAttachments,
    user: {
      id: users.id,
      name: users.name,
      username: users.username
    }
  }).from(taskAttachments).leftJoin(users, eq12(taskAttachments.userId, users.id)).where(eq12(taskAttachments.taskId, taskId)).orderBy(desc7(taskAttachments.createdAt));
  return result.map((r) => ({
    ...r.attachment,
    user: r.user
  }));
}
async function addTaskAttachment(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(taskAttachments).values(data);
  return { id: result[0].insertId };
}
async function deleteTaskAttachment(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(taskAttachments).where(eq12(taskAttachments.id, id));
  return { success: true };
}
async function getTasksByUser(userId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tasks).where(eq12(tasks.assignedTo, userId)).orderBy(desc7(tasks.createdAt));
}
async function getTasksByCampaign(campaignId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tasks).where(eq12(tasks.campaignId, campaignId)).orderBy(desc7(tasks.createdAt));
}
async function getOverdueTasks() {
  const db = await getDb();
  if (!db) return [];
  const now = /* @__PURE__ */ new Date();
  return await db.select().from(tasks).where(and7(
    sql5`${tasks.dueDate} < ${now}`,
    sql5`${tasks.status} NOT IN ('completed', 'cancelled')`
  )).orderBy(tasks.dueDate);
}
var init_tasks = __esm({
  "server/db/tasks.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/oauth.ts
init_db();

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
init_db();
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/_core/sdk.ts
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    if (user.email) {
      const { eq: eq23 } = await import("drizzle-orm");
      const { users: users2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const dbConn = await getDb();
      if (dbConn) {
        await dbConn.update(users2).set({ lastSignedIn: signedInAt }).where(eq23(users2.email, user.email));
      }
    }
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      const userEmail = userInfo.email;
      if (!userEmail) {
        res.redirect(302, "/unauthorized?reason=no_email");
        return;
      }
      const isAllowed = await isUserAllowed(userEmail);
      if (!isAllowed) {
        console.log(`[OAuth] Unauthorized access attempt by ${userEmail}`);
        await createAccessRequest({
          openId: userInfo.openId,
          name: userInfo.name || "\u0645\u0633\u062A\u062E\u062F\u0645 \u062C\u062F\u064A\u062F",
          email: userEmail,
          phone: null,
          reason: "\u0637\u0644\u0628 \u062A\u0644\u0642\u0627\u0626\u064A \u0639\u0646\u062F \u0645\u062D\u0627\u0648\u0644\u0629 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644"
        });
        res.redirect(302, "/access-request?email=" + encodeURIComponent(userEmail));
        return;
      }
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      const user = await getUserByEmail(userEmail);
      if (user && user.id) {
        const { eq: eq23 } = await import("drizzle-orm");
        const { users: users2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const dbConn = await getDb();
        if (dbConn) {
          await dbConn.update(users2).set({ lastSignedIn: /* @__PURE__ */ new Date() }).where(eq23(users2.id, user.id));
        }
      }
      res.redirect(302, "/admin");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/uploadRoute.ts
import { Router } from "express";
import multer from "multer";

// server/storage.ts
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

// server/uploadRoute.ts
import crypto from "crypto";
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`\u0646\u0648\u0639 \u0627\u0644\u0645\u0644\u0641 \u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645: ${file.mimetype}. \u0627\u0644\u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0645\u0633\u0645\u0648\u062D\u0629: ${allowedTypes.join(", ")}`));
    }
  }
});
function generateUniqueFileName(originalName) {
  const ext = originalName.split(".").pop() || "jpg";
  const baseName = originalName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "_");
  const randomSuffix = crypto.randomBytes(6).toString("hex");
  const timestamp2 = Date.now();
  return `${baseName}-${timestamp2}-${randomSuffix}.${ext}`;
}
function createUploadRouter() {
  const router2 = Router();
  router2.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "\u0644\u0645 \u064A\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0645\u0644\u0641" });
      }
      const folder = req.body?.folder || "uploads";
      const uniqueFileName = generateUniqueFileName(file.originalname);
      const fileKey = `${folder}/${uniqueFileName}`;
      const { url, key } = await storagePut(
        fileKey,
        file.buffer,
        file.mimetype
      );
      return res.json({ url, key });
    } catch (error) {
      console.error("[Upload] Error:", error);
      const message = error instanceof Error ? error.message : "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0631\u0641\u0639 \u0627\u0644\u0645\u0644\u0641";
      return res.status(500).json({ error: message });
    }
  });
  router2.use((err, _req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "\u062D\u062C\u0645 \u0627\u0644\u0645\u0644\u0641 \u064A\u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D (10MB)" });
      }
      return res.status(400).json({ error: `\u062E\u0637\u0623 \u0641\u064A \u0631\u0641\u0639 \u0627\u0644\u0645\u0644\u0641: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ error: err.message || "\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641" });
    }
    next();
  });
  return router2;
}

// server/webhookRoutes.ts
init_db();
init_schema();
import { Router as Router2 } from "express";
import { eq as eq2 } from "drizzle-orm";
var VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "sgh_crm_webhook_2024";
function createWebhookRouter() {
  const router2 = Router2();
  router2.get("/api/webhooks/whatsapp", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    console.log("[Webhook] Verification request:", { mode, token: token ? "***" : "missing", challenge: challenge ? "present" : "missing" });
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("[Webhook] Verification successful");
      res.status(200).send(challenge);
    } else {
      console.error("[Webhook] Verification failed - token mismatch");
      res.status(403).json({ error: "Verification token mismatch" });
    }
  });
  router2.post("/api/webhooks/whatsapp", async (req, res) => {
    try {
      res.status(200).json({ success: true });
      const body = req.body;
      if (!body || body.object !== "whatsapp_business_account") {
        console.log("[Webhook] Ignoring non-WhatsApp webhook");
        return;
      }
      console.log("[Webhook] Received:", JSON.stringify(body, null, 2));
      const db = await getDb();
      if (!db) {
        console.error("[Webhook] Database not available");
        return;
      }
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (!value) continue;
          const statuses = value.statuses;
          if (statuses && statuses.length > 0) {
            for (const status of statuses) {
              console.log(`[Webhook] Message status: ${status.status} for message ${status.id}`);
              if (status.status === "failed" && status.errors) {
                for (const error of status.errors) {
                  console.error(`[Webhook] Message failed - Code: ${error.code}, Title: ${error.title}, Message: ${error.message || "N/A"}`);
                }
              }
            }
          }
          const messages = value.messages;
          if (!messages || messages.length === 0) continue;
          for (const message of messages) {
            const userPhone = message.from;
            if (message.type === "button" && message.button) {
              const payload = message.button.payload;
              console.log(`[Webhook] Button clicked: ${payload} from ${userPhone}`);
              const [action, type, id] = payload.split("_");
              if (!action || !type || !id) {
                console.error(`[Webhook] Invalid payload format: ${payload}`);
                continue;
              }
              const bookingId = parseInt(id);
              if (isNaN(bookingId)) {
                console.error(`[Webhook] Invalid booking ID: ${id}`);
                continue;
              }
              if (type === "APPOINTMENT") {
                const newStatus = action === "CONFIRM" ? "confirmed" : "cancelled";
                await db.update(appointments).set({ status: newStatus, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(appointments.id, bookingId));
                console.log(`[Webhook] Appointment ${bookingId} updated to ${newStatus}`);
              } else if (type === "OFFER") {
                const newStatus = action === "CONFIRM" ? "confirmed" : "cancelled";
                await db.update(offerLeads).set({ status: newStatus, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(offerLeads.id, bookingId));
                console.log(`[Webhook] Offer lead ${bookingId} updated to ${newStatus}`);
              } else if (type === "CAMP") {
                const newStatus = action === "CONFIRM" ? "confirmed" : "cancelled";
                await db.update(campRegistrations).set({ status: newStatus, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(campRegistrations.id, bookingId));
                console.log(`[Webhook] Camp registration ${bookingId} updated to ${newStatus}`);
              }
            } else if (message.type === "text" && message.text) {
              console.log(`[Webhook] Text message from ${userPhone}: ${message.text.body}`);
            }
          }
        }
      }
    } catch (error) {
      console.error("[Webhook] Error processing webhook:", error);
    }
  });
  return router2;
}

// server/routers.ts
init_db();
init_schema();
import { z as z25 } from "zod";
import { eq as eq22 } from "drizzle-orm";

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
init_db();

// server/routers/offers.ts
import { z as z2 } from "zod";
init_db();
init_schema();
import { eq as eq3, and as and2 } from "drizzle-orm";

// shared/_core/utils/slug.ts
function generateSlug(text2) {
  return text2.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}
function isValidSlug(slug) {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 255;
}

// server/cache.ts
var ServerCache = class {
  store = /* @__PURE__ */ new Map();
  cleanupInterval = null;
  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanup(), 6e4);
  }
  /**
   * Get a cached value by key.
   * Returns undefined if the key doesn't exist or has expired.
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return void 0;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return void 0;
    }
    return entry.data;
  }
  /**
   * Set a cached value with a TTL in seconds.
   */
  set(key, data, ttlSeconds) {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1e3,
      createdAt: Date.now()
    });
  }
  /**
   * Get or compute: returns cached value if available, otherwise computes and caches it.
   */
  async getOrCompute(key, ttlSeconds, compute) {
    const cached = this.get(key);
    if (cached !== void 0) {
      return cached;
    }
    const data = await compute();
    this.set(key, data, ttlSeconds);
    return data;
  }
  /**
   * Invalidate a specific cache key.
   */
  invalidate(key) {
    return this.store.delete(key);
  }
  /**
   * Invalidate all cache keys matching a prefix pattern.
   * Example: invalidateByPrefix("appointments:") removes all appointment caches.
   */
  invalidateByPrefix(prefix) {
    let count3 = 0;
    const keys = Array.from(this.store.keys());
    for (const key of keys) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count3++;
      }
    }
    return count3;
  }
  /**
   * Clear all cached entries.
   */
  clear() {
    this.store.clear();
  }
  /**
   * Get cache statistics.
   */
  getStats() {
    this.cleanup();
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys())
    };
  }
  /**
   * Remove all expired entries.
   */
  cleanup() {
    const now = Date.now();
    const entries = Array.from(this.store.entries());
    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
  /**
   * Destroy the cache and stop cleanup interval.
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
};
var serverCache = new ServerCache();
var CacheKeys = {
  // Stats caches (TTL: 30 seconds - frequently updated)
  appointmentStats: () => "stats:appointments",
  offerLeadStats: () => "stats:offerLeads",
  campRegistrationStats: () => "stats:campRegistrations",
  leadStats: () => "stats:leads",
  // List caches (TTL: 60 seconds - less frequently changed)
  doctorsList: () => "list:doctors",
  offersList: () => "list:offers",
  campsList: () => "list:camps",
  campaignsList: () => "list:campaigns",
  // Paginated query caches (TTL: 15 seconds - user-specific queries)
  appointmentsPaginated: (params) => `paginated:appointments:${JSON.stringify(params)}`,
  offerLeadsPaginated: (params) => `paginated:offerLeads:${JSON.stringify(params)}`,
  campRegistrationsPaginated: (params) => `paginated:campRegistrations:${JSON.stringify(params)}`
};
var CacheTTL = {
  STATS: 30,
  // Stats refresh every 30 seconds
  LIST: 60,
  // Reference lists refresh every 60 seconds
  PAGINATED: 15,
  // Paginated queries refresh every 15 seconds
  SHORT: 10
  // Short-lived cache for rapidly changing data
};

// server/routers/offers.ts
var offerInputSchema = z2.object({
  title: z2.string().min(3, "Title must be at least 3 characters").max(255),
  description: z2.string().optional(),
  imageUrl: z2.string().url().optional(),
  startDate: z2.date().optional(),
  endDate: z2.date().optional()
});
var offersRouter = router({
  /**
   * Get all active offers
   * الحصول على جميع العروض النشطة
   */
  getAll: publicProcedure.query(async () => {
    return serverCache.getOrCompute(
      CacheKeys.offersList(),
      CacheTTL.LIST,
      async () => {
        try {
          const dbInstance = await getDb();
          if (!dbInstance) throw new Error("Database not available");
          const allOffers = await dbInstance.select().from(offers).where(eq3(offers.isActive, true)).orderBy(offers.createdAt);
          return allOffers;
        } catch (error) {
          console.error("Error fetching offers:", error);
          throw new Error("Failed to fetch offers");
        }
      }
    );
  }),
  /**
   * Get all offers for admin (includes inactive)
   * الحصول على جميع العروض للإدارة (يشمل غير النشطة)
   */
  getAllAdmin: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized: Only admins can view all offers");
    }
    try {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");
      const allOffers = await dbInstance.select().from(offers).orderBy(offers.createdAt);
      return allOffers;
    } catch (error) {
      console.error("Error fetching offers:", error);
      throw new Error("Failed to fetch offers");
    }
  }),
  /**
   * Get a specific offer by slug
   * الحصول على عرض معين حسب الرابط
   */
  getBySlug: publicProcedure.input(z2.object({ slug: z2.string() })).query(async ({ input }) => {
    try {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");
      const offer = await dbInstance.select().from(offers).where(and2(eq3(offers.slug, input.slug), eq3(offers.isActive, true))).limit(1);
      if (offer.length === 0) {
        throw new Error("Offer not found");
      }
      return offer[0];
    } catch (error) {
      console.error("Error fetching offer:", error);
      throw new Error("Failed to fetch offer");
    }
  }),
  /**
   * Create a new offer (admin only)
   * إنشاء عرض جديد (مسؤول فقط)
   */
  create: protectedProcedure.input(offerInputSchema).mutation(async ({ input, ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized: Only admins can create offers");
    }
    try {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");
      const slug = generateSlug(input.title);
      if (!isValidSlug(slug)) {
        throw new Error("Invalid slug format");
      }
      const existingOffer = await dbInstance.select().from(offers).where(eq3(offers.slug, slug)).limit(1);
      if (existingOffer.length > 0) {
        throw new Error("An offer with this title already exists");
      }
      const newOffer = await dbInstance.insert(offers).values({
        title: input.title,
        slug,
        description: input.description,
        imageUrl: input.imageUrl,
        startDate: input.startDate,
        endDate: input.endDate,
        isActive: true
      });
      serverCache.invalidate(CacheKeys.offersList());
      return { success: true, slug };
    } catch (error) {
      console.error("Error creating offer:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to create offer");
    }
  }),
  /**
   * Update an existing offer (admin only)
   * تحديث عرض موجود (مسؤول فقط)
   */
  update: protectedProcedure.input(
    z2.object({
      id: z2.number(),
      ...offerInputSchema.shape
    })
  ).mutation(async ({ input, ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized: Only admins can update offers");
    }
    try {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");
      const slug = generateSlug(input.title);
      if (!isValidSlug(slug)) {
        throw new Error("Invalid slug format");
      }
      await dbInstance.update(offers).set({
        title: input.title,
        slug,
        description: input.description,
        imageUrl: input.imageUrl,
        startDate: input.startDate,
        endDate: input.endDate
      }).where(eq3(offers.id, input.id));
      serverCache.invalidate(CacheKeys.offersList());
      return { success: true };
    } catch (error) {
      console.error("Error updating offer:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to update offer");
    }
  }),
  /**
   * Deactivate an offer (admin only)
   * إلغاء تفعيل عرض (مسؤول فقط)
   */
  deactivate: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized: Only admins can deactivate offers");
    }
    try {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");
      await dbInstance.update(offers).set({ isActive: false }).where(eq3(offers.id, input.id));
      serverCache.invalidate(CacheKeys.offersList());
      return { success: true };
    } catch (error) {
      console.error("Error deactivating offer:", error);
      throw new Error("Failed to deactivate offer");
    }
  }),
  /**
   * Delete an offer (admin only)
   * حذف عرض (مسؤول فقط)
   */
  delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized: Only admins can delete offers");
    }
    try {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");
      await dbInstance.delete(offers).where(eq3(offers.id, input.id));
      serverCache.invalidate(CacheKeys.offersList());
      return { success: true };
    } catch (error) {
      console.error("Error deleting offer:", error);
      throw new Error("Failed to delete offer");
    }
  })
});

// server/routers/camps.ts
import { z as z3 } from "zod";
init_db();
init_schema();
import { eq as eq4, and as and3, desc as desc2 } from "drizzle-orm";
var campInputSchema = z3.object({
  name: z3.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u0645\u062E\u064A\u0645 \u0645\u0637\u0644\u0648\u0628"),
  slug: z3.string().optional(),
  description: z3.string().optional(),
  imageUrl: z3.string().optional(),
  startDate: z3.date().optional(),
  endDate: z3.date().optional(),
  isActive: z3.boolean().default(true),
  // New fields for advanced camp management
  freeOffers: z3.string().optional(),
  // Free offers (one per line)
  discountedOffers: z3.string().optional(),
  // Discounted offers (one per line)
  availableProcedures: z3.string().optional(),
  // JSON string
  galleryImages: z3.string().optional()
  // JSON string
});
var campsRouter = router({
  /**
   * Get all camps (public)
   * الحصول على جميع المخيمات (عام)
   */
  getAll: publicProcedure.query(async () => {
    return serverCache.getOrCompute(
      "camps:active",
      CacheTTL.LIST,
      async () => {
        const db = await getDb();
        if (!db) return [];
        const result = await db.select().from(camps).where(eq4(camps.isActive, true)).orderBy(desc2(camps.createdAt));
        return result;
      }
    );
  }),
  /**
   * Get all camps for admin (includes inactive)
   * الحصول على جميع المخيمات للإدارة (يشمل غير النشطة)
   */
  getAllAdmin: publicProcedure.query(async () => {
    return serverCache.getOrCompute(
      CacheKeys.campsList(),
      CacheTTL.LIST,
      async () => {
        const db = await getDb();
        if (!db) return [];
        const result = await db.select().from(camps).orderBy(desc2(camps.createdAt));
        return result;
      }
    );
  }),
  /**
   * Get camp by ID
   * الحصول على مخيم بواسطة المعرف
   */
  getById: publicProcedure.input(z3.object({ id: z3.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(camps).where(eq4(camps.id, input.id)).limit(1);
    return result[0] || null;
  }),
  /**
   * Get camp by slug
   * الحصول على مخيم بواسطة الرابط
   */
  getBySlug: publicProcedure.input(z3.object({ slug: z3.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(camps).where(and3(
      eq4(camps.slug, input.slug),
      eq4(camps.isActive, true)
    )).limit(1);
    return result[0] || null;
  }),
  /**
   * Create new camp (admin only)
   * إنشاء مخيم جديد (للإدارة فقط)
   */
  create: protectedProcedure.input(campInputSchema).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const slug = input.slug || generateSlug(input.name);
    if (!isValidSlug(slug)) {
      throw new Error("\u0635\u064A\u063A\u0629 \u0627\u0644\u0631\u0627\u0628\u0637 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629");
    }
    const existing = await db.select().from(camps).where(eq4(camps.slug, slug)).limit(1);
    if (existing.length > 0) {
      throw new Error("\u0647\u0630\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0627\u0644\u0641\u0639\u0644");
    }
    await db.insert(camps).values({
      name: input.name,
      slug,
      description: input.description,
      imageUrl: input.imageUrl,
      startDate: input.startDate,
      endDate: input.endDate,
      isActive: input.isActive,
      freeOffers: input.freeOffers,
      discountedOffers: input.discountedOffers,
      availableProcedures: input.availableProcedures,
      galleryImages: input.galleryImages
    });
    serverCache.invalidate(CacheKeys.campsList());
    serverCache.invalidate("camps:active");
    return { success: true, slug };
  }),
  /**
   * Update camp (admin only)
   * تحديث مخيم (للإدارة فقط)
   */
  update: protectedProcedure.input(z3.object({
    id: z3.number(),
    ...campInputSchema.shape
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    if (data.slug) {
      if (!isValidSlug(data.slug)) {
        throw new Error("\u0635\u064A\u063A\u0629 \u0627\u0644\u0631\u0627\u0628\u0637 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629");
      }
      const existing = await db.select().from(camps).where(and3(
        eq4(camps.slug, data.slug)
        // Exclude current camp from duplicate check
      )).limit(1);
      if (existing.length > 0 && existing[0].id !== id) {
        throw new Error("\u0647\u0630\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0627\u0644\u0641\u0639\u0644");
      }
    }
    await db.update(camps).set({
      name: data.name,
      slug: data.slug,
      description: data.description,
      imageUrl: data.imageUrl,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive,
      freeOffers: data.freeOffers,
      discountedOffers: data.discountedOffers,
      availableProcedures: data.availableProcedures,
      galleryImages: data.galleryImages
    }).where(eq4(camps.id, id));
    serverCache.invalidate(CacheKeys.campsList());
    serverCache.invalidate("camps:active");
    return { success: true };
  }),
  /**
   * Delete camp (admin only))
   * حذف مخيم (للإدارة فقط)
   */
  delete: protectedProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(camps).where(eq4(camps.id, input.id));
    serverCache.invalidate(CacheKeys.campsList());
    serverCache.invalidate("camps:active");
    return { success: true };
  }),
  /**
   * Toggle camp active status (admin only)
   * تبديل حالة نشاط المخيم (للإدارة فقط)
   */
  toggleActive: protectedProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const current = await db.select().from(camps).where(eq4(camps.id, input.id)).limit(1);
    if (current.length === 0) {
      throw new Error("\u0627\u0644\u0645\u062E\u064A\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
    }
    await db.update(camps).set({ isActive: !current[0].isActive }).where(eq4(camps.id, input.id));
    serverCache.invalidate(CacheKeys.campsList());
    serverCache.invalidate("camps:active");
    return { success: true, isActive: !current[0].isActive };
  })
});

// server/routers/offerLeads.ts
import { z as z5 } from "zod";
import { eq as eq6, desc as desc4 } from "drizzle-orm";
init_db();
init_schema();

// server/telegram.ts
var TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
var TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";
async function sendTelegramNotification(params) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("[Telegram] Bot token or chat ID not configured");
    return false;
  }
  try {
    const emoji = getEmojiForType(params.type);
    const message = `${emoji} *${params.title}*

${params.content}`;
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "Markdown"
        })
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      console.error("[Telegram] Failed to send message:", errorData);
      return false;
    }
    console.log("[Telegram] Message sent successfully");
    return true;
  } catch (error) {
    console.error("[Telegram] Error sending message:", error);
    return false;
  }
}
function getEmojiForType(type) {
  switch (type) {
    case "lead":
      return "\u{1F464}";
    case "appointment":
      return "\u{1F4C5}";
    case "offer":
      return "\u{1F381}";
    case "camp":
      return "\u26FA";
    default:
      return "\u{1F514}";
  }
}
async function sendNewLeadTelegram(params) {
  return sendTelegramNotification({
    title: "\u0639\u0645\u064A\u0644 \u062C\u062F\u064A\u062F",
    content: `\u0627\u0644\u0627\u0633\u0645: ${params.fullName}
\u0627\u0644\u0647\u0627\u062A\u0641: ${params.phone}
\u0627\u0644\u0628\u0631\u064A\u062F: ${params.email || "\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631"}
\u0627\u0644\u0645\u0635\u062F\u0631: ${params.source || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}`,
    type: "lead"
  });
}
async function sendNewAppointmentTelegram(params) {
  return sendTelegramNotification({
    title: "\u0645\u0648\u0639\u062F \u062C\u062F\u064A\u062F",
    content: `\u0627\u0644\u0627\u0633\u0645: ${params.fullName}
\u0627\u0644\u0647\u0627\u062A\u0641: ${params.phone}
\u0627\u0644\u0628\u0631\u064A\u062F: ${params.email || "\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631"}
\u0627\u0644\u0637\u0628\u064A\u0628: ${params.doctorName}
\u0627\u0644\u062A\u0627\u0631\u064A\u062E: ${params.preferredDate || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}
\u0627\u0644\u0648\u0642\u062A: ${params.preferredTime || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}`,
    type: "appointment"
  });
}
async function sendNewOfferLeadTelegram(params) {
  return sendTelegramNotification({
    title: "\u062D\u062C\u0632 \u0639\u0631\u0636 \u062C\u062F\u064A\u062F",
    content: `\u0627\u0644\u0627\u0633\u0645: ${params.fullName}
\u0627\u0644\u0647\u0627\u062A\u0641: ${params.phone}
\u0627\u0644\u0628\u0631\u064A\u062F: ${params.email || "\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631"}
\u0627\u0644\u0639\u0631\u0636: ${params.offerTitle}`,
    type: "offer"
  });
}
async function sendNewCampRegistrationTelegram(params) {
  return sendTelegramNotification({
    title: "\u062A\u0633\u062C\u064A\u0644 \u0645\u062E\u064A\u0645 \u062C\u062F\u064A\u062F",
    content: `\u0627\u0644\u0627\u0633\u0645: ${params.fullName}
\u0627\u0644\u0647\u0627\u062A\u0641: ${params.phone}
\u0627\u0644\u0628\u0631\u064A\u062F: ${params.email || "\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631"}
\u0627\u0644\u0645\u062E\u064A\u0645: ${params.campTitle}
\u0627\u0644\u0639\u0645\u0631: ${params.age || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}`,
    type: "camp"
  });
}

// server/routers/auditLogs.ts
import { z as z4 } from "zod";
init_db();
init_schema();
import { eq as eq5, desc as desc3, and as and4, sql as sql2 } from "drizzle-orm";
async function createAuditLog(params) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(auditLogs).values({
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      oldValue: params.oldValue || null,
      newValue: params.newValue || null,
      userId: params.userId || null,
      userName: params.userName || null,
      notes: params.notes || null
    });
  } catch (error) {
    console.error("[AuditLog] Failed to create audit log:", error);
  }
}
var auditLogsRouter = router({
  /**
   * Get audit logs for a specific entity
   * جلب سجل التغييرات لكيان محدد
   */
  getByEntity: protectedProcedure.input(z4.object({
    entityType: z4.string(),
    entityId: z4.number()
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(auditLogs).where(and4(
      eq5(auditLogs.entityType, input.entityType),
      eq5(auditLogs.entityId, input.entityId)
    )).orderBy(desc3(auditLogs.createdAt));
  }),
  /**
   * Get paginated audit logs with filters
   * جلب سجل التغييرات مع pagination وفلاتر
   */
  listPaginated: protectedProcedure.input(z4.object({
    page: z4.number().min(1).default(1),
    limit: z4.number().min(1).max(500).default(50),
    entityType: z4.string().optional(),
    action: z4.string().optional(),
    userId: z4.number().optional()
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { logs: [], total: 0 };
    const { page, limit, entityType, action, userId } = input;
    const offset = (page - 1) * limit;
    const conditions = [];
    if (entityType) conditions.push(eq5(auditLogs.entityType, entityType));
    if (action) conditions.push(eq5(auditLogs.action, action));
    if (userId) conditions.push(eq5(auditLogs.userId, userId));
    const whereClause = conditions.length > 0 ? and4(...conditions) : void 0;
    const [logs, countResult] = await Promise.all([
      db.select().from(auditLogs).where(whereClause).orderBy(desc3(auditLogs.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql2`COUNT(*)` }).from(auditLogs).where(whereClause)
    ]);
    return {
      logs,
      total: Number(countResult[0]?.count || 0)
    };
  })
});

// server/routers/offerLeads.ts
var offerLeadsRouter = router({
  // Submit a new offer lead (public)
  submit: publicProcedure.input(
    z5.object({
      offerId: z5.number(),
      fullName: z5.string().min(1),
      phone: z5.string().min(1),
      email: z5.string().email().optional(),
      notes: z5.string().optional(),
      source: z5.string().optional(),
      status: z5.enum(["new", "contacted", "booked", "not_interested", "no_answer", "pending", "confirmed", "completed", "cancelled"]).optional(),
      // Manual registration status
      utmSource: z5.string().optional(),
      utmMedium: z5.string().optional(),
      utmCampaign: z5.string().optional(),
      utmTerm: z5.string().optional(),
      utmContent: z5.string().optional(),
      utmPlacement: z5.string().optional(),
      referrer: z5.string().optional(),
      fbclid: z5.string().optional(),
      gclid: z5.string().optional()
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [lead] = await db.insert(offerLeads).values({
      offerId: input.offerId,
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      notes: input.notes,
      source: input.source || "website",
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
      utmTerm: input.utmTerm,
      utmContent: input.utmContent,
      utmPlacement: input.utmPlacement,
      referrer: input.referrer,
      fbclid: input.fbclid,
      gclid: input.gclid,
      status: input.status || "new"
      // Use provided status or default to new
    });
    const { offers: offers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const [offer] = await db.select().from(offers2).where(eq6(offers2.id, input.offerId)).limit(1);
    if (offer) {
      await sendNewOfferLeadTelegram({
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        offerTitle: offer.title
      });
    }
    if (offer) {
      const { sendOfferBookingConfirmationInteractive: sendOfferBookingConfirmationInteractive2, formatDateForMessage: formatDateForMessage2, formatTimeForMessage: formatTimeForMessage2 } = await Promise.resolve().then(() => (init_messaging(), messaging_exports));
      sendOfferBookingConfirmationInteractive2({
        phone: input.phone,
        name: input.fullName,
        service: offer.title,
        date: offer.startDate ? formatDateForMessage2(new Date(offer.startDate)) : "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
        time: offer.startDate ? formatTimeForMessage2(new Date(offer.startDate)) : "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
        bookingId: Number(lead.insertId)
      }).catch((error) => {
        console.error("[WhatsApp] Failed to send offer booking confirmation:", error);
      });
    }
    serverCache.invalidateByPrefix("paginated:offerLeads:");
    serverCache.invalidate("list:offerLeads");
    serverCache.invalidate(CacheKeys.offerLeadStats());
    return { success: true, id: lead.insertId };
  }),
  // List all offer leads (protected)
  list: protectedProcedure.query(async () => {
    return serverCache.getOrCompute(
      "list:offerLeads",
      CacheTTL.LIST,
      async () => {
        const db = await getDb();
        if (!db) return [];
        const { offers: offers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const results = await db.select({
          id: offerLeads.id,
          offerId: offerLeads.offerId,
          offerTitle: offers2.title,
          fullName: offerLeads.fullName,
          phone: offerLeads.phone,
          email: offerLeads.email,
          notes: offerLeads.notes,
          source: offerLeads.source,
          status: offerLeads.status,
          createdAt: offerLeads.createdAt,
          updatedAt: offerLeads.updatedAt
        }).from(offerLeads).leftJoin(offers2, eq6(offers2.id, offerLeads.offerId)).orderBy(desc4(offerLeads.createdAt));
        return results;
      }
    );
  }),
  // List offer leads with pagination (protected)
  listPaginated: protectedProcedure.input(
    z5.object({
      page: z5.number().min(1).default(1),
      limit: z5.number().min(1).max(1e5).default(20),
      searchTerm: z5.string().optional(),
      offerIds: z5.array(z5.number()).optional(),
      sources: z5.array(z5.string()).optional(),
      statuses: z5.array(z5.string()).optional(),
      dateFilter: z5.enum(["all", "today", "week", "month"]).optional(),
      dateFrom: z5.string().optional(),
      dateTo: z5.string().optional()
    })
  ).query(async ({ input }) => {
    const cacheKey = CacheKeys.offerLeadsPaginated(input);
    return serverCache.getOrCompute(
      cacheKey,
      CacheTTL.PAGINATED,
      async () => {
        const { getOfferLeadsPaginated: getOfferLeadsPaginated2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        return getOfferLeadsPaginated2(
          input.page,
          input.limit,
          input.searchTerm,
          input.offerIds,
          input.sources,
          input.statuses,
          input.dateFilter,
          input.dateFrom,
          input.dateTo
        );
      }
    );
  }),
  // Get stats for offer leads (protected)
  stats: protectedProcedure.query(async () => {
    return serverCache.getOrCompute(
      CacheKeys.offerLeadStats(),
      CacheTTL.STATS,
      async () => {
        const db = await getDb();
        if (!db) return { total: 0, new: 0, contacted: 0, booked: 0, not_interested: 0, no_answer: 0 };
        const all = await db.select().from(offerLeads);
        return {
          total: all.length,
          new: all.filter((l) => l.status === "new").length,
          contacted: all.filter((l) => l.status === "contacted").length,
          booked: all.filter((l) => l.status === "booked").length,
          not_interested: all.filter((l) => l.status === "not_interested").length,
          no_answer: all.filter((l) => l.status === "no_answer").length
        };
      }
    );
  }),
  // Update offer lead status (protected)
  updateStatus: protectedProcedure.input(
    z5.object({
      id: z5.number(),
      status: z5.enum(["new", "contacted", "booked", "not_interested", "no_answer"]),
      notes: z5.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [old] = await db.select({ status: offerLeads.status }).from(offerLeads).where(eq6(offerLeads.id, input.id)).limit(1);
    const oldStatus = old?.status || "";
    await db.update(offerLeads).set({
      status: input.status,
      statusNotes: input.notes,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq6(offerLeads.id, input.id));
    await createAuditLog({
      entityType: "offerLead",
      entityId: input.id,
      action: "status_change",
      oldValue: oldStatus,
      newValue: input.status,
      userId: ctx.user?.id,
      userName: ctx.user?.name,
      notes: input.notes
    });
    if (input.status === "booked") {
      const [lead] = await db.select().from(offerLeads).where(eq6(offerLeads.id, input.id)).limit(1);
      if (lead && lead.phone) {
        const { sendOfferPatientArrivalWelcome: sendOfferPatientArrivalWelcome2 } = await Promise.resolve().then(() => (init_messaging(), messaging_exports));
        const { offers: offers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const [offer] = await db.select().from(offers2).where(eq6(offers2.id, lead.offerId)).limit(1);
        await sendOfferPatientArrivalWelcome2({
          phone: lead.phone,
          name: lead.fullName || "\u0627\u0644\u0645\u0631\u064A\u0636",
          service: offer?.title || "\u0627\u0644\u0639\u0631\u0636"
        });
      }
    }
    serverCache.invalidateByPrefix("paginated:offerLeads:");
    serverCache.invalidate("list:offerLeads");
    serverCache.invalidate(CacheKeys.offerLeadStats());
    return { success: true };
  }),
  // Bulk update status for multiple offer leads (protected)
  bulkUpdateStatus: protectedProcedure.input(
    z5.object({
      ids: z5.array(z5.number()),
      status: z5.enum(["new", "contacted", "booked", "not_interested", "no_answer"]),
      notes: z5.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    for (const id of input.ids) {
      await db.update(offerLeads).set({
        status: input.status,
        statusNotes: input.notes,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq6(offerLeads.id, id));
    }
    for (const id of input.ids) {
      await createAuditLog({
        entityType: "offerLead",
        entityId: id,
        action: "bulk_status_change",
        newValue: input.status,
        userId: ctx.user?.id,
        userName: ctx.user?.name,
        notes: input.notes
      });
    }
    serverCache.invalidateByPrefix("paginated:offerLeads:");
    serverCache.invalidate("list:offerLeads");
    serverCache.invalidate(CacheKeys.offerLeadStats());
    return { success: true, count: input.ids.length };
  }),
  // Delete offer lead (protected)
  delete: protectedProcedure.input(z5.object({ id: z5.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(offerLeads).where(eq6(offerLeads.id, input.id));
    serverCache.invalidateByPrefix("paginated:offerLeads:");
    serverCache.invalidate("list:offerLeads");
    serverCache.invalidate(CacheKeys.offerLeadStats());
    return { success: true };
  }),
  // Generate and save receipt number
  generateReceiptNumber: protectedProcedure.input(z5.object({
    id: z5.number()
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [lead] = await db.select().from(offerLeads).where(eq6(offerLeads.id, input.id)).limit(1);
    if (!lead) {
      throw new Error("\u0627\u0644\u062D\u062C\u0632 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
    }
    if (lead.receiptNumber) {
      return { receiptNumber: lead.receiptNumber };
    }
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const { sql: sql8 } = await import("drizzle-orm");
    const [result] = await db.execute(sql8`
        SELECT COUNT(*) as count 
        FROM offerLeads 
        WHERE receiptNumber LIKE CONCAT('SGH-', ${year}, '-%')
      `);
    const count3 = result.count || 0;
    const sequenceNumber = count3 + 1;
    const paddedNumber = String(sequenceNumber).padStart(3, "0");
    const receiptNumber = `SGH-${year}-${paddedNumber}`;
    await db.update(offerLeads).set({ receiptNumber }).where(eq6(offerLeads.id, input.id));
    return { receiptNumber };
  })
});

// server/routers/campRegistrations.ts
import { z as z6 } from "zod";
import { eq as eq7, desc as desc5 } from "drizzle-orm";
init_db();
init_schema();
var campRegistrationsRouter = router({
  // Submit a new camp registration (public)
  submit: publicProcedure.input(
    z6.object({
      campId: z6.number(),
      fullName: z6.string().min(1),
      phone: z6.string().min(1),
      email: z6.string().email().optional(),
      age: z6.number().optional(),
      procedures: z6.string().optional(),
      // JSON string of selected procedures
      medicalCondition: z6.string().optional(),
      notes: z6.string().optional(),
      source: z6.string().optional(),
      status: z6.enum(["pending", "confirmed", "attended", "cancelled"]).optional(),
      // Manual registration status
      utmSource: z6.string().optional(),
      utmMedium: z6.string().optional(),
      utmCampaign: z6.string().optional(),
      utmTerm: z6.string().optional(),
      utmContent: z6.string().optional(),
      utmPlacement: z6.string().optional(),
      referrer: z6.string().optional(),
      fbclid: z6.string().optional(),
      gclid: z6.string().optional()
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [registration] = await db.insert(campRegistrations).values({
      campId: input.campId,
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      age: input.age,
      procedures: input.procedures,
      medicalCondition: input.medicalCondition,
      notes: input.notes,
      source: input.source || "website",
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
      utmTerm: input.utmTerm,
      utmContent: input.utmContent,
      utmPlacement: input.utmPlacement,
      referrer: input.referrer,
      fbclid: input.fbclid,
      gclid: input.gclid,
      status: input.status || "pending"
      // Use provided status or default to pending
    });
    const { camps: camps2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const [camp] = await db.select().from(camps2).where(eq7(camps2.id, input.campId)).limit(1);
    if (camp) {
      await sendNewCampRegistrationTelegram({
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        campTitle: camp.name,
        age: input.age
      });
    }
    if (camp) {
      const { sendCampRegistrationConfirmationInteractive: sendCampRegistrationConfirmationInteractive2, formatDateForMessage: formatDateForMessage2, formatTimeForMessage: formatTimeForMessage2 } = await Promise.resolve().then(() => (init_messaging(), messaging_exports));
      sendCampRegistrationConfirmationInteractive2({
        phone: input.phone,
        name: input.fullName,
        campName: camp.name,
        date: camp.startDate ? formatDateForMessage2(new Date(camp.startDate)) : "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
        time: camp.startDate ? formatTimeForMessage2(new Date(camp.startDate)) : "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
        location: "\u0627\u0644\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A \u0627\u0644\u0623\u0644\u0645\u0627\u0646\u064A - \u0635\u0646\u0639\u0627\u0621",
        bookingId: Number(registration.insertId)
      }).catch((error) => {
        console.error("[WhatsApp] Failed to send camp registration confirmation:", error);
      });
    }
    serverCache.invalidateByPrefix("paginated:campRegistrations:");
    serverCache.invalidate("list:campRegistrations");
    serverCache.invalidate(CacheKeys.campRegistrationStats());
    return { success: true, id: registration.insertId };
  }),
  // List all camp registrations (protected)
  list: protectedProcedure.query(async () => {
    return serverCache.getOrCompute(
      "list:campRegistrations",
      CacheTTL.LIST,
      async () => {
        const db = await getDb();
        if (!db) return [];
        const { camps: camps2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const results = await db.select({
          id: campRegistrations.id,
          campId: campRegistrations.campId,
          campName: camps2.name,
          fullName: campRegistrations.fullName,
          phone: campRegistrations.phone,
          email: campRegistrations.email,
          age: campRegistrations.age,
          procedures: campRegistrations.procedures,
          medicalCondition: campRegistrations.medicalCondition,
          notes: campRegistrations.notes,
          source: campRegistrations.source,
          status: campRegistrations.status,
          createdAt: campRegistrations.createdAt,
          updatedAt: campRegistrations.updatedAt
        }).from(campRegistrations).leftJoin(camps2, eq7(camps2.id, campRegistrations.campId)).orderBy(desc5(campRegistrations.createdAt));
        return results;
      }
    );
  }),
  // List camp registrations with pagination (protected)
  listPaginated: protectedProcedure.input(
    z6.object({
      page: z6.number().min(1).default(1),
      limit: z6.number().min(1).max(1e5).default(20),
      searchTerm: z6.string().optional(),
      campIds: z6.array(z6.number()).optional(),
      sources: z6.array(z6.string()).optional(),
      statuses: z6.array(z6.string()).optional(),
      dateFilter: z6.enum(["all", "today", "week", "month"]).optional(),
      dateFrom: z6.string().optional(),
      dateTo: z6.string().optional()
    })
  ).query(async ({ input }) => {
    const cacheKey = CacheKeys.campRegistrationsPaginated(input);
    return serverCache.getOrCompute(
      cacheKey,
      CacheTTL.PAGINATED,
      async () => {
        const { getCampRegistrationsPaginated: getCampRegistrationsPaginated2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        return getCampRegistrationsPaginated2(
          input.page,
          input.limit,
          input.searchTerm,
          input.campIds,
          input.sources,
          input.statuses,
          input.dateFilter,
          input.dateFrom,
          input.dateTo
        );
      }
    );
  }),
  // Get stats for camp registrations (protected)
  stats: protectedProcedure.query(async () => {
    return serverCache.getOrCompute(
      CacheKeys.campRegistrationStats(),
      CacheTTL.STATS,
      async () => {
        const db = await getDb();
        if (!db) return { total: 0, pending: 0, confirmed: 0, attended: 0, cancelled: 0 };
        const all = await db.select().from(campRegistrations);
        return {
          total: all.length,
          pending: all.filter((r) => r.status === "pending").length,
          confirmed: all.filter((r) => r.status === "confirmed").length,
          attended: all.filter((r) => r.status === "attended").length,
          cancelled: all.filter((r) => r.status === "cancelled").length
        };
      }
    );
  }),
  // Update camp registration status (protected)
  updateStatus: protectedProcedure.input(
    z6.object({
      id: z6.number(),
      status: z6.enum(["pending", "confirmed", "attended", "cancelled"]),
      notes: z6.string().optional(),
      fullName: z6.string().optional(),
      phone: z6.string().optional(),
      attendanceDate: z6.date().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [old] = await db.select({ status: campRegistrations.status }).from(campRegistrations).where(eq7(campRegistrations.id, input.id)).limit(1);
    const oldStatus = old?.status || "";
    const updateData = {
      status: input.status,
      statusNotes: input.notes,
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (input.fullName) updateData.fullName = input.fullName;
    if (input.phone) updateData.phone = input.phone;
    if (input.attendanceDate) updateData.attendanceDate = input.attendanceDate;
    await db.update(campRegistrations).set(updateData).where(eq7(campRegistrations.id, input.id));
    await createAuditLog({
      entityType: "campRegistration",
      entityId: input.id,
      action: "status_change",
      oldValue: oldStatus,
      newValue: input.status,
      userId: ctx.user?.id,
      userName: ctx.user?.name,
      notes: input.notes
    });
    if (input.status === "attended") {
      const [registration] = await db.select().from(campRegistrations).where(eq7(campRegistrations.id, input.id)).limit(1);
      if (registration && registration.phone) {
        const { sendCampPatientArrivalWelcome: sendCampPatientArrivalWelcome2 } = await Promise.resolve().then(() => (init_messaging(), messaging_exports));
        const { camps: camps2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const [camp] = await db.select().from(camps2).where(eq7(camps2.id, registration.campId)).limit(1);
        await sendCampPatientArrivalWelcome2({
          phone: registration.phone,
          name: registration.fullName || "\u0627\u0644\u0645\u0631\u064A\u0636",
          campName: camp?.name || "\u0627\u0644\u0645\u062E\u064A\u0645"
        });
      }
    }
    serverCache.invalidateByPrefix("paginated:campRegistrations:");
    serverCache.invalidate("list:campRegistrations");
    serverCache.invalidate(CacheKeys.campRegistrationStats());
    return { success: true };
  }),
  // Bulk update status for multiple registrations (protected)
  bulkUpdateStatus: protectedProcedure.input(
    z6.object({
      ids: z6.array(z6.number()),
      status: z6.enum(["pending", "confirmed", "attended", "cancelled"]),
      notes: z6.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const updateData = {
      status: input.status,
      statusNotes: input.notes,
      updatedAt: /* @__PURE__ */ new Date()
    };
    for (const id of input.ids) {
      await db.update(campRegistrations).set(updateData).where(eq7(campRegistrations.id, id));
    }
    for (const id of input.ids) {
      await createAuditLog({
        entityType: "campRegistration",
        entityId: id,
        action: "bulk_status_change",
        newValue: input.status,
        userId: ctx.user?.id,
        userName: ctx.user?.name,
        notes: input.notes
      });
    }
    serverCache.invalidateByPrefix("paginated:campRegistrations:");
    serverCache.invalidate("list:campRegistrations");
    serverCache.invalidate(CacheKeys.campRegistrationStats());
    return { success: true, count: input.ids.length };
  }),
  // Delete camp registration (protected)
  delete: protectedProcedure.input(z6.object({ id: z6.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(campRegistrations).where(eq7(campRegistrations.id, input.id));
    serverCache.invalidateByPrefix("paginated:campRegistrations:");
    serverCache.invalidate("list:campRegistrations");
    serverCache.invalidate(CacheKeys.campRegistrationStats());
    return { success: true };
  }),
  // Generate and save receipt number
  generateReceiptNumber: protectedProcedure.input(z6.object({
    id: z6.number()
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [registration] = await db.select().from(campRegistrations).where(eq7(campRegistrations.id, input.id)).limit(1);
    if (!registration) {
      throw new Error("\u0627\u0644\u062A\u0633\u062C\u064A\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
    }
    if (registration.receiptNumber) {
      return { receiptNumber: registration.receiptNumber };
    }
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const { sql: sql8 } = await import("drizzle-orm");
    const [result] = await db.execute(sql8`
        SELECT COUNT(*) as count 
        FROM campRegistrations 
        WHERE receiptNumber LIKE CONCAT('SGH-', ${year}, '-%')
      `);
    const count3 = result.count || 0;
    const sequenceNumber = count3 + 1;
    const paddedNumber = String(sequenceNumber).padStart(3, "0");
    const receiptNumber = `SGH-${year}-${paddedNumber}`;
    await db.update(campRegistrations).set({ receiptNumber }).where(eq7(campRegistrations.id, input.id));
    return { receiptNumber };
  })
});

// server/routers/doctors.ts
import { z as z7 } from "zod";
init_db();
init_schema();
import { eq as eq8 } from "drizzle-orm";
var doctorsRouter = router({
  // List all doctors (public) - cached
  list: publicProcedure.query(async () => {
    return serverCache.getOrCompute(
      CacheKeys.doctorsList(),
      CacheTTL.LIST,
      async () => {
        const db = await getDb();
        if (!db) return [];
        const results = await db.select().from(doctors);
        return results;
      }
    );
  }),
  // Get doctor by ID (public)
  getById: publicProcedure.input(z7.object({ id: z7.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(doctors).where(eq8(doctors.id, input.id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }),
  // Get doctor by slug (public)
  getBySlug: publicProcedure.input(z7.object({ slug: z7.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(doctors).where(eq8(doctors.slug, input.slug)).limit(1);
    return result.length > 0 ? result[0] : null;
  }),
  // Create doctor (protected)
  create: protectedProcedure.input(
    z7.object({
      name: z7.string().min(1, "\u0627\u0644\u0627\u0633\u0645 \u0645\u0637\u0644\u0648\u0628"),
      slug: z7.string().min(1, "\u0627\u0644\u0631\u0627\u0628\u0637 \u0645\u0637\u0644\u0648\u0628"),
      specialty: z7.string().min(1, "\u0627\u0644\u062A\u062E\u0635\u0635 \u0645\u0637\u0644\u0648\u0628"),
      image: z7.string().optional(),
      bio: z7.string().optional(),
      experience: z7.string().optional(),
      languages: z7.string().optional(),
      consultationFee: z7.string().optional(),
      procedures: z7.string().optional(),
      isVisiting: z7.enum(["yes", "no"]).default("no"),
      available: z7.enum(["yes", "no"]).default("yes")
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const doctor = await db.insert(doctors).values(input);
    serverCache.invalidate(CacheKeys.doctorsList());
    return { success: true, id: Number(doctor[0].insertId) };
  }),
  // Update doctor (protected)
  update: protectedProcedure.input(
    z7.object({
      id: z7.number(),
      name: z7.string().min(1, "\u0627\u0644\u0627\u0633\u0645 \u0645\u0637\u0644\u0648\u0628"),
      slug: z7.string().min(1, "\u0627\u0644\u0631\u0627\u0628\u0637 \u0645\u0637\u0644\u0648\u0628"),
      specialty: z7.string().min(1, "\u0627\u0644\u062A\u062E\u0635\u0635 \u0645\u0637\u0644\u0648\u0628"),
      image: z7.string().optional(),
      bio: z7.string().optional(),
      experience: z7.string().optional(),
      languages: z7.string().optional(),
      consultationFee: z7.string().optional(),
      procedures: z7.string().optional(),
      isVisiting: z7.enum(["yes", "no"]),
      available: z7.enum(["yes", "no"])
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(doctors).set(data).where(eq8(doctors.id, id));
    serverCache.invalidate(CacheKeys.doctorsList());
    return { success: true };
  }),
  // Delete doctor (protected)
  delete: protectedProcedure.input(z7.object({ id: z7.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(doctors).where(eq8(doctors.id, input.id));
    serverCache.invalidate(CacheKeys.doctorsList());
    return { success: true };
  }),
  // Toggle doctor availability (protected)
  toggleAvailability: protectedProcedure.input(
    z7.object({
      id: z7.number(),
      available: z7.enum(["yes", "no"])
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(doctors).set({ available: input.available }).where(eq8(doctors.id, input.id));
    serverCache.invalidate(CacheKeys.doctorsList());
    return { success: true };
  })
});

// server/routers/users.ts
init_schema();
import { z as z8 } from "zod";
import { eq as eq9 } from "drizzle-orm";
init_db();
import { TRPCError as TRPCError3 } from "@trpc/server";
import bcrypt from "bcryptjs";
var userInputSchema = z8.object({
  username: z8.string().min(3, "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 3 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
  password: z8.string().min(6, "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 6 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644").optional(),
  name: z8.string().optional(),
  email: z8.string().email("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D").optional(),
  role: z8.enum(["user", "admin", "manager", "staff", "viewer"]).default("user"),
  isActive: z8.enum(["yes", "no"]).default("yes")
});
var adminOnlyProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError3({
      code: "FORBIDDEN",
      message: "\u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0645\u0633\u0624\u0648\u0644\u0627\u064B \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0647\u0630\u0647 \u0627\u0644\u0645\u064A\u0632\u0629"
    });
  }
  return next({ ctx });
});
var usersRouter = router({
  // Get active users list (for task assignment)
  getActiveUsers: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const activeUsers = await db.select({
      id: users.id,
      name: users.name,
      username: users.username
    }).from(users).where(eq9(users.isActive, "yes"));
    return activeUsers;
  }),
  // Get all users (admin only)
  getAll: adminOnlyProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      loginMethod: users.loginMethod,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn
    }).from(users);
    return allUsers;
  }),
  // Get user by ID (admin only)
  getById: adminOnlyProcedure.input(z8.object({ id: z8.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const user = await db.select({
      id: users.id,
      username: users.username,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      loginMethod: users.loginMethod,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn
    }).from(users).where(eq9(users.id, input.id)).limit(1);
    if (user.length === 0) {
      throw new TRPCError3({ code: "NOT_FOUND", message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    }
    return user[0];
  }),
  // Create new user (admin only)
  create: adminOnlyProcedure.input(userInputSchema).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const existingUser = await db.select().from(users).where(eq9(users.username, input.username)).limit(1);
    if (existingUser.length > 0) {
      throw new TRPCError3({ code: "CONFLICT", message: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0648\u062C\u0648\u062F \u0628\u0627\u0644\u0641\u0639\u0644" });
    }
    const hashedPassword = await bcrypt.hash(input.password || "123456", 10);
    await db.insert(users).values({
      username: input.username,
      password: hashedPassword,
      name: input.name,
      email: input.email,
      role: input.role,
      isActive: input.isActive,
      loginMethod: "manual"
    });
    return { success: true };
  }),
  // Update user (admin only)
  update: adminOnlyProcedure.input(z8.object({
    id: z8.number(),
    ...userInputSchema.partial().shape
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const { id, password, ...data } = input;
    if (id === ctx.user.id && (data.role || data.isActive)) {
      throw new TRPCError3({
        code: "FORBIDDEN",
        message: "\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062A\u063A\u064A\u064A\u0631 \u062F\u0648\u0631\u0643 \u0623\u0648 \u062D\u0627\u0644\u062A\u0643 \u0627\u0644\u062E\u0627\u0635\u0629"
      });
    }
    const updateData = { ...data };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    await db.update(users).set(updateData).where(eq9(users.id, id));
    return { success: true };
  }),
  // Delete user (admin only)
  delete: adminOnlyProcedure.input(z8.object({ id: z8.number() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    if (input.id === ctx.user.id) {
      throw new TRPCError3({
        code: "FORBIDDEN",
        message: "\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062D\u0630\u0641 \u062D\u0633\u0627\u0628\u0643 \u0627\u0644\u062E\u0627\u0635"
      });
    }
    await db.delete(users).where(eq9(users.id, input.id));
    return { success: true };
  }),
  // Toggle user active status (admin only)
  toggleActive: adminOnlyProcedure.input(z8.object({ id: z8.number() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    if (input.id === ctx.user.id) {
      throw new TRPCError3({
        code: "FORBIDDEN",
        message: "\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062A\u0639\u0637\u064A\u0644 \u062D\u0633\u0627\u0628\u0643 \u0627\u0644\u062E\u0627\u0635"
      });
    }
    const user = await db.select().from(users).where(eq9(users.id, input.id)).limit(1);
    if (user.length === 0) {
      throw new TRPCError3({ code: "NOT_FOUND", message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    }
    const newStatus = user[0].isActive === "yes" ? "no" : "yes";
    await db.update(users).set({ isActive: newStatus }).where(eq9(users.id, input.id));
    return { success: true, newStatus };
  })
});

// server/routers/reports.ts
import { z as z9 } from "zod";
init_db();
init_schema();
import { and as and5, count, eq as eq10, gte, lte, sql as sql3 } from "drizzle-orm";
var dateRangeSchema = z9.object({
  startDate: z9.string().optional(),
  endDate: z9.string().optional()
});
var reportsRouter = router({
  /**
   * Get bookings and appointments report
   * Returns statistics for appointments, camp registrations, and offer leads
   */
  getBookingsReport: protectedProcedure.input(dateRangeSchema).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { startDate, endDate } = input;
    const dateFilter = startDate && endDate ? and5(
      gte(sql3`createdAt`, new Date(startDate)),
      lte(sql3`createdAt`, new Date(endDate))
    ) : void 0;
    const appointmentsStats = await db.select({
      total: count(),
      status: appointments.status
    }).from(appointments).where(dateFilter).groupBy(appointments.status);
    const campRegistrationsStats = await db.select({
      total: count(),
      status: campRegistrations.status
    }).from(campRegistrations).where(dateFilter).groupBy(campRegistrations.status);
    const offerLeadsStats = await db.select({
      total: count(),
      status: offerLeads.status
    }).from(offerLeads).where(dateFilter).groupBy(offerLeads.status);
    const totalAppointments = appointmentsStats.reduce((sum, stat) => sum + stat.total, 0);
    const totalCampRegistrations = campRegistrationsStats.reduce((sum, stat) => sum + stat.total, 0);
    const totalOfferLeads = offerLeadsStats.reduce((sum, stat) => sum + stat.total, 0);
    return {
      appointments: {
        total: totalAppointments,
        byStatus: appointmentsStats
      },
      campRegistrations: {
        total: totalCampRegistrations,
        byStatus: campRegistrationsStats
      },
      offerLeads: {
        total: totalOfferLeads,
        byStatus: offerLeadsStats
      },
      grandTotal: totalAppointments + totalCampRegistrations + totalOfferLeads
    };
  }),
  /**
   * Get new leads report
   * Returns statistics for new customer registrations
   */
  getNewLeadsReport: protectedProcedure.input(dateRangeSchema).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { startDate, endDate } = input;
    const dateFilter = startDate && endDate ? and5(
      gte(sql3`createdAt`, new Date(startDate)),
      lte(sql3`createdAt`, new Date(endDate))
    ) : void 0;
    const leadsBySource = await db.select({
      total: count(),
      source: leads.source
    }).from(leads).where(dateFilter).groupBy(leads.source);
    const leadsByStatus = await db.select({
      total: count(),
      status: leads.status
    }).from(leads).where(dateFilter).groupBy(leads.status);
    const appointmentsBySource = await db.select({
      total: count(),
      source: appointments.source
    }).from(appointments).where(dateFilter).groupBy(appointments.source);
    const campRegistrationsBySource = await db.select({
      total: count(),
      source: campRegistrations.source
    }).from(campRegistrations).where(dateFilter).groupBy(campRegistrations.source);
    const offerLeadsBySource = await db.select({
      total: count(),
      source: offerLeads.source
    }).from(offerLeads).where(dateFilter).groupBy(offerLeads.source);
    const allSources = /* @__PURE__ */ new Map();
    [...leadsBySource, ...appointmentsBySource, ...campRegistrationsBySource, ...offerLeadsBySource].forEach((item) => {
      const source = item.source || "direct";
      allSources.set(source, (allSources.get(source) || 0) + item.total);
    });
    const sourceStats = Array.from(allSources.entries()).map(([source, total]) => ({
      source,
      total
    }));
    const totalLeads = leadsByStatus.reduce((sum, stat) => sum + stat.total, 0);
    return {
      totalLeads,
      bySource: sourceStats,
      byStatus: leadsByStatus
    };
  }),
  /**
   * Get conversion rates report
   * Returns conversion statistics from leads to bookings
   */
  getConversionRatesReport: protectedProcedure.input(dateRangeSchema).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { startDate, endDate } = input;
    const dateFilter = startDate && endDate ? and5(
      gte(sql3`createdAt`, new Date(startDate)),
      lte(sql3`createdAt`, new Date(endDate))
    ) : void 0;
    const [totalLeadsResult] = await db.select({ count: count() }).from(leads).where(dateFilter);
    const [bookedLeadsResult] = await db.select({ count: count() }).from(leads).where(
      dateFilter ? and5(dateFilter, eq10(leads.status, "booked")) : eq10(leads.status, "booked")
    );
    const [totalAppointmentsResult] = await db.select({ count: count() }).from(appointments).where(dateFilter);
    const [confirmedAppointmentsResult] = await db.select({ count: count() }).from(appointments).where(
      dateFilter ? and5(
        dateFilter,
        sql3`${appointments.status} IN ('confirmed', 'completed')`
      ) : sql3`${appointments.status} IN ('confirmed', 'completed')`
    );
    const [totalOfferLeadsResult] = await db.select({ count: count() }).from(offerLeads).where(dateFilter);
    const [bookedOfferLeadsResult] = await db.select({ count: count() }).from(offerLeads).where(
      dateFilter ? and5(dateFilter, eq10(offerLeads.status, "booked")) : eq10(offerLeads.status, "booked")
    );
    const [totalCampRegistrationsResult] = await db.select({ count: count() }).from(campRegistrations).where(dateFilter);
    const [confirmedCampRegistrationsResult] = await db.select({ count: count() }).from(campRegistrations).where(
      dateFilter ? and5(
        dateFilter,
        sql3`${campRegistrations.status} IN ('confirmed', 'attended')`
      ) : sql3`${campRegistrations.status} IN ('confirmed', 'attended')`
    );
    const totalLeads = totalLeadsResult.count;
    const bookedLeads = bookedLeadsResult.count;
    const totalAppointments = totalAppointmentsResult.count;
    const confirmedAppointments = confirmedAppointmentsResult.count;
    const totalOfferLeads = totalOfferLeadsResult.count;
    const bookedOfferLeads = bookedOfferLeadsResult.count;
    const totalCampRegistrations = totalCampRegistrationsResult.count;
    const confirmedCampRegistrations = confirmedCampRegistrationsResult.count;
    const leadsConversionRate = totalLeads > 0 ? bookedLeads / totalLeads * 100 : 0;
    const appointmentsConversionRate = totalAppointments > 0 ? confirmedAppointments / totalAppointments * 100 : 0;
    const offerLeadsConversionRate = totalOfferLeads > 0 ? bookedOfferLeads / totalOfferLeads * 100 : 0;
    const campRegistrationsConversionRate = totalCampRegistrations > 0 ? confirmedCampRegistrations / totalCampRegistrations * 100 : 0;
    const totalRequests = totalLeads + totalAppointments + totalOfferLeads + totalCampRegistrations;
    const totalConverted = bookedLeads + confirmedAppointments + bookedOfferLeads + confirmedCampRegistrations;
    const overallConversionRate = totalRequests > 0 ? totalConverted / totalRequests * 100 : 0;
    return {
      overall: {
        totalRequests,
        totalConverted,
        conversionRate: overallConversionRate
      },
      leads: {
        total: totalLeads,
        converted: bookedLeads,
        conversionRate: leadsConversionRate
      },
      appointments: {
        total: totalAppointments,
        converted: confirmedAppointments,
        conversionRate: appointmentsConversionRate
      },
      offerLeads: {
        total: totalOfferLeads,
        converted: bookedOfferLeads,
        conversionRate: offerLeadsConversionRate
      },
      campRegistrations: {
        total: totalCampRegistrations,
        converted: confirmedCampRegistrations,
        conversionRate: campRegistrationsConversionRate
      }
    };
  }),
  /**
   * Get revenue report (placeholder - will be implemented when payment integration is added)
   * Returns revenue and profit statistics
   */
  getRevenueReport: protectedProcedure.input(dateRangeSchema).query(async ({ input }) => {
    return {
      totalRevenue: 0,
      totalProfit: 0,
      byService: [],
      byMonth: [],
      note: "Revenue tracking will be available after payment integration"
    };
  }),
  /**
   * Get detailed bookings list for export
   */
  getDetailedBookingsList: protectedProcedure.input(dateRangeSchema).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { startDate, endDate } = input;
    const dateFilter = startDate && endDate ? and5(
      gte(sql3`createdAt`, new Date(startDate)),
      lte(sql3`createdAt`, new Date(endDate))
    ) : void 0;
    const appointmentsList = await db.select({
      id: appointments.id,
      type: sql3`'موعد طبيب'`,
      fullName: appointments.fullName,
      phone: appointments.phone,
      email: appointments.email,
      service: doctors.name,
      status: appointments.status,
      source: appointments.source,
      createdAt: appointments.createdAt
    }).from(appointments).leftJoin(doctors, eq10(appointments.doctorId, doctors.id)).where(dateFilter);
    const campRegistrationsList = await db.select({
      id: campRegistrations.id,
      type: sql3`'تسجيل مخيم'`,
      fullName: campRegistrations.fullName,
      phone: campRegistrations.phone,
      email: campRegistrations.email,
      service: camps.name,
      status: campRegistrations.status,
      source: campRegistrations.source,
      createdAt: campRegistrations.createdAt
    }).from(campRegistrations).leftJoin(camps, eq10(campRegistrations.campId, camps.id)).where(dateFilter);
    const offerLeadsList = await db.select({
      id: offerLeads.id,
      type: sql3`'طلب عرض'`,
      fullName: offerLeads.fullName,
      phone: offerLeads.phone,
      email: offerLeads.email,
      service: offers.title,
      status: offerLeads.status,
      source: offerLeads.source,
      createdAt: offerLeads.createdAt
    }).from(offerLeads).leftJoin(offers, eq10(offerLeads.offerId, offers.id)).where(dateFilter);
    const allBookings = [
      ...appointmentsList,
      ...campRegistrationsList,
      ...offerLeadsList
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return allBookings;
  })
});

// server/routers/campaigns.ts
import { z as z10 } from "zod";

// server/db/campaigns.ts
init_schema();
init_db();
import { eq as eq11, desc as desc6, and as and6, sql as sql4, or as or2, like as like2 } from "drizzle-orm";
async function getCampaigns(filters) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let conditions = [];
  if (filters?.status) {
    conditions.push(eq11(campaigns.status, filters.status));
  }
  if (filters?.type) {
    conditions.push(eq11(campaigns.type, filters.type));
  }
  if (filters?.search) {
    conditions.push(
      or2(
        like2(campaigns.name, `%${filters.search}%`),
        like2(campaigns.description, `%${filters.search}%`)
      )
    );
  }
  const query = conditions.length > 0 ? db.select().from(campaigns).where(and6(...conditions)).orderBy(desc6(campaigns.createdAt)) : db.select().from(campaigns).orderBy(desc6(campaigns.createdAt));
  return await query;
}
async function getCampaignById2(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(campaigns).where(eq11(campaigns.id, id)).limit(1);
  return result[0];
}
async function getCampaignBySlug2(slug) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(campaigns).where(eq11(campaigns.slug, slug)).limit(1);
  return result[0];
}
async function createCampaign2(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(campaigns).values(data);
  return result;
}
async function updateCampaign2(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(campaigns).set(data).where(eq11(campaigns.id, id));
  return await getCampaignById2(id);
}
async function deleteCampaign(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(campaigns).where(eq11(campaigns.id, id));
  return { success: true };
}
async function getCampaignStats2(campaignId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const leadsResult = await db.select({ count: sql4`count(*)` }).from(leads).where(eq11(leads.campaignId, campaignId));
  const totalLeads = Number(leadsResult[0]?.count || 0);
  const appointmentsResult = await db.select({ count: sql4`count(*)` }).from(appointments).where(eq11(appointments.campaignId, campaignId));
  const totalAppointments = Number(appointmentsResult[0]?.count || 0);
  const conversionRate = totalLeads > 0 ? totalAppointments / totalLeads * 100 : 0;
  const leadsByStatus = await db.select({
    status: leads.status,
    count: sql4`count(*)`
  }).from(leads).where(eq11(leads.campaignId, campaignId)).groupBy(leads.status);
  const appointmentsByStatus = await db.select({
    status: appointments.status,
    count: sql4`count(*)`
  }).from(appointments).where(eq11(appointments.campaignId, campaignId)).groupBy(appointments.status);
  return {
    totalLeads,
    totalAppointments,
    conversionRate: Math.round(conversionRate * 100) / 100,
    leadsByStatus: leadsByStatus.map((item) => ({
      status: item.status,
      count: Number(item.count)
    })),
    appointmentsByStatus: appointmentsByStatus.map((item) => ({
      status: item.status,
      count: Number(item.count)
    }))
  };
}
async function getCampaignLinkedOffers(campaignId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select({
    linkId: campaignOffers.id,
    offerId: campaignOffers.offerId,
    offerTitle: offers.title,
    offerSlug: offers.slug,
    offerIsActive: offers.isActive,
    linkedAt: campaignOffers.createdAt
  }).from(campaignOffers).innerJoin(offers, eq11(campaignOffers.offerId, offers.id)).where(eq11(campaignOffers.campaignId, campaignId)).orderBy(desc6(campaignOffers.createdAt));
  return result;
}
async function getCampaignLinkedCamps(campaignId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select({
    linkId: campaignCamps.id,
    campId: campaignCamps.campId,
    campName: camps.name,
    campSlug: camps.slug,
    campIsActive: camps.isActive,
    linkedAt: campaignCamps.createdAt
  }).from(campaignCamps).innerJoin(camps, eq11(campaignCamps.campId, camps.id)).where(eq11(campaignCamps.campaignId, campaignId)).orderBy(desc6(campaignCamps.createdAt));
  return result;
}
async function getCampaignLinkedDoctors(campaignId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select({
    linkId: campaignDoctors.id,
    doctorId: campaignDoctors.doctorId,
    doctorName: doctors.name,
    doctorSlug: doctors.slug,
    doctorSpecialty: doctors.specialty,
    doctorAvailable: doctors.available,
    linkedAt: campaignDoctors.createdAt
  }).from(campaignDoctors).innerJoin(doctors, eq11(campaignDoctors.doctorId, doctors.id)).where(eq11(campaignDoctors.campaignId, campaignId)).orderBy(desc6(campaignDoctors.createdAt));
  return result;
}
async function linkOffersToCampaign(campaignId, offerIds) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(campaignOffers).where(eq11(campaignOffers.campaignId, campaignId));
  if (offerIds.length > 0) {
    await db.insert(campaignOffers).values(
      offerIds.map((offerId) => ({ campaignId, offerId }))
    );
  }
  return { success: true };
}
async function linkCampsToCampaign(campaignId, campIds) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(campaignCamps).where(eq11(campaignCamps.campaignId, campaignId));
  if (campIds.length > 0) {
    await db.insert(campaignCamps).values(
      campIds.map((campId) => ({ campaignId, campId }))
    );
  }
  return { success: true };
}
async function linkDoctorsToCampaign(campaignId, doctorIds) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(campaignDoctors).where(eq11(campaignDoctors.campaignId, campaignId));
  if (doctorIds.length > 0) {
    await db.insert(campaignDoctors).values(
      doctorIds.map((doctorId) => ({ campaignId, doctorId }))
    );
  }
  return { success: true };
}
async function getCampaignAllLinks(campaignId) {
  const [linkedOffers, linkedCamps, linkedDoctors] = await Promise.all([
    getCampaignLinkedOffers(campaignId),
    getCampaignLinkedCamps(campaignId),
    getCampaignLinkedDoctors(campaignId)
  ]);
  return { linkedOffers, linkedCamps, linkedDoctors };
}
async function getCampaignsOverview() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const totalResult = await db.select({ count: sql4`count(*)` }).from(campaigns);
  const totalCampaigns = Number(totalResult[0]?.count || 0);
  const activeResult = await db.select({ count: sql4`count(*)` }).from(campaigns).where(eq11(campaigns.status, "active"));
  const activeCampaigns = Number(activeResult[0]?.count || 0);
  const budgetResult = await db.select({ total: sql4`SUM(plannedBudget)` }).from(campaigns);
  const totalPlannedBudget = Number(budgetResult[0]?.total || 0);
  const actualBudgetResult = await db.select({ total: sql4`SUM(actualBudget)` }).from(campaigns);
  const totalActualBudget = Number(actualBudgetResult[0]?.total || 0);
  return {
    totalCampaigns,
    activeCampaigns,
    totalPlannedBudget,
    totalActualBudget
  };
}

// server/routers/campaigns.ts
var campaignTypeSchema = z10.enum(["digital", "field", "awareness", "mixed"]);
var campaignStatusSchema = z10.enum(["draft", "active", "paused", "completed", "cancelled"]);
var createCampaignSchema = z10.object({
  name: z10.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u062D\u0645\u0644\u0629 \u0645\u0637\u0644\u0648\u0628"),
  slug: z10.string().min(1, "\u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u062E\u062A\u0635\u0631 \u0645\u0637\u0644\u0648\u0628"),
  description: z10.string().optional(),
  type: campaignTypeSchema,
  status: campaignStatusSchema.optional(),
  plannedBudget: z10.number().optional(),
  actualBudget: z10.number().optional(),
  currency: z10.string().optional(),
  startDate: z10.date().optional(),
  endDate: z10.date().optional(),
  platforms: z10.string().optional(),
  // JSON string
  goals: z10.string().optional(),
  // JSON string
  targetLeads: z10.number().optional(),
  targetBookings: z10.number().optional(),
  targetROI: z10.number().optional(),
  targetRevenue: z10.number().optional(),
  kpis: z10.string().optional(),
  notes: z10.string().optional(),
  teamLeaderId: z10.number().optional(),
  teamMembers: z10.string().optional(),
  // JSON string
  metaPixelId: z10.string().optional(),
  metaAccessToken: z10.string().optional(),
  whatsappEnabled: z10.boolean().optional(),
  whatsappWelcomeMessage: z10.string().optional()
});
var updateCampaignSchema = createCampaignSchema.partial().extend({
  id: z10.number(),
  targetRevenue: z10.number().optional(),
  kpis: z10.string().optional(),
  notes: z10.string().optional()
});
var campaignsRouter = router({
  // Get all campaigns with filters
  list: protectedProcedure.input(
    z10.object({
      status: z10.string().optional(),
      type: z10.string().optional(),
      search: z10.string().optional()
    }).optional()
  ).query(async ({ input }) => {
    return await getCampaigns(input);
  }),
  // Get campaign by ID
  getById: protectedProcedure.input(z10.object({ id: z10.number() })).query(async ({ input }) => {
    return await getCampaignById2(input.id);
  }),
  // Get campaign by slug
  getBySlug: protectedProcedure.input(z10.object({ slug: z10.string() })).query(async ({ input }) => {
    return await getCampaignBySlug2(input.slug);
  }),
  // Create campaign
  create: protectedProcedure.input(createCampaignSchema).mutation(async ({ input }) => {
    return await createCampaign2(input);
  }),
  // Update campaign
  update: protectedProcedure.input(updateCampaignSchema).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return await updateCampaign2(id, data);
  }),
  // Delete campaign
  delete: protectedProcedure.input(z10.object({ id: z10.number() })).mutation(async ({ input }) => {
    return await deleteCampaign(input.id);
  }),
  // Get campaign statistics
  getStats: protectedProcedure.input(z10.object({ campaignId: z10.number() })).query(async ({ input }) => {
    return await getCampaignStats2(input.campaignId);
  }),
  // Get campaigns overview
  getOverview: protectedProcedure.query(async () => {
    return await getCampaignsOverview();
  }),
  // Get all campaign links (offers, camps, doctors)
  getLinks: protectedProcedure.input(z10.object({ campaignId: z10.number() })).query(async ({ input }) => {
    return await getCampaignAllLinks(input.campaignId);
  }),
  // Link offers to campaign
  linkOffers: protectedProcedure.input(z10.object({
    campaignId: z10.number(),
    offerIds: z10.array(z10.number())
  })).mutation(async ({ input }) => {
    return await linkOffersToCampaign(input.campaignId, input.offerIds);
  }),
  // Link camps to campaign
  linkCamps: protectedProcedure.input(z10.object({
    campaignId: z10.number(),
    campIds: z10.array(z10.number())
  })).mutation(async ({ input }) => {
    return await linkCampsToCampaign(input.campaignId, input.campIds);
  }),
  // Link doctors to campaign
  linkDoctors: protectedProcedure.input(z10.object({
    campaignId: z10.number(),
    doctorIds: z10.array(z10.number())
  })).mutation(async ({ input }) => {
    return await linkDoctorsToCampaign(input.campaignId, input.doctorIds);
  })
});

// server/routers/tasks.ts
import { z as z11 } from "zod";
init_tasks();
var tasksRouter = router({
  // Get all tasks with filters
  list: protectedProcedure.input(z11.object({
    status: z11.string().optional(),
    priority: z11.string().optional(),
    category: z11.string().optional(),
    assignedTo: z11.number().optional(),
    campaignId: z11.number().optional(),
    search: z11.string().optional()
  }).optional()).query(async ({ input }) => {
    return await getAllTasks(input);
  }),
  // Get single task by ID
  getById: protectedProcedure.input(z11.object({ id: z11.number() })).query(async ({ input }) => {
    return await getTaskById(input.id);
  }),
  // Create new task
  create: protectedProcedure.input(z11.object({
    title: z11.string().min(1),
    description: z11.string().optional(),
    priority: z11.enum(["low", "medium", "high", "urgent"]).default("medium"),
    status: z11.enum(["todo", "in_progress", "review", "completed", "cancelled"]).default("todo"),
    category: z11.enum(["content", "design", "ads", "seo", "social_media", "analytics", "other"]).default("other"),
    assignedTo: z11.number().optional(),
    campaignId: z11.number().optional(),
    projectId: z11.number().optional(),
    teamId: z11.number().optional(),
    dueDate: z11.date().optional(),
    estimatedHours: z11.number().optional(),
    tags: z11.string().optional()
  })).mutation(async ({ input, ctx }) => {
    return await createTask({
      ...input,
      createdBy: ctx.user.id
    });
  }),
  // Update task
  update: protectedProcedure.input(z11.object({
    id: z11.number(),
    title: z11.string().min(1).optional(),
    description: z11.string().optional(),
    priority: z11.enum(["low", "medium", "high", "urgent"]).optional(),
    status: z11.enum(["todo", "in_progress", "review", "completed", "cancelled"]).optional(),
    category: z11.enum(["content", "design", "ads", "seo", "social_media", "analytics", "other"]).optional(),
    assignedTo: z11.number().nullable().optional(),
    campaignId: z11.number().nullable().optional(),
    dueDate: z11.date().nullable().optional(),
    completedAt: z11.date().nullable().optional(),
    estimatedHours: z11.number().nullable().optional(),
    actualHours: z11.number().nullable().optional(),
    tags: z11.string().nullable().optional()
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return await updateTask(id, data);
  }),
  // Delete task
  delete: protectedProcedure.input(z11.object({ id: z11.number() })).mutation(async ({ input }) => {
    return await deleteTask(input.id);
  }),
  // Update task status (for drag & drop)
  updateStatus: protectedProcedure.input(z11.object({
    id: z11.number(),
    status: z11.enum(["todo", "in_progress", "review", "completed", "cancelled"])
  })).mutation(async ({ input }) => {
    return await updateTaskStatus(input.id, input.status);
  }),
  // Get tasks statistics
  stats: protectedProcedure.query(async () => {
    return await getTasksStats();
  }),
  // Get my tasks
  myTasks: protectedProcedure.query(async ({ ctx }) => {
    return await getTasksByUser(ctx.user.id);
  }),
  // Get overdue tasks
  overdue: protectedProcedure.query(async () => {
    return await getOverdueTasks();
  }),
  // ============ COMMENTS ============
  // Get task comments
  getComments: protectedProcedure.input(z11.object({ taskId: z11.number() })).query(async ({ input }) => {
    return await getTaskComments(input.taskId);
  }),
  // Add comment
  addComment: protectedProcedure.input(z11.object({
    taskId: z11.number(),
    content: z11.string().min(1)
  })).mutation(async ({ input, ctx }) => {
    return await addTaskComment({
      taskId: input.taskId,
      userId: ctx.user.id,
      content: input.content
    });
  }),
  // Delete comment
  deleteComment: protectedProcedure.input(z11.object({ id: z11.number() })).mutation(async ({ input }) => {
    return await deleteTaskComment(input.id);
  }),
  // ============ ATTACHMENTS ============
  // Get task attachments
  getAttachments: protectedProcedure.input(z11.object({ taskId: z11.number() })).query(async ({ input }) => {
    return await getTaskAttachments(input.taskId);
  }),
  // Add attachment
  addAttachment: protectedProcedure.input(z11.object({
    taskId: z11.number(),
    fileName: z11.string(),
    fileUrl: z11.string(),
    fileType: z11.string().optional(),
    fileSize: z11.number().optional(),
    attachmentType: z11.enum(["deliverable", "reference", "other"]).default("other")
  })).mutation(async ({ input, ctx }) => {
    return await addTaskAttachment({
      taskId: input.taskId,
      userId: ctx.user.id,
      fileName: input.fileName,
      fileUrl: input.fileUrl,
      fileType: input.fileType,
      fileSize: input.fileSize,
      attachmentType: input.attachmentType
    });
  }),
  // Delete attachment
  deleteAttachment: protectedProcedure.input(z11.object({ id: z11.number() })).mutation(async ({ input }) => {
    return await deleteTaskAttachment(input.id);
  })
});

// server/routers/whatsapp.ts
import { z as z12 } from "zod";
init_db();
init_whatsappCloudAPI();
var whatsappRouter = router({
  // WhatsApp Cloud API Status
  connection: router({
    status: protectedProcedure.query(async () => {
      return getWhatsAppAPIStatus();
    })
  }),
  // Conversations
  conversations: router({
    list: protectedProcedure.query(async () => {
      return await getAllWhatsAppConversations();
    }),
    getById: protectedProcedure.input(z12.object({ id: z12.number() })).query(async ({ input }) => {
      return await getWhatsAppConversationById(input.id);
    }),
    search: protectedProcedure.input(z12.object({ searchTerm: z12.string() })).query(async ({ input }) => {
      return await searchWhatsAppConversations(input.searchTerm);
    }),
    unreadCount: protectedProcedure.query(async () => {
      return await getUnreadWhatsAppConversationsCount();
    }),
    create: protectedProcedure.input(
      z12.object({
        customerName: z12.string(),
        customerPhone: z12.string(),
        leadId: z12.number().optional(),
        appointmentId: z12.number().optional(),
        offerLeadId: z12.number().optional(),
        campRegistrationId: z12.number().optional()
      })
    ).mutation(async ({ input }) => {
      return await createWhatsAppConversation({
        phoneNumber: input.customerPhone,
        customerName: input.customerName,
        lastMessageAt: /* @__PURE__ */ new Date(),
        unreadCount: 0,
        isImportant: 0,
        isArchived: 0,
        leadId: input.leadId,
        appointmentId: input.appointmentId,
        offerLeadId: input.offerLeadId,
        campRegistrationId: input.campRegistrationId
      });
    }),
    update: protectedProcedure.input(
      z12.object({
        id: z12.number(),
        customerName: z12.string().optional(),
        unreadCount: z12.number().optional(),
        important: z12.boolean().optional(),
        archived: z12.boolean().optional()
      })
    ).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await updateWhatsAppConversation(id, data);
    })
  }),
  // Messages
  messages: router({
    listByConversation: protectedProcedure.input(z12.object({ conversationId: z12.number() })).query(async ({ input }) => {
      return await getWhatsAppMessagesByConversation(input.conversationId);
    }),
    send: protectedProcedure.input(
      z12.object({
        conversationId: z12.number(),
        content: z12.string(),
        messageType: z12.enum(["text", "image", "document", "audio", "video"]).default("text"),
        mediaUrl: z12.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const conversation = await getWhatsAppConversationById(input.conversationId);
      if (!conversation) {
        throw new Error("\u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629");
      }
      let whatsappMessageId;
      let sendStatus = "sent";
      let errorMsg;
      try {
        const result = await sendWhatsAppTextMessage(
          conversation.phoneNumber,
          input.content
        );
        if (result.success) {
          whatsappMessageId = result.messageId;
        } else {
          sendStatus = "failed";
          errorMsg = result.error;
          console.error("[WhatsApp] Failed to send:", result.error);
        }
      } catch (error) {
        sendStatus = "failed";
        errorMsg = error.message;
        console.error("[WhatsApp] Exception sending message:", error);
      }
      const message = await createWhatsAppMessage({
        conversationId: input.conversationId,
        direction: "outbound",
        content: input.content,
        messageType: input.messageType,
        status: sendStatus,
        whatsappMessageId: whatsappMessageId || null,
        sentBy: ctx.user.id,
        sentAt: /* @__PURE__ */ new Date()
      });
      await updateWhatsAppConversation(input.conversationId, {
        lastMessage: input.content.substring(0, 100),
        lastMessageAt: /* @__PURE__ */ new Date()
      });
      if (sendStatus === "failed") {
        throw new Error(errorMsg || "\u0641\u0634\u0644 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628");
      }
      return message;
    }),
    // Send a new message to a phone number (creates conversation if needed)
    sendDirect: protectedProcedure.input(
      z12.object({
        phone: z12.string(),
        content: z12.string(),
        customerName: z12.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const formattedPhone = formatPhoneNumber(input.phone);
      let conversation = await getWhatsAppConversationByPhone(formattedPhone);
      if (!conversation) {
        await createWhatsAppConversation({
          phoneNumber: formattedPhone,
          customerName: input.customerName || null,
          lastMessageAt: /* @__PURE__ */ new Date(),
          unreadCount: 0,
          isImportant: 0,
          isArchived: 0
        });
        conversation = await getWhatsAppConversationByPhone(formattedPhone);
        if (!conversation) {
          throw new Error("\u0641\u0634\u0644 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629");
        }
      }
      const result = await sendWhatsAppTextMessage(formattedPhone, input.content);
      if (!result.success) {
        throw new Error(result.error || "\u0641\u0634\u0644 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629");
      }
      const message = await createWhatsAppMessage({
        conversationId: conversation.id,
        direction: "outbound",
        content: input.content,
        messageType: "text",
        status: "sent",
        whatsappMessageId: result.messageId || null,
        sentBy: ctx.user.id,
        sentAt: /* @__PURE__ */ new Date()
      });
      await updateWhatsAppConversation(conversation.id, {
        lastMessage: input.content.substring(0, 100),
        lastMessageAt: /* @__PURE__ */ new Date(),
        customerName: input.customerName || conversation.customerName
      });
      return {
        success: true,
        messageId: result.messageId,
        conversationId: conversation.id
      };
    }),
    // Send template message
    sendTemplate: protectedProcedure.input(
      z12.object({
        phone: z12.string(),
        templateName: z12.string(),
        languageCode: z12.string().default("ar"),
        components: z12.array(z12.any()).optional(),
        customerName: z12.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const formattedPhone = formatPhoneNumber(input.phone);
      const result = await sendWhatsAppTemplateMessage(
        formattedPhone,
        {
          templateName: input.templateName,
          languageCode: input.languageCode,
          components: input.components || []
        }
      );
      if (!result.success) {
        throw new Error(result.error || "\u0641\u0634\u0644 \u0625\u0631\u0633\u0627\u0644 \u0642\u0627\u0644\u0628 \u0627\u0644\u0631\u0633\u0627\u0644\u0629");
      }
      let conversation = await getWhatsAppConversationByPhone(formattedPhone);
      if (!conversation) {
        await createWhatsAppConversation({
          phoneNumber: formattedPhone,
          customerName: input.customerName || null,
          lastMessageAt: /* @__PURE__ */ new Date(),
          unreadCount: 0,
          isImportant: 0,
          isArchived: 0
        });
        conversation = await getWhatsAppConversationByPhone(formattedPhone);
      }
      if (conversation) {
        await createWhatsAppMessage({
          conversationId: conversation.id,
          direction: "outbound",
          content: `[\u0642\u0627\u0644\u0628: ${input.templateName}]`,
          messageType: "text",
          status: "sent",
          whatsappMessageId: result.messageId || null,
          sentBy: ctx.user.id,
          isAutomated: 1,
          sentAt: /* @__PURE__ */ new Date()
        });
        await updateWhatsAppConversation(conversation.id, {
          lastMessage: `[\u0642\u0627\u0644\u0628: ${input.templateName}]`,
          lastMessageAt: /* @__PURE__ */ new Date()
        });
      }
      return { success: true, messageId: result.messageId };
    }),
    markAsRead: protectedProcedure.input(z12.object({ messageId: z12.number() })).mutation(async ({ input }) => {
      return await updateWhatsAppMessage(input.messageId, {
        readAt: /* @__PURE__ */ new Date()
      });
    })
  }),
  // Templates (local templates in database)
  templates: router({
    list: protectedProcedure.query(async () => {
      return await getAllWhatsAppTemplates();
    }),
    getById: protectedProcedure.input(z12.object({ id: z12.number() })).query(async ({ input }) => {
      return await getWhatsAppTemplateById(input.id);
    }),
    create: protectedProcedure.input(
      z12.object({
        name: z12.string(),
        content: z12.string(),
        category: z12.enum(["confirmation", "reminder", "followup", "thank_you", "custom"]),
        variables: z12.array(z12.string()).optional()
      })
    ).mutation(async ({ input, ctx }) => {
      return await createWhatsAppTemplate({
        ...input,
        isActive: 1,
        createdBy: ctx.user.id
      });
    }),
    update: protectedProcedure.input(
      z12.object({
        id: z12.number(),
        name: z12.string().optional(),
        content: z12.string().optional(),
        category: z12.enum(["confirmation", "reminder", "followup", "thank_you", "custom"]).optional(),
        variables: z12.array(z12.string()).optional(),
        active: z12.boolean().optional()
      })
    ).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await updateWhatsAppTemplate(id, data);
    }),
    delete: protectedProcedure.input(z12.object({ id: z12.number() })).mutation(async ({ input }) => {
      return await deleteWhatsAppTemplate(input.id);
    }),
    preview: protectedProcedure.input(
      z12.object({
        templateId: z12.number(),
        variables: z12.record(z12.string(), z12.string())
      })
    ).query(async ({ input }) => {
      const template = await getWhatsAppTemplateById(input.templateId);
      if (!template) throw new Error("\u0627\u0644\u0642\u0627\u0644\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      let content = template.content;
      for (const [key, value] of Object.entries(input.variables)) {
        content = content.replaceAll(`{${key}}`, String(value));
      }
      return { content };
    })
  }),
  // Quick test endpoint
  testSend: protectedProcedure.input(
    z12.object({
      phone: z12.string(),
      message: z12.string().optional()
    })
  ).mutation(async ({ input }) => {
    const formattedPhone = formatPhoneNumber(input.phone);
    if (input.message) {
      return await sendWhatsAppTextMessage(formattedPhone, input.message);
    } else {
      return await sendWhatsAppTemplateMessage(formattedPhone, {
        templateName: "hello_world",
        languageCode: "en_US",
        components: []
      });
    }
  })
});

// server/routers/whatsappBroadcasts.ts
import { z as z13 } from "zod";
var whatsappBroadcastsRouter = router({
  list: protectedProcedure.query(async () => {
    const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const db = await getDb2();
    if (!db) return [];
    const { whatsappBroadcasts: whatsappBroadcasts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    return db.select().from(whatsappBroadcasts2).orderBy(whatsappBroadcasts2.createdAt);
  }),
  get: protectedProcedure.input(z13.object({ id: z13.number() })).query(async ({ input }) => {
    const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const db = await getDb2();
    if (!db) return null;
    const { whatsappBroadcasts: whatsappBroadcasts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const res = await db.select().from(whatsappBroadcasts2).where(whatsappBroadcasts2.id.eq(input.id)).limit(1);
    return res[0] || null;
  }),
  create: protectedProcedure.input(z13.object({ name: z13.string(), message: z13.string(), templateId: z13.number().optional(), targetFilter: z13.string().optional(), scheduledAt: z13.string().optional() })).mutation(async ({ ctx, input }) => {
    const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const db = await getDb2();
    if (!db) throw new Error("Database not available");
    const { whatsappBroadcasts: whatsappBroadcasts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const result = await db.insert(whatsappBroadcasts2).values({
      name: input.name,
      message: input.message,
      templateId: input.templateId || null,
      targetFilter: input.targetFilter || null,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      createdBy: ctx.user.id
    });
    return { success: true, id: result[0]?.insertId || null };
  }),
  update: protectedProcedure.input(z13.object({ id: z13.number(), name: z13.string().optional(), message: z13.string().optional(), templateId: z13.number().nullable().optional(), targetFilter: z13.string().nullable().optional(), scheduledAt: z13.string().nullable().optional(), status: z13.string().optional() })).mutation(async ({ ctx, input }) => {
    const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const db = await getDb2();
    if (!db) throw new Error("Database not available");
    const { whatsappBroadcasts: whatsappBroadcasts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const updateObj = {};
    if (typeof input.name !== "undefined") updateObj.name = input.name;
    if (typeof input.message !== "undefined") updateObj.message = input.message;
    if (typeof input.templateId !== "undefined") updateObj.templateId = input.templateId;
    if (typeof input.targetFilter !== "undefined") updateObj.targetFilter = input.targetFilter;
    if (typeof input.scheduledAt !== "undefined") updateObj.scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
    if (typeof input.status !== "undefined") updateObj.status = input.status;
    await db.update(whatsappBroadcasts2).set(updateObj).where(whatsappBroadcasts2.id.eq(input.id));
    return { success: true };
  }),
  delete: protectedProcedure.input(z13.object({ id: z13.number() })).mutation(async ({ input }) => {
    const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const db = await getDb2();
    if (!db) throw new Error("Database not available");
    const { whatsappBroadcasts: whatsappBroadcasts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await db.delete(whatsappBroadcasts2).where(whatsappBroadcasts2.id.eq(input.id));
    return { success: true };
  })
});

// server/routers/messageSettings.ts
import { z as z14 } from "zod";
init_db();
var messageSettingsRouter = router({
  // Get all message settings
  list: protectedProcedure.query(async () => {
    return await getAllMessageSettings();
  }),
  // Get message settings by category
  listByCategory: protectedProcedure.input(z14.object({
    category: z14.enum(["patient_journey", "executive_reports", "task_management", "doctor_notifications"])
  })).query(async ({ input }) => {
    return await getMessageSettingsByCategory(input.category);
  }),
  // Get a single message setting by type
  getByType: protectedProcedure.input(z14.object({
    messageType: z14.string()
  })).query(async ({ input }) => {
    return await getMessageSettingByType(input.messageType);
  }),
  // Update message setting
  update: protectedProcedure.input(z14.object({
    id: z14.number(),
    displayName: z14.string().optional(),
    messageContent: z14.string().optional(),
    isEnabled: z14.number().min(0).max(1).optional(),
    deliveryChannel: z14.enum(["whatsapp_api", "whatsapp_integration", "both"]).optional(),
    description: z14.string().optional()
  })).mutation(async ({ input }) => {
    return await updateMessageSetting(input);
  }),
  // Toggle message enabled/disabled
  toggleEnabled: protectedProcedure.input(z14.object({
    id: z14.number()
  })).mutation(async ({ input }) => {
    return await toggleMessageSettingEnabled(input.id);
  }),
  // Get enabled message setting by type (for sending messages)
  getEnabledByType: protectedProcedure.input(z14.object({
    messageType: z14.string()
  })).query(async ({ input }) => {
    const setting = await getMessageSettingByType(input.messageType);
    if (!setting || setting.isEnabled === 0) {
      return null;
    }
    return setting;
  })
});

// server/routers/webhooks.ts
import { z as z15 } from "zod";
init_db();
init_schema();
import { TRPCError as TRPCError4 } from "@trpc/server";
import { eq as eq13 } from "drizzle-orm";
var verifyWebhookSchema = z15.object({
  "hub.mode": z15.string(),
  "hub.verify_token": z15.string(),
  "hub.challenge": z15.string()
});
var webhookSchema = z15.object({
  object: z15.string(),
  entry: z15.array(
    z15.object({
      id: z15.string(),
      changes: z15.array(
        z15.object({
          value: z15.object({
            messaging_product: z15.string(),
            metadata: z15.object({
              display_phone_number: z15.string(),
              phone_number_id: z15.string()
            }),
            messages: z15.array(
              z15.object({
                from: z15.string(),
                id: z15.string(),
                timestamp: z15.string(),
                type: z15.string(),
                button: z15.object({
                  payload: z15.string(),
                  text: z15.string()
                }).optional(),
                // Support for text messages
                text: z15.object({
                  body: z15.string()
                }).optional()
              })
            ).optional(),
            // Support for statuses (message delivery/read status)
            statuses: z15.array(
              z15.object({
                id: z15.string(),
                status: z15.enum(["sent", "delivered", "read", "failed"]),
                timestamp: z15.string(),
                recipient_id: z15.string(),
                errors: z15.array(z15.object({
                  code: z15.number(),
                  title: z15.string(),
                  message: z15.string().optional()
                })).optional()
              })
            ).optional()
          }),
          field: z15.string()
        })
      )
    })
  )
});
var webhooksRouter = router({
  /**
   * Webhook verification endpoint (GET)
   * Meta يستخدم هذا للتحقق من صحة الـ webhook
   */
  verify: publicProcedure.input(
    z15.object({
      mode: z15.string(),
      token: z15.string(),
      challenge: z15.string()
    })
  ).query(({ input }) => {
    const VERIFY_TOKEN2 = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "sgh_crm_webhook_2024";
    if (input.mode === "subscribe" && input.token === VERIFY_TOKEN2) {
      console.log("[Webhook] Verification successful");
      return { challenge: input.challenge };
    } else {
      console.error("[Webhook] Verification failed");
      throw new TRPCError4({
        code: "FORBIDDEN",
        message: "Verification token mismatch"
      });
    }
  }),
  /**
   * Webhook receiver endpoint (POST)
   * يستقبل ردود المستخدمين على الأزرار التفاعلية وحالة الرسائل
   */
  receive: publicProcedure.input(webhookSchema).mutation(async ({ input }) => {
    try {
      console.log("[Webhook] Received:", JSON.stringify(input, null, 2));
      const db = await getDb();
      if (!db) {
        throw new TRPCError4({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available"
        });
      }
      for (const entry of input.entry) {
        for (const change of entry.changes) {
          const statuses = change.value.statuses;
          if (statuses && statuses.length > 0) {
            for (const status of statuses) {
              console.log(`[Webhook] Message status: ${status.status} for message ${status.id}`);
              if (status.status === "failed" && status.errors) {
                for (const error of status.errors) {
                  console.error(`[Webhook] Message failed - Code: ${error.code}, Title: ${error.title}, Message: ${error.message || "N/A"}`);
                }
              }
            }
          }
          const messages = change.value.messages;
          if (!messages || messages.length === 0) continue;
          for (const message of messages) {
            const userPhone = message.from;
            if (message.type === "button" && message.button) {
              const payload = message.button.payload;
              console.log(`[Webhook] Button clicked: ${payload} from ${userPhone}`);
              const [action, type, id] = payload.split("_");
              if (!action || !type || !id) {
                console.error(`[Webhook] Invalid payload format: ${payload}`);
                continue;
              }
              const bookingId = parseInt(id);
              if (isNaN(bookingId)) {
                console.error(`[Webhook] Invalid booking ID: ${id}`);
                continue;
              }
              if (type === "APPOINTMENT") {
                const newStatus = action === "CONFIRM" ? "confirmed" : "cancelled";
                await db.update(appointments).set({ status: newStatus, updatedAt: /* @__PURE__ */ new Date() }).where(eq13(appointments.id, bookingId));
                console.log(`[Webhook] Appointment ${bookingId} updated to ${newStatus}`);
              } else if (type === "OFFER") {
                const newStatus = action === "CONFIRM" ? "confirmed" : "cancelled";
                await db.update(offerLeads).set({ status: newStatus, updatedAt: /* @__PURE__ */ new Date() }).where(eq13(offerLeads.id, bookingId));
                console.log(`[Webhook] Offer lead ${bookingId} updated to ${newStatus}`);
              } else if (type === "CAMP") {
                const newStatus = action === "CONFIRM" ? "confirmed" : "cancelled";
                await db.update(campRegistrations).set({ status: newStatus, updatedAt: /* @__PURE__ */ new Date() }).where(eq13(campRegistrations.id, bookingId));
                console.log(`[Webhook] Camp registration ${bookingId} updated to ${newStatus}`);
              }
            } else if (message.type === "text" && message.text) {
              console.log(`[Webhook] Text message from ${userPhone}: ${message.text.body}`);
            }
          }
        }
      }
      return { success: true, message: "Webhook processed successfully" };
    } catch (error) {
      console.error("[Webhook] Error processing webhook:", error);
      throw new TRPCError4({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to process webhook"
      });
    }
  })
});

// server/routers/comments.ts
import { z as z16 } from "zod";

// server/comments.ts
init_schema();
init_db();
import { eq as eq14, and as and8, desc as desc8 } from "drizzle-orm";
async function getCommentsByEntity(entityType, entityId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get comments: database not available");
    return [];
  }
  try {
    const result = await db.select().from(comments).where(and8(eq14(comments.entityType, entityType), eq14(comments.entityId, entityId))).orderBy(desc8(comments.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get comments:", error);
    return [];
  }
}
async function addComment(comment) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    const [result] = await db.insert(comments).values(comment);
    return result;
  } catch (error) {
    console.error("[Database] Failed to add comment:", error);
    throw error;
  }
}
async function deleteComment(commentId, userId, isAdmin = false) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    const [comment] = await db.select().from(comments).where(eq14(comments.id, commentId)).limit(1);
    if (!comment) {
      throw new Error("Comment not found");
    }
    if (comment.userId !== userId && !isAdmin) {
      throw new Error("Unauthorized to delete this comment");
    }
    await db.delete(comments).where(eq14(comments.id, commentId));
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to delete comment:", error);
    throw error;
  }
}
async function getCommentCount(entityType, entityId) {
  const db = await getDb();
  if (!db) {
    return 0;
  }
  try {
    const result = await db.select().from(comments).where(and8(eq14(comments.entityType, entityType), eq14(comments.entityId, entityId)));
    return result.length;
  } catch (error) {
    console.error("[Database] Failed to get comment count:", error);
    return 0;
  }
}

// server/routers/comments.ts
var commentsRouter = router({
  /**
   * Get all comments for a specific entity
   */
  getByEntity: protectedProcedure.input(
    z16.object({
      entityType: z16.enum(["appointment", "lead", "offerLead", "campRegistration"]),
      entityId: z16.number()
    })
  ).query(async ({ input }) => {
    return await getCommentsByEntity(input.entityType, input.entityId);
  }),
  /**
   * Add a new comment
   */
  add: protectedProcedure.input(
    z16.object({
      entityType: z16.enum(["appointment", "lead", "offerLead", "campRegistration"]),
      entityId: z16.number(),
      content: z16.string().min(1, "\u0627\u0644\u062A\u0639\u0644\u064A\u0642 \u0644\u0627 \u064A\u0645\u0643\u0646 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0641\u0627\u0631\u063A\u0627\u064B")
    })
  ).mutation(async ({ input, ctx }) => {
    const comment = {
      entityType: input.entityType,
      entityId: input.entityId,
      content: input.content,
      userId: ctx.user.id,
      userName: ctx.user.name || ctx.user.username || "\u0645\u0633\u062A\u062E\u062F\u0645"
    };
    return await addComment(comment);
  }),
  /**
   * Delete a comment
   */
  delete: protectedProcedure.input(z16.object({ commentId: z16.number() })).mutation(async ({ input, ctx }) => {
    const isAdmin = ctx.user.role === "admin";
    return await deleteComment(input.commentId, ctx.user.id, isAdmin);
  }),
  /**
   * Get comment count for an entity
   */
  getCount: protectedProcedure.input(
    z16.object({
      entityType: z16.enum(["appointment", "lead", "offerLead", "campRegistration"]),
      entityId: z16.number()
    })
  ).query(async ({ input }) => {
    return await getCommentCount(input.entityType, input.entityId);
  })
});

// server/routers/followUpTasks.ts
import { z as z17 } from "zod";

// server/followUpTasks.ts
init_db();
init_schema();
import { eq as eq15, and as and9, desc as desc9 } from "drizzle-orm";
async function createFollowUpTask(task) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(followUpTasks).values(task);
  return result;
}
async function getFollowUpTasksByEntity(entityType, entityId) {
  const db = await getDb();
  if (!db) return [];
  const tasks2 = await db.select().from(followUpTasks).where(
    and9(
      eq15(followUpTasks.entityType, entityType),
      eq15(followUpTasks.entityId, entityId)
    )
  ).orderBy(desc9(followUpTasks.createdAt));
  return tasks2;
}
async function getFollowUpTaskCount(entityType, entityId) {
  const db = await getDb();
  if (!db) return 0;
  const tasks2 = await db.select().from(followUpTasks).where(
    and9(
      eq15(followUpTasks.entityType, entityType),
      eq15(followUpTasks.entityId, entityId)
    )
  );
  return tasks2.length;
}
async function updateFollowUpTaskStatus(taskId, status, completedById, completedByName) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData = {
    status,
    updatedAt: /* @__PURE__ */ new Date()
  };
  if (status === "completed") {
    updateData.completedAt = /* @__PURE__ */ new Date();
    if (completedById) updateData.completedById = completedById;
    if (completedByName) updateData.completedByName = completedByName;
  }
  await db.update(followUpTasks).set(updateData).where(eq15(followUpTasks.id, taskId));
}
async function deleteFollowUpTask(taskId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(followUpTasks).where(eq15(followUpTasks.id, taskId));
}

// server/routers/followUpTasks.ts
var followUpTasksRouter = router({
  // Get all tasks
  getAll: protectedProcedure.query(async () => {
    const db = await Promise.resolve().then(() => (init_db(), db_exports)).then((m) => m.getDb());
    if (!db) return [];
    const { followUpTasks: followUpTasks2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { desc: desc13 } = await import("drizzle-orm");
    return await db.select().from(followUpTasks2).orderBy(desc13(followUpTasks2.createdAt));
  }),
  // Get tasks for a specific entity
  getByEntity: protectedProcedure.input(
    z17.object({
      entityType: z17.enum(["appointment", "lead", "offerLead", "campRegistration"]),
      entityId: z17.number()
    })
  ).query(async ({ input }) => {
    return await getFollowUpTasksByEntity(input.entityType, input.entityId);
  }),
  // Get task count for a specific entity
  getCount: protectedProcedure.input(
    z17.object({
      entityType: z17.enum(["appointment", "lead", "offerLead", "campRegistration"]),
      entityId: z17.number()
    })
  ).query(async ({ input }) => {
    return await getFollowUpTaskCount(input.entityType, input.entityId);
  }),
  // Create a new task
  create: protectedProcedure.input(
    z17.object({
      entityType: z17.enum(["appointment", "lead", "offerLead", "campRegistration"]),
      entityId: z17.number(),
      title: z17.string().min(1),
      description: z17.string().optional(),
      priority: z17.enum(["low", "medium", "high"]).default("medium"),
      dueDate: z17.string().optional(),
      // ISO date string
      assignedToId: z17.number().optional(),
      assignedToName: z17.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    await createFollowUpTask({
      entityType: input.entityType,
      entityId: input.entityId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      dueDate: input.dueDate ? new Date(input.dueDate) : void 0,
      assignedToId: input.assignedToId,
      assignedToName: input.assignedToName,
      createdById: ctx.user.id,
      createdByName: ctx.user.name || ctx.user.username,
      status: "pending"
    });
    return { success: true };
  }),
  // Update task status
  updateStatus: protectedProcedure.input(
    z17.object({
      id: z17.number(),
      status: z17.enum(["pending", "in_progress", "completed", "cancelled"])
    })
  ).mutation(async ({ input, ctx }) => {
    await updateFollowUpTaskStatus(
      input.id,
      input.status,
      ctx.user.id,
      ctx.user.name || ctx.user.username
    );
    return { success: true };
  }),
  // Delete a task
  delete: protectedProcedure.input(z17.object({ id: z17.number() })).mutation(async ({ input }) => {
    await deleteFollowUpTask(input.id);
    return { success: true };
  })
});

// server/routers/appointments.ts
init_db();
init_schema();
import { z as z18 } from "zod";
import { eq as eq16 } from "drizzle-orm";
init_db();

// server/email.ts
async function sendEmail(params) {
  try {
    console.log("[Email] Would send email:", {
      to: params.to,
      subject: params.subject,
      preview: params.html.substring(0, 100)
    });
    return true;
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    return false;
  }
}
function generateNewLeadEmail(lead) {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Cairo', Arial, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #00A3E0, #2DB04C);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 30px;
        }
        .info-row {
          display: flex;
          padding: 15px;
          border-bottom: 1px solid #eee;
        }
        .info-label {
          font-weight: bold;
          color: #00A3E0;
          min-width: 120px;
        }
        .info-value {
          color: #333;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #00A3E0, #2DB04C);
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>\u{1F389} \u062A\u0633\u062C\u064A\u0644 \u0639\u0645\u064A\u0644 \u062C\u062F\u064A\u062F</h1>
          <p>\u0627\u0644\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A \u0627\u0644\u0623\u0644\u0645\u0627\u0646\u064A - \u0635\u0646\u0639\u0627\u0621</p>
        </div>
        <div class="content">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            \u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0639\u0645\u064A\u0644 \u062C\u062F\u064A\u062F \u0641\u064A \u062D\u0645\u0644\u0629 <strong>${lead.campaignName}</strong>
          </p>
          
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <div class="info-row">
              <div class="info-label">\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644:</div>
              <div class="info-value">${lead.fullName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641:</div>
              <div class="info-value" dir="ltr">${lead.phone}</div>
            </div>
            ${lead.email ? `
            <div class="info-row">
              <div class="info-label">\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A:</div>
              <div class="info-value">${lead.email}</div>
            </div>
            ` : ""}
            <div class="info-row">
              <div class="info-label">\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062A\u0633\u062C\u064A\u0644:</div>
              <div class="info-value">${lead.createdAt.toLocaleString("ar-YE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })}</div>
            </div>
            ${lead.utmSource ? `
            <div class="info-row">
              <div class="info-label">\u0645\u0635\u062F\u0631 \u0627\u0644\u062D\u0645\u0644\u0629:</div>
              <div class="info-value">${lead.utmSource}</div>
            </div>
            ` : ""}
            ${lead.utmMedium ? `
            <div class="info-row">
              <div class="info-label">\u0648\u0633\u064A\u0644\u0629 \u0627\u0644\u062D\u0645\u0644\u0629:</div>
              <div class="info-value">${lead.utmMedium}</div>
            </div>
            ` : ""}
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0645\u0639 \u0627\u0644\u0639\u0645\u064A\u0644 \u0641\u064A \u0623\u0642\u0631\u0628 \u0648\u0642\u062A \u0645\u0645\u0643\u0646 \u0644\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0648\u0639\u062F \u0648\u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629.
          </p>
        </div>
        <div class="footer">
          <p>\u0627\u0644\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A \u0627\u0644\u0623\u0644\u0645\u0627\u0646\u064A - \u0635\u0646\u0639\u0627\u0621</p>
          <p>\u0646\u0631\u0639\u0627\u0643\u0645 \u0643\u0623\u0647\u0627\u0644\u064A\u0646\u0627</p>
          <p style="margin-top: 10px;">
            <a href="tel:8000018" style="color: #00A3E0; text-decoration: none;">
              \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0645\u062C\u0627\u0646\u064A: 8000018
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
async function sendNewLeadNotification(lead) {
  const emailHtml = generateNewLeadEmail(lead);
  const hospitalEmail = process.env.HOSPITAL_EMAIL || "info@sgh-sanaa.com";
  return sendEmail({
    to: hospitalEmail,
    subject: `\u062A\u0633\u062C\u064A\u0644 \u062C\u062F\u064A\u062F: ${lead.fullName} - ${lead.campaignName}`,
    html: emailHtml
  });
}
async function sendNewAppointmentEmail(params) {
  const { appointment, campaign } = params;
  const emailHtml = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Cairo', Arial, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #00A3E0, #2DB04C);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 30px;
        }
        .info-row {
          display: flex;
          padding: 15px;
          border-bottom: 1px solid #eee;
        }
        .info-label {
          font-weight: bold;
          color: #00A3E0;
          min-width: 120px;
        }
        .info-value {
          color: #333;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>\u{1F4C5} \u062D\u062C\u0632 \u0645\u0648\u0639\u062F \u062C\u062F\u064A\u062F</h1>
          <p>\u0627\u0644\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A \u0627\u0644\u0623\u0644\u0645\u0627\u0646\u064A - \u0635\u0646\u0639\u0627\u0621</p>
        </div>
        <div class="content">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            \u062A\u0645 \u062D\u062C\u0632 \u0645\u0648\u0639\u062F \u062C\u062F\u064A\u062F \u0645\u0646 \u062E\u0644\u0627\u0644 <strong>${campaign}</strong>
          </p>
          
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #00A3E0; margin-top: 0;">\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u0631\u064A\u0636:</h3>
            <div class="info-row">
              <div class="info-label">\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644:</div>
              <div class="info-value">${appointment.fullName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641:</div>
              <div class="info-value" dir="ltr">${appointment.phone}</div>
            </div>
            ${appointment.email ? `
            <div class="info-row">
              <div class="info-label">\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A:</div>
              <div class="info-value">${appointment.email}</div>
            </div>
            ` : ""}
            
            <h3 style="color: #00A3E0; margin-top: 20px;">\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u0648\u0639\u062F:</h3>
            <div class="info-row">
              <div class="info-label">\u0627\u0644\u0637\u0628\u064A\u0628:</div>
              <div class="info-value">${appointment.doctorName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">\u0627\u0644\u062A\u062E\u0635\u0635:</div>
              <div class="info-value">${appointment.doctorSpecialty}</div>
            </div>
            ${appointment.preferredDate ? `
            <div class="info-row">
              <div class="info-label">\u0627\u0644\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u0641\u0636\u0644:</div>
              <div class="info-value">${appointment.preferredDate}</div>
            </div>
            ` : ""}
            ${appointment.preferredTime ? `
            <div class="info-row">
              <div class="info-label">\u0627\u0644\u0648\u0642\u062A \u0627\u0644\u0645\u0641\u0636\u0644:</div>
              <div class="info-value">${appointment.preferredTime}</div>
            </div>
            ` : ""}
            ${appointment.notes ? `
            <div class="info-row">
              <div class="info-label">\u0645\u0644\u0627\u062D\u0638\u0627\u062A:</div>
              <div class="info-value">${appointment.notes}</div>
            </div>
            ` : ""}
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0645\u0631\u064A\u0636 \u0644\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0648\u0639\u062F \u0648\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0648\u0642\u062A \u0627\u0644\u0645\u0646\u0627\u0633\u0628.
          </p>
        </div>
        <div class="footer">
          <p>\u0627\u0644\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A \u0627\u0644\u0623\u0644\u0645\u0627\u0646\u064A - \u0635\u0646\u0639\u0627\u0621</p>
          <p>\u0646\u0631\u0639\u0627\u0643\u0645 \u0643\u0623\u0647\u0627\u0644\u064A\u0646\u0627</p>
          <p style="margin-top: 10px;">
            <a href="tel:8000018" style="color: #00A3E0; text-decoration: none;">
              \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0645\u062C\u0627\u0646\u064A: 8000018
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  const hospitalEmail = process.env.HOSPITAL_EMAIL || "info@sgh-sanaa.com";
  return sendEmail({
    to: hospitalEmail,
    subject: `\u062D\u062C\u0632 \u0645\u0648\u0639\u062F \u062C\u062F\u064A\u062F: ${appointment.fullName} - ${appointment.doctorName}`,
    html: emailHtml
  });
}

// server/routers/appointments.ts
init_whatsapp();
var appointmentsRouter = router({
  submit: publicProcedure.input(z18.object({
    fullName: z18.string(),
    phone: z18.string(),
    email: z18.string().optional(),
    doctorId: z18.number(),
    age: z18.number().optional(),
    procedure: z18.string().optional(),
    preferredDate: z18.string().optional(),
    preferredTime: z18.string().optional(),
    additionalNotes: z18.string().optional(),
    campaignSlug: z18.string(),
    source: z18.string().optional(),
    status: z18.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
    utmSource: z18.string().optional(),
    utmMedium: z18.string().optional(),
    utmCampaign: z18.string().optional(),
    utmTerm: z18.string().optional(),
    utmContent: z18.string().optional(),
    utmPlacement: z18.string().optional(),
    referrer: z18.string().optional(),
    fbclid: z18.string().optional(),
    gclid: z18.string().optional()
  })).mutation(async ({ input }) => {
    let campaign = await getCampaignBySlug(input.campaignSlug);
    if (!campaign) {
      await createCampaign({
        name: `\u062D\u062C\u0632 \u0645\u0648\u0639\u062F - ${input.campaignSlug}`,
        slug: input.campaignSlug,
        description: `\u062D\u062C\u0632 \u0645\u0648\u0639\u062F \u062A\u0644\u0642\u0627\u0626\u064A`,
        isActive: true,
        whatsappEnabled: false
      });
      campaign = await getCampaignBySlug(input.campaignSlug);
    }
    if (!campaign) {
      throw new Error("Failed to create or retrieve campaign");
    }
    const appointment = await createAppointment({
      campaignId: campaign.id,
      doctorId: input.doctorId,
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      age: input.age,
      procedure: input.procedure,
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime,
      additionalNotes: input.additionalNotes,
      status: input.status || "pending",
      source: input.source || "direct",
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
      utmTerm: input.utmTerm,
      utmContent: input.utmContent,
      utmPlacement: input.utmPlacement,
      referrer: input.referrer,
      fbclid: input.fbclid,
      gclid: input.gclid
    });
    const doctor = await getDoctorById(input.doctorId);
    await sendNewAppointmentEmail({
      appointment: {
        ...input,
        doctorName: doctor?.name || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
        doctorSpecialty: doctor?.specialty || ""
      },
      campaign: campaign.name
    });
    if (campaign.whatsappEnabled && campaign.whatsappWelcomeMessage) {
      await sendWelcomeMessage({
        phone: input.phone,
        fullName: input.fullName,
        campaignName: campaign.name,
        welcomeMessage: campaign.whatsappWelcomeMessage
      });
    }
    await notifyOwner({
      title: "\u062D\u062C\u0632 \u0645\u0648\u0639\u062F \u062C\u062F\u064A\u062F",
      content: `\u062A\u0645 \u062D\u062C\u0632 \u0645\u0648\u0639\u062F \u062C\u062F\u064A\u062F \u0645\u0646 ${input.fullName} \u0645\u0639 ${doctor?.name || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}`
    });
    await sendNewAppointmentTelegram({
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      doctorName: doctor?.name || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime
    });
    if (appointment) {
      const { sendBookingConfirmationInteractive: sendBookingConfirmationInteractive2 } = await Promise.resolve().then(() => (init_messaging(), messaging_exports));
      sendBookingConfirmationInteractive2({
        phone: input.phone,
        name: input.fullName,
        date: input.preferredDate || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
        time: input.preferredTime || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
        doctor: doctor?.name || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
        service: input.procedure || "\u0641\u062D\u0635 \u0639\u0627\u0645",
        bookingId: appointment.insertId,
        bookingType: "appointment"
      }).catch((error) => {
        console.error("[WhatsApp] Failed to send booking confirmation:", error);
      });
    }
    serverCache.invalidateByPrefix("paginated:appointments:");
    serverCache.invalidate("list:appointments");
    serverCache.invalidate(CacheKeys.appointmentStats());
    return appointment;
  }),
  list: protectedProcedure.query(async () => {
    return serverCache.getOrCompute(
      "list:appointments",
      CacheTTL.LIST,
      () => getAllAppointments()
    );
  }),
  listPaginated: protectedProcedure.input(z18.object({
    page: z18.number().min(1).default(1),
    limit: z18.number().min(1).max(1e5).default(20),
    searchTerm: z18.string().optional(),
    doctorIds: z18.array(z18.number()).optional(),
    sources: z18.array(z18.string()).optional(),
    statuses: z18.array(z18.string()).optional(),
    dateFilter: z18.enum(["all", "today", "week", "month"]).optional(),
    dateFrom: z18.string().optional(),
    dateTo: z18.string().optional()
  })).query(async ({ input }) => {
    const cacheKey = CacheKeys.appointmentsPaginated(input);
    return serverCache.getOrCompute(
      cacheKey,
      CacheTTL.PAGINATED,
      async () => {
        const { getAppointmentsPaginated: getAppointmentsPaginated2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        return getAppointmentsPaginated2(
          input.page,
          input.limit,
          input.searchTerm,
          input.doctorIds,
          input.sources,
          input.statuses,
          input.dateFilter,
          input.dateFrom,
          input.dateTo
        );
      }
    );
  }),
  updateStatus: protectedProcedure.input(z18.object({
    id: z18.number(),
    status: z18.string(),
    staffNotes: z18.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const dbForAudit = await getDb();
    let oldStatus = "";
    if (dbForAudit) {
      const [old] = await dbForAudit.select({ status: appointments.status }).from(appointments).where(eq16(appointments.id, input.id)).limit(1);
      oldStatus = old?.status || "";
    }
    await updateAppointmentStatus(input.id, input.status, input.staffNotes);
    await createAuditLog({
      entityType: "appointment",
      entityId: input.id,
      action: "status_change",
      oldValue: oldStatus,
      newValue: input.status,
      userId: ctx.user?.id,
      userName: ctx.user?.name,
      notes: input.staffNotes
    });
    serverCache.invalidateByPrefix("paginated:appointments:");
    serverCache.invalidate("list:appointments");
    serverCache.invalidate(CacheKeys.appointmentStats());
    if (input.status === "\u062D\u0636\u0631" || input.status === "attended") {
      const db = await getDb();
      if (db) {
        const [appointment] = await db.select().from(appointments).where(eq16(appointments.id, input.id)).limit(1);
        if (appointment && appointment.phone) {
          const { sendPatientArrivalWelcome: sendPatientArrivalWelcome2 } = await Promise.resolve().then(() => (init_messaging(), messaging_exports));
          const doctor = await getDoctorById(appointment.doctorId || 0);
          await sendPatientArrivalWelcome2({
            phone: appointment.phone,
            name: appointment.fullName || "\u0627\u0644\u0645\u0631\u064A\u0636",
            doctor: doctor?.name || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
            time: appointment.preferredTime || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"
          });
        }
      }
    }
    return { success: true };
  }),
  updateAppointment: protectedProcedure.input(z18.object({
    id: z18.number(),
    appointmentDate: z18.string().optional(),
    status: z18.string().optional(),
    staffNotes: z18.string().optional()
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const updateData = {};
    if (input.appointmentDate) {
      updateData.appointmentDate = new Date(input.appointmentDate);
    }
    if (input.status) {
      updateData.status = input.status;
    }
    if (input.staffNotes !== void 0) {
      updateData.staffNotes = input.staffNotes;
    }
    await db.update(appointments).set(updateData).where(eq16(appointments.id, input.id));
    serverCache.invalidateByPrefix("paginated:appointments:");
    serverCache.invalidate("list:appointments");
    return { success: true };
  }),
  // Send patient arrival welcome message
  sendArrivalWelcome: protectedProcedure.input(z18.object({
    appointmentId: z18.number()
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const appointment = await db.select().from(appointments).where(eq16(appointments.id, input.appointmentId)).limit(1);
    if (appointment.length === 0) {
      throw new Error("\u0627\u0644\u062D\u062C\u0632 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
    }
    const appt = appointment[0];
    const doctor = await getDoctorById(appt.doctorId);
    const { sendPatientArrivalWelcome: sendPatientArrivalWelcome2, formatTimeForMessage: formatTimeForMessage2 } = await Promise.resolve().then(() => (init_messaging(), messaging_exports));
    const result = await sendPatientArrivalWelcome2({
      phone: appt.phone,
      name: appt.fullName,
      doctor: doctor?.name || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
      time: appt.appointmentDate ? formatTimeForMessage2(new Date(appt.appointmentDate)) : "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"
    });
    return result;
  }),
  // Bulk update appointment statuses
  bulkUpdateStatus: protectedProcedure.input(z18.object({
    ids: z18.array(z18.number()),
    status: z18.enum(["pending", "confirmed", "cancelled", "completed"]),
    staffNotes: z18.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const result = await bulkUpdateAppointmentStatus(input.ids, input.status, input.staffNotes);
    for (const id of input.ids) {
      await createAuditLog({
        entityType: "appointment",
        entityId: id,
        action: "bulk_status_change",
        newValue: input.status,
        userId: ctx.user?.id,
        userName: ctx.user?.name,
        notes: input.staffNotes
      });
    }
    serverCache.invalidateByPrefix("paginated:appointments:");
    serverCache.invalidate("list:appointments");
    serverCache.invalidate(CacheKeys.appointmentStats());
    return result;
  }),
  // Generate and save receipt number
  generateReceiptNumber: protectedProcedure.input(z18.object({
    id: z18.number()
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [appointment] = await db.select().from(appointments).where(eq16(appointments.id, input.id)).limit(1);
    if (!appointment) {
      throw new Error("\u0627\u0644\u062D\u062C\u0632 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
    }
    if (appointment.receiptNumber) {
      return { receiptNumber: appointment.receiptNumber };
    }
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const { sql: sql8 } = await import("drizzle-orm");
    const [result] = await db.execute(sql8`
        SELECT COUNT(*) as count 
        FROM appointments 
        WHERE receiptNumber LIKE CONCAT('SGH-', ${year}, '-%')
      `);
    const count3 = result.count || 0;
    const sequenceNumber = count3 + 1;
    const paddedNumber = String(sequenceNumber).padStart(3, "0");
    const receiptNumber = `SGH-${year}-${paddedNumber}`;
    await db.update(appointments).set({ receiptNumber }).where(eq16(appointments.id, input.id));
    return { receiptNumber };
  })
});

// server/routers/leads.ts
import { z as z19 } from "zod";
init_db();
init_whatsapp();
var leadsRouter = router({
  // Public endpoint for lead submission from landing page
  submit: publicProcedure.input(z19.object({
    campaignSlug: z19.string(),
    fullName: z19.string().min(1),
    phone: z19.string().min(1),
    email: z19.string().email().optional(),
    notes: z19.string().optional(),
    status: z19.enum(["new", "contacted", "booked", "not_interested", "no_answer", "pending", "confirmed", "completed", "cancelled"]).optional(),
    source: z19.string().optional(),
    utmSource: z19.string().optional(),
    utmMedium: z19.string().optional(),
    utmCampaign: z19.string().optional(),
    utmTerm: z19.string().optional(),
    utmContent: z19.string().optional(),
    utmPlacement: z19.string().optional(),
    referrer: z19.string().optional(),
    fbclid: z19.string().optional(),
    gclid: z19.string().optional()
  })).mutation(async ({ input }) => {
    let campaign = await getCampaignBySlug(input.campaignSlug);
    if (!campaign) {
      await createCampaign({
        name: `\u062D\u062C\u0632 \u0645\u0648\u0639\u062F - ${input.campaignSlug}`,
        slug: input.campaignSlug,
        description: `\u062D\u062C\u0632 \u0645\u0648\u0639\u062F \u062A\u0644\u0642\u0627\u0626\u064A`,
        isActive: true,
        whatsappEnabled: false
      });
      campaign = await getCampaignBySlug(input.campaignSlug);
    }
    if (!campaign) {
      throw new Error("Failed to create or retrieve campaign");
    }
    await createLead({
      campaignId: campaign.id,
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      notes: input.notes,
      status: input.status || "new",
      source: input.source || "direct",
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
      utmContent: input.utmContent,
      emailSent: false,
      whatsappSent: false,
      bookingConfirmationSent: false
    });
    await notifyOwner({
      title: "\u062A\u0633\u062C\u064A\u0644 \u062C\u062F\u064A\u062F \u0641\u064A \u0627\u0644\u0645\u062E\u064A\u0645 \u0627\u0644\u0637\u0628\u064A \u0627\u0644\u062E\u064A\u0631\u064A",
      content: `\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0639\u0645\u064A\u0644 \u062C\u062F\u064A\u062F:
\u0627\u0644\u0627\u0633\u0645: ${input.fullName}
\u0627\u0644\u0647\u0627\u062A\u0641: ${input.phone}
\u0627\u0644\u0628\u0631\u064A\u062F: ${input.email || "\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631"}`
    });
    await sendNewLeadTelegram({
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      source: input.utmSource || "direct"
    });
    await sendNewLeadNotification({
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      campaignName: campaign.name,
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      createdAt: /* @__PURE__ */ new Date()
    });
    if (campaign.whatsappEnabled) {
      await sendWelcomeMessage({
        phone: input.phone,
        fullName: input.fullName,
        campaignName: campaign.name,
        welcomeMessage: campaign.whatsappWelcomeMessage || void 0
      });
    }
    return { success: true };
  }),
  // Admin endpoints
  list: protectedProcedure.query(async () => {
    return getAllLeads();
  }),
  // Unified list from all sources
  unifiedList: protectedProcedure.query(async () => {
    const { getAllUnifiedLeads: getAllUnifiedLeads2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    return getAllUnifiedLeads2();
  }),
  getById: protectedProcedure.input(z19.object({ id: z19.number() })).query(async ({ input }) => {
    return getLeadById(input.id);
  }),
  search: protectedProcedure.input(z19.object({ searchTerm: z19.string() })).query(async ({ input }) => {
    return searchLeads(input.searchTerm);
  }),
  getByCampaign: protectedProcedure.input(z19.object({ campaignId: z19.number() })).query(async ({ input }) => {
    return getLeadsByCampaign(input.campaignId);
  }),
  updateStatus: protectedProcedure.input(z19.object({
    id: z19.number(),
    status: z19.enum(["new", "contacted", "booked", "not_interested", "no_answer"]),
    notes: z19.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const lead = await getLeadById(input.id);
    if (!lead) {
      throw new Error("Lead not found");
    }
    await updateLead(input.id, { status: input.status });
    await createLeadStatusHistory({
      leadId: input.id,
      userId: ctx.user.id,
      oldStatus: lead.status,
      newStatus: input.status,
      notes: input.notes
    });
    await createAuditLog({
      entityType: "lead",
      entityId: input.id,
      action: "status_change",
      oldValue: lead.status,
      newValue: input.status,
      userId: ctx.user?.id,
      userName: ctx.user?.name,
      notes: input.notes
    });
    return { success: true };
  }),
  getStatusHistory: protectedProcedure.input(z19.object({ leadId: z19.number() })).query(async ({ input }) => {
    return getLeadStatusHistory(input.leadId);
  }),
  stats: protectedProcedure.query(async () => {
    return getLeadsStats();
  }),
  sendWhatsApp: protectedProcedure.input(z19.object({
    leadId: z19.number(),
    message: z19.string().min(1)
  })).mutation(async ({ input }) => {
    const lead = await getLeadById(input.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }
    const success = await sendCustomMessage(lead.phone, input.message);
    if (success) {
      await updateLead(input.leadId, {
        whatsappSent: true
      });
    }
    return { success };
  }),
  sendBookingConfirmation: protectedProcedure.input(z19.object({
    leadId: z19.number(),
    appointmentDate: z19.string().optional(),
    appointmentTime: z19.string().optional()
  })).mutation(async ({ input }) => {
    const lead = await getLeadById(input.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }
    const success = await sendBookingConfirmation({
      phone: lead.phone,
      fullName: lead.fullName,
      appointmentDate: input.appointmentDate,
      appointmentTime: input.appointmentTime
    });
    if (success) {
      await updateLead(input.leadId, {
        bookingConfirmationSent: true
      });
    }
    return { success };
  })
});

// server/metaGraphAPI.ts
var META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || "";
var INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || "";
var FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID || "";
var GRAPH_API_BASE_URL = "https://graph.facebook.com/v18.0";
async function getInstagramInsights() {
  if (!META_ACCESS_TOKEN || !INSTAGRAM_BUSINESS_ACCOUNT_ID) {
    console.warn("[Meta API] Instagram credentials not configured");
    return null;
  }
  try {
    const accountResponse = await fetch(
      `${GRAPH_API_BASE_URL}/${INSTAGRAM_BUSINESS_ACCOUNT_ID}?fields=followers_count,follows_count,media_count,profile_picture_url&access_token=${META_ACCESS_TOKEN}`
    );
    if (!accountResponse.ok) {
      const error = await accountResponse.json();
      console.error("[Meta API] Instagram account error:", error);
      return null;
    }
    const accountData = await accountResponse.json();
    const insightsResponse = await fetch(
      `${GRAPH_API_BASE_URL}/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/insights?metric=reach,impressions,profile_views&period=days_28&access_token=${META_ACCESS_TOKEN}`
    );
    if (!insightsResponse.ok) {
      const error = await insightsResponse.json();
      console.error("[Meta API] Instagram insights error:", error);
      return {
        followers_count: accountData.followers_count || 0,
        follows_count: accountData.follows_count || 0,
        media_count: accountData.media_count || 0,
        profile_views: 0,
        reach: 0,
        impressions: 0,
        engagement: 0
      };
    }
    const insightsData = await insightsResponse.json();
    const insights = {};
    if (insightsData.data) {
      insightsData.data.forEach((metric) => {
        if (metric.values && metric.values.length > 0) {
          insights[metric.name] = metric.values[metric.values.length - 1].value;
        }
      });
    }
    const totalEngagement = insights.reach || 0;
    const engagement = accountData.followers_count > 0 ? totalEngagement / accountData.followers_count * 100 : 0;
    return {
      followers_count: accountData.followers_count || 0,
      follows_count: accountData.follows_count || 0,
      media_count: accountData.media_count || 0,
      profile_views: insights.profile_views || 0,
      reach: insights.reach || 0,
      impressions: insights.impressions || 0,
      engagement: Math.round(engagement * 10) / 10
    };
  } catch (error) {
    console.error("[Meta API] Instagram error:", error);
    return null;
  }
}
async function getFacebookPageInsights() {
  if (!META_ACCESS_TOKEN || !FACEBOOK_PAGE_ID) {
    console.warn("[Meta API] Facebook credentials not configured");
    return null;
  }
  try {
    const pageResponse = await fetch(
      `${GRAPH_API_BASE_URL}/${FACEBOOK_PAGE_ID}?fields=fan_count,name,picture&access_token=${META_ACCESS_TOKEN}`
    );
    if (!pageResponse.ok) {
      const error = await pageResponse.json();
      console.error("[Meta API] Facebook page error:", error);
      return null;
    }
    const pageData = await pageResponse.json();
    const insightsResponse = await fetch(
      `${GRAPH_API_BASE_URL}/${FACEBOOK_PAGE_ID}/insights?metric=page_views_total,page_engaged_users,page_impressions,page_post_engagements,page_impressions_organic&period=days_28&access_token=${META_ACCESS_TOKEN}`
    );
    if (!insightsResponse.ok) {
      const error = await insightsResponse.json();
      console.error("[Meta API] Facebook insights error:", error);
      return {
        fan_count: pageData.fan_count || 0,
        page_views_total: 0,
        page_engaged_users: 0,
        page_impressions: 0,
        page_post_engagements: 0,
        page_impressions_organic: 0
      };
    }
    const insightsData = await insightsResponse.json();
    const insights = {};
    if (insightsData.data) {
      insightsData.data.forEach((metric) => {
        if (metric.values && metric.values.length > 0) {
          insights[metric.name] = metric.values[metric.values.length - 1].value;
        }
      });
    }
    return {
      fan_count: pageData.fan_count || 0,
      page_views_total: insights.page_views_total || 0,
      page_engaged_users: insights.page_engaged_users || 0,
      page_impressions: insights.page_impressions || 0,
      page_post_engagements: insights.page_post_engagements || 0,
      page_impressions_organic: insights.page_impressions_organic || 0
    };
  } catch (error) {
    console.error("[Meta API] Facebook error:", error);
    return null;
  }
}
async function getCombinedSocialMediaStats() {
  const [instagram, facebook] = await Promise.all([
    getInstagramInsights(),
    getFacebookPageInsights()
  ]);
  return {
    instagram,
    facebook,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
}

// server/cron/deactivateExpired.ts
init_db();
init_schema();
import { eq as eq17, and as and10, lte as lte4 } from "drizzle-orm";
async function deactivateExpiredOffers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Cron] Database not available for deactivateExpiredOffers");
    return { success: false, deactivated: 0 };
  }
  try {
    const now = /* @__PURE__ */ new Date();
    const expiredOffers = await db.select().from(offers).where(
      and10(
        eq17(offers.isActive, true),
        lte4(offers.endDate, now)
      )
    );
    if (expiredOffers.length === 0) {
      console.log("[Cron] No expired offers found");
      return { success: true, deactivated: 0 };
    }
    for (const offer of expiredOffers) {
      await db.update(offers).set({ isActive: false }).where(eq17(offers.id, offer.id));
      console.log(`[Cron] Deactivated expired offer: ${offer.title} (ID: ${offer.id})`);
    }
    console.log(`[Cron] Deactivated ${expiredOffers.length} expired offer(s)`);
    return { success: true, deactivated: expiredOffers.length };
  } catch (error) {
    console.error("[Cron] Error deactivating expired offers:", error);
    return { success: false, deactivated: 0, error };
  }
}
async function deactivateExpiredCamps() {
  const db = await getDb();
  if (!db) {
    console.warn("[Cron] Database not available for deactivateExpiredCamps");
    return { success: false, deactivated: 0 };
  }
  try {
    const now = /* @__PURE__ */ new Date();
    const expiredCamps = await db.select().from(camps).where(
      and10(
        eq17(camps.isActive, true),
        lte4(camps.endDate, now)
      )
    );
    if (expiredCamps.length === 0) {
      console.log("[Cron] No expired camps found");
      return { success: true, deactivated: 0 };
    }
    for (const camp of expiredCamps) {
      await db.update(camps).set({ isActive: false }).where(eq17(camps.id, camp.id));
      console.log(`[Cron] Deactivated expired camp: ${camp.name} (ID: ${camp.id})`);
    }
    console.log(`[Cron] Deactivated ${expiredCamps.length} expired camp(s)`);
    return { success: true, deactivated: expiredCamps.length };
  } catch (error) {
    console.error("[Cron] Error deactivating expired camps:", error);
    return { success: false, deactivated: 0, error };
  }
}
async function runDeactivationJobs() {
  console.log("[Cron] Running deactivation jobs...");
  const offersResult = await deactivateExpiredOffers();
  const campsResult = await deactivateExpiredCamps();
  const totalDeactivated = offersResult.deactivated + campsResult.deactivated;
  console.log(`[Cron] Deactivation jobs completed. Total deactivated: ${totalDeactivated}`);
  return {
    success: offersResult.success && campsResult.success,
    offers: offersResult,
    camps: campsResult,
    totalDeactivated
  };
}

// server/routers/queue.ts
import { z as z20 } from "zod";
var queueRouter = router({
  /**
   * Get queue statistics
   */
  getStats: protectedProcedure.query(async () => {
    try {
      const { getQueueStats: getQueueStats2 } = await Promise.resolve().then(() => (init_whatsappQueue(), whatsappQueue_exports));
      const stats = await getQueueStats2();
      return stats;
    } catch (error) {
      console.error("[Queue Router] Failed to get stats:", error);
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        total: 0,
        redisAvailable: false
      };
    }
  }),
  /**
   * Get recent jobs
   */
  getRecentJobs: protectedProcedure.input(
    z20.object({
      limit: z20.number().min(1).max(100).default(20)
    })
  ).query(async ({ input }) => {
    try {
      const { getQueueStats: getQueueStats2 } = await Promise.resolve().then(() => (init_whatsappQueue(), whatsappQueue_exports));
      const stats = await getQueueStats2();
      if (!stats.redisAvailable) {
        return [];
      }
      const { whatsappQueue: whatsappQueue2 } = await Promise.resolve().then(() => (init_whatsappQueue(), whatsappQueue_exports));
      if (!whatsappQueue2) {
        return [];
      }
      const [completed, failed, active, waiting] = await Promise.all([
        whatsappQueue2.getJobs(["completed"], 0, Math.floor(input.limit / 4)),
        whatsappQueue2.getJobs(["failed"], 0, Math.floor(input.limit / 4)),
        whatsappQueue2.getJobs(["active"], 0, Math.floor(input.limit / 4)),
        whatsappQueue2.getJobs(["waiting"], 0, Math.floor(input.limit / 4))
      ]);
      const allJobs = [...completed, ...failed, ...active, ...waiting];
      allJobs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      const formattedJobs = await Promise.all(
        allJobs.slice(0, input.limit).map(async (job) => ({
          id: job.id,
          phone: job.data.to,
          templateName: job.data.templateName,
          bookingType: job.data.metadata?.bookingType || null,
          patientName: job.data.metadata?.patientName || null,
          state: await job.getState(),
          timestamp: job.timestamp || Date.now(),
          attempts: job.attemptsMade,
          error: job.failedReason || null
        }))
      );
      return formattedJobs;
    } catch (error) {
      console.error("[Queue Router] Failed to get recent jobs:", error);
      return [];
    }
  })
});

// server/routers/customers.ts
import { z as z21 } from "zod";
init_db();
init_schema();
import { eq as eq18, desc as desc10, sql as sql6 } from "drizzle-orm";
async function getCustomerByPhone(phone) {
  const db = await getDb();
  if (!db) return null;
  const normalizedPhone = phone.replace(/[\s\-]/g, "");
  const [appointmentRecords, leadRecords, offerLeadRecords, campRegRecords] = await Promise.all([
    db.select({
      id: appointments.id,
      fullName: appointments.fullName,
      phone: appointments.phone,
      email: appointments.email,
      status: appointments.status,
      source: appointments.source,
      doctorId: appointments.doctorId,
      procedure: appointments.procedure,
      appointmentDate: appointments.appointmentDate,
      notes: appointments.notes,
      createdAt: appointments.createdAt,
      doctorName: doctors.name,
      doctorSpecialty: doctors.specialty
    }).from(appointments).leftJoin(doctors, eq18(appointments.doctorId, doctors.id)).where(eq18(appointments.phone, normalizedPhone)).orderBy(desc10(appointments.createdAt)),
    db.select().from(leads).where(eq18(leads.phone, normalizedPhone)).orderBy(desc10(leads.createdAt)),
    db.select({
      id: offerLeads.id,
      fullName: offerLeads.fullName,
      phone: offerLeads.phone,
      email: offerLeads.email,
      status: offerLeads.status,
      source: offerLeads.source,
      notes: offerLeads.notes,
      offerId: offerLeads.offerId,
      createdAt: offerLeads.createdAt,
      offerTitle: offers.title
    }).from(offerLeads).leftJoin(offers, eq18(offerLeads.offerId, offers.id)).where(eq18(offerLeads.phone, normalizedPhone)).orderBy(desc10(offerLeads.createdAt)),
    db.select({
      id: campRegistrations.id,
      fullName: campRegistrations.fullName,
      phone: campRegistrations.phone,
      email: campRegistrations.email,
      status: campRegistrations.status,
      source: campRegistrations.source,
      notes: campRegistrations.notes,
      campId: campRegistrations.campId,
      procedures: campRegistrations.procedures,
      createdAt: campRegistrations.createdAt,
      campName: camps.name
    }).from(campRegistrations).leftJoin(camps, eq18(campRegistrations.campId, camps.id)).where(eq18(campRegistrations.phone, normalizedPhone)).orderBy(desc10(campRegistrations.createdAt))
  ]);
  const allRecords = [
    ...appointmentRecords.map((r) => ({ name: r.fullName, email: r.email, date: r.createdAt })),
    ...leadRecords.map((r) => ({ name: r.fullName, email: r.email, date: r.createdAt })),
    ...offerLeadRecords.map((r) => ({ name: r.fullName, email: r.email, date: r.createdAt })),
    ...campRegRecords.map((r) => ({ name: r.fullName, email: r.email, date: r.createdAt }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestName = allRecords[0]?.name || "";
  const latestEmail = allRecords.find((r) => r.email)?.email || null;
  return {
    phone: normalizedPhone,
    name: latestName,
    email: latestEmail,
    totalInteractions: appointmentRecords.length + leadRecords.length + offerLeadRecords.length + campRegRecords.length,
    firstSeen: allRecords.length > 0 ? allRecords[allRecords.length - 1].date : null,
    lastSeen: allRecords.length > 0 ? allRecords[0].date : null,
    appointments: appointmentRecords,
    leads: leadRecords,
    offerLeads: offerLeadRecords,
    campRegistrations: campRegRecords
  };
}
async function getCustomersPaginated(params) {
  const db = await getDb();
  if (!db) return { customers: [], total: 0 };
  const { page, limit, searchTerm } = params;
  const offset = (page - 1) * limit;
  try {
    const searchFilter = searchTerm && searchTerm.trim() ? sql6`HAVING name LIKE ${`%${searchTerm.trim()}%`} OR phone LIKE ${`%${searchTerm.trim()}%`}` : sql6``;
    const customersResult = await db.execute(
      sql6`SELECT phone, fullName as name, email, MAX(createdAt) as lastSeen, MIN(createdAt) as firstSeen, COUNT(*) as totalRecords
      FROM (
        SELECT phone, fullName, email, createdAt FROM appointments
        UNION ALL
        SELECT phone, fullName, email, createdAt FROM leads
        UNION ALL
        SELECT phone, fullName, email, createdAt FROM offerLeads
        UNION ALL
        SELECT phone, fullName, email, createdAt FROM campRegistrations
      ) AS all_records
      GROUP BY phone
      ${searchFilter}
      ORDER BY lastSeen DESC
      LIMIT ${limit} OFFSET ${offset}`
    );
    const countResult = await db.execute(
      sql6`SELECT COUNT(*) as total FROM (
        SELECT phone
        FROM (
          SELECT phone, fullName as name FROM appointments
          UNION ALL
          SELECT phone, fullName as name FROM leads
          UNION ALL
          SELECT phone, fullName as name FROM offerLeads
          UNION ALL
          SELECT phone, fullName as name FROM campRegistrations
        ) AS all_records
        GROUP BY phone
        ${searchFilter}
      ) AS unique_customers`
    );
    const rows = Array.isArray(customersResult) ? customersResult[0] : customersResult;
    const customers = Array.isArray(rows) ? rows : [];
    const countRows = Array.isArray(countResult) ? countResult[0] : countResult;
    const countArr = Array.isArray(countRows) ? countRows : [];
    const total = countArr.length > 0 ? Number(countArr[0]?.total || 0) : 0;
    console.log(`[Customers] Found ${customers.length} customers, total: ${total}`);
    return {
      customers,
      total
    };
  } catch (error) {
    console.error("[Customers] Error fetching customers:", error);
    return { customers: [], total: 0 };
  }
}
var customersRouter = router({
  /**
   * Get paginated list of all unique customers
   * جلب قائمة العملاء الفريدين مع pagination
   */
  listPaginated: protectedProcedure.input(z21.object({
    page: z21.number().min(1).default(1),
    limit: z21.number().min(1).max(1e3).default(100),
    searchTerm: z21.string().optional()
  })).query(async ({ input }) => {
    return getCustomersPaginated(input);
  }),
  /**
   * Get customer profile by phone number
   * جلب ملف العميل الكامل عبر رقم الهاتف
   */
  getByPhone: protectedProcedure.input(z21.object({
    phone: z21.string().min(1)
  })).query(async ({ input }) => {
    return getCustomerByPhone(input.phone);
  })
});

// server/routers/savedFilters.ts
import { z as z22 } from "zod";
init_db();
init_schema();
import { eq as eq19, and as and12, desc as desc11 } from "drizzle-orm";
var savedFiltersRouter = router({
  /**
   * Get saved filters for a specific page type
   * جلب الفلاتر المحفوظة لنوع صفحة محدد
   */
  list: protectedProcedure.input(z22.object({
    pageType: z22.string()
  })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(savedFilters).where(and12(
      eq19(savedFilters.userId, ctx.user.id),
      eq19(savedFilters.pageType, input.pageType)
    )).orderBy(desc11(savedFilters.updatedAt));
  }),
  /**
   * Save a new filter
   * حفظ فلتر جديد
   */
  create: protectedProcedure.input(z22.object({
    name: z22.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u0641\u0644\u062A\u0631 \u0645\u0637\u0644\u0648\u0628"),
    pageType: z22.string(),
    filterConfig: z22.string(),
    // JSON string
    isDefault: z22.boolean().default(false)
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (input.isDefault) {
      await db.update(savedFilters).set({ isDefault: false }).where(and12(
        eq19(savedFilters.userId, ctx.user.id),
        eq19(savedFilters.pageType, input.pageType)
      ));
    }
    const result = await db.insert(savedFilters).values({
      name: input.name,
      pageType: input.pageType,
      filterConfig: input.filterConfig,
      userId: ctx.user.id,
      isDefault: input.isDefault
    });
    return { success: true, id: Number(result[0].insertId) };
  }),
  /**
   * Update a saved filter
   * تحديث فلتر محفوظ
   */
  update: protectedProcedure.input(z22.object({
    id: z22.number(),
    name: z22.string().min(1).optional(),
    filterConfig: z22.string().optional(),
    isDefault: z22.boolean().optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...updateData } = input;
    if (updateData.isDefault) {
      const filter = await db.select().from(savedFilters).where(and12(
        eq19(savedFilters.id, id),
        eq19(savedFilters.userId, ctx.user.id)
      )).limit(1);
      if (filter.length > 0) {
        await db.update(savedFilters).set({ isDefault: false }).where(and12(
          eq19(savedFilters.userId, ctx.user.id),
          eq19(savedFilters.pageType, filter[0].pageType)
        ));
      }
    }
    await db.update(savedFilters).set(updateData).where(and12(
      eq19(savedFilters.id, id),
      eq19(savedFilters.userId, ctx.user.id)
    ));
    return { success: true };
  }),
  /**
   * Delete a saved filter
   * حذف فلتر محفوظ
   */
  delete: protectedProcedure.input(z22.object({
    id: z22.number()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(savedFilters).where(and12(
      eq19(savedFilters.id, input.id),
      eq19(savedFilters.userId, ctx.user.id)
    ));
    return { success: true };
  })
});

// server/routers/charts.ts
import { z as z23 } from "zod";
init_db();
init_schema();
import { sql as sql7, count as count2 } from "drizzle-orm";
var periodSchema = z23.enum(["7d", "30d", "90d", "12m"]).default("30d");
function getDateRange(period) {
  const now = /* @__PURE__ */ new Date();
  let startDate;
  let groupBy;
  let dateFormat;
  switch (period) {
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
      groupBy = "DATE(createdAt)";
      dateFormat = "%Y-%m-%d";
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
      groupBy = "DATE(createdAt)";
      dateFormat = "%Y-%m-%d";
      break;
    case "90d":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1e3);
      groupBy = "YEARWEEK(createdAt, 1)";
      dateFormat = "%x-W%v";
      break;
    case "12m":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1e3);
      groupBy = "DATE_FORMAT(createdAt, '%Y-%m')";
      dateFormat = "%Y-%m";
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
      groupBy = "DATE(createdAt)";
      dateFormat = "%Y-%m-%d";
  }
  return { startDate, groupBy, dateFormat };
}
var chartsRouter = router({
  /**
   * اتجاه التسجيلات عبر الزمن (خطي)
   * Registrations trend over time - combines leads, appointments, offer leads, camp registrations
   */
  registrationsTrend: protectedProcedure.input(z23.object({ period: periodSchema })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { startDate, groupBy, dateFormat } = getDateRange(input.period);
    const leadsTrend = await db.execute(sql7`
        SELECT DATE_FORMAT(createdAt, ${dateFormat}) as date_label, ${sql7.raw(groupBy)} as date_group, COUNT(*) as total
        FROM leads
        WHERE createdAt >= ${startDate}
        GROUP BY date_group, date_label
        ORDER BY date_group ASC
      `);
    const appointmentsTrend = await db.execute(sql7`
        SELECT DATE_FORMAT(createdAt, ${dateFormat}) as date_label, ${sql7.raw(groupBy)} as date_group, COUNT(*) as total
        FROM appointments
        WHERE createdAt >= ${startDate}
        GROUP BY date_group, date_label
        ORDER BY date_group ASC
      `);
    const offerLeadsTrend = await db.execute(sql7`
        SELECT DATE_FORMAT(createdAt, ${dateFormat}) as date_label, ${sql7.raw(groupBy)} as date_group, COUNT(*) as total
        FROM offerLeads
        WHERE createdAt >= ${startDate}
        GROUP BY date_group, date_label
        ORDER BY date_group ASC
      `);
    const campRegsTrend = await db.execute(sql7`
        SELECT DATE_FORMAT(createdAt, ${dateFormat}) as date_label, ${sql7.raw(groupBy)} as date_group, COUNT(*) as total
        FROM campRegistrations
        WHERE createdAt >= ${startDate}
        GROUP BY date_group, date_label
        ORDER BY date_group ASC
      `);
    const allDates = /* @__PURE__ */ new Set();
    const extractRows = (result) => {
      const rows = Array.isArray(result) ? result : result?.[0] || [];
      return rows.map((r) => ({
        date_label: String(r.date_label),
        total: Number(r.total)
      }));
    };
    const leadsRows = extractRows(leadsTrend);
    const appointmentsRows = extractRows(appointmentsTrend);
    const offerLeadsRows = extractRows(offerLeadsTrend);
    const campRegsRows = extractRows(campRegsTrend);
    [leadsRows, appointmentsRows, offerLeadsRows, campRegsRows].forEach((rows) => {
      rows.forEach((r) => allDates.add(r.date_label));
    });
    const sortedDates = Array.from(allDates).sort();
    const toMap = (rows) => {
      const map = /* @__PURE__ */ new Map();
      rows.forEach((r) => map.set(r.date_label, r.total));
      return map;
    };
    const leadsMap = toMap(leadsRows);
    const appointmentsMap = toMap(appointmentsRows);
    const offerLeadsMap = toMap(offerLeadsRows);
    const campRegsMap = toMap(campRegsRows);
    return {
      labels: sortedDates,
      datasets: {
        leads: sortedDates.map((d) => leadsMap.get(d) || 0),
        appointments: sortedDates.map((d) => appointmentsMap.get(d) || 0),
        offerLeads: sortedDates.map((d) => offerLeadsMap.get(d) || 0),
        campRegistrations: sortedDates.map((d) => campRegsMap.get(d) || 0)
      }
    };
  }),
  /**
   * توزيع حالات العملاء (دائري)
   * Lead status distribution
   */
  leadStatusDistribution: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select({
      status: leads.status,
      total: count2()
    }).from(leads).groupBy(leads.status);
    return result.map((r) => ({
      status: r.status,
      total: r.total
    }));
  }),
  /**
   * التسجيلات حسب المصدر (شريطي)
   * Registrations by source
   */
  registrationsBySource: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const leadsResult = await db.execute(sql7`
        SELECT COALESCE(source, 'غير محدد') as source_name, COUNT(*) as total
        FROM leads
        GROUP BY source_name
        ORDER BY total DESC
        LIMIT 10
      `);
    const appointmentsResult = await db.execute(sql7`
        SELECT COALESCE(source, 'غير محدد') as source_name, COUNT(*) as total
        FROM appointments
        GROUP BY source_name
        ORDER BY total DESC
        LIMIT 10
      `);
    const offerLeadsResult = await db.execute(sql7`
        SELECT COALESCE(source, 'غير محدد') as source_name, COUNT(*) as total
        FROM offerLeads
        GROUP BY source_name
        ORDER BY total DESC
        LIMIT 10
      `);
    const extractRows = (result) => {
      const rows = Array.isArray(result) ? result : result?.[0] || [];
      return rows.map((r) => ({
        source_name: String(r.source_name),
        total: Number(r.total)
      }));
    };
    return {
      leads: extractRows(leadsResult),
      appointments: extractRows(appointmentsResult),
      offerLeads: extractRows(offerLeadsResult)
    };
  }),
  /**
   * أداء العروض والمخيمات (شريطي)
   * Offers and camps performance
   */
  offersAndCampsPerformance: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const offersPerformance = await db.execute(sql7`
        SELECT o.title as name, COUNT(ol.id) as total,
          SUM(CASE WHEN ol.status IN ('confirmed', 'completed', 'booked') THEN 1 ELSE 0 END) as converted
        FROM offers o
        LEFT JOIN offerLeads ol ON o.id = ol.offerId
        GROUP BY o.id, o.title
        ORDER BY total DESC
        LIMIT 8
      `);
    const campsPerformance = await db.execute(sql7`
        SELECT c.name, COUNT(cr.id) as total,
          SUM(CASE WHEN cr.status IN ('confirmed', 'attended') THEN 1 ELSE 0 END) as converted
        FROM camps c
        LEFT JOIN campRegistrations cr ON c.id = cr.campId
        GROUP BY c.id, c.name
        ORDER BY total DESC
        LIMIT 8
      `);
    const extractRows = (result) => {
      const rows = Array.isArray(result) ? result : result?.[0] || [];
      return rows.map((r) => ({
        name: String(r.name),
        total: Number(r.total),
        converted: Number(r.converted || 0)
      }));
    };
    return {
      offers: extractRows(offersPerformance),
      camps: extractRows(campsPerformance)
    };
  }),
  /**
   * إحصائيات المواعيد حسب الحالة (دائري)
   * Appointments by status
   */
  appointmentStatusDistribution: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select({
      status: appointments.status,
      total: count2()
    }).from(appointments).groupBy(appointments.status);
    return result.map((r) => ({
      status: r.status,
      total: r.total
    }));
  }),
  /**
   * إحصائيات واتساب (خطي)
   * WhatsApp messages trend
   */
  whatsappTrend: protectedProcedure.input(z23.object({ period: periodSchema })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { startDate, groupBy, dateFormat } = getDateRange(input.period);
    const inboundTrend = await db.execute(sql7`
        SELECT DATE_FORMAT(createdAt, ${dateFormat}) as date_label, ${sql7.raw(groupBy)} as date_group, COUNT(*) as total
        FROM whatsapp_messages
        WHERE direction = 'inbound' AND createdAt >= ${startDate}
        GROUP BY date_group, date_label
        ORDER BY date_group ASC
      `);
    const outboundTrend = await db.execute(sql7`
        SELECT DATE_FORMAT(createdAt, ${dateFormat}) as date_label, ${sql7.raw(groupBy)} as date_group, COUNT(*) as total
        FROM whatsapp_messages
        WHERE direction = 'outbound' AND createdAt >= ${startDate}
        GROUP BY date_group, date_label
        ORDER BY date_group ASC
      `);
    const extractRows = (result) => {
      const rows = Array.isArray(result) ? result : result?.[0] || [];
      return rows.map((r) => ({
        date_label: String(r.date_label),
        total: Number(r.total)
      }));
    };
    const inboundRows = extractRows(inboundTrend);
    const outboundRows = extractRows(outboundTrend);
    const allDates = /* @__PURE__ */ new Set();
    [inboundRows, outboundRows].forEach((rows) => rows.forEach((r) => allDates.add(r.date_label)));
    const sortedDates = Array.from(allDates).sort();
    const toMap = (rows) => {
      const map = /* @__PURE__ */ new Map();
      rows.forEach((r) => map.set(r.date_label, r.total));
      return map;
    };
    return {
      labels: sortedDates,
      datasets: {
        inbound: sortedDates.map((d) => toMap(inboundRows).get(d) || 0),
        outbound: sortedDates.map((d) => toMap(outboundRows).get(d) || 0)
      }
    };
  }),
  /**
   * ملخص سريع للإحصائيات مع مقارنة بالفترة السابقة
   * Quick summary with period comparison
   */
  summaryComparison: protectedProcedure.input(z23.object({ period: periodSchema })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const now = /* @__PURE__ */ new Date();
    let periodDays;
    switch (input.period) {
      case "7d":
        periodDays = 7;
        break;
      case "30d":
        periodDays = 30;
        break;
      case "90d":
        periodDays = 90;
        break;
      case "12m":
        periodDays = 365;
        break;
      default:
        periodDays = 30;
    }
    const currentStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1e3);
    const previousStart = new Date(currentStart.getTime() - periodDays * 24 * 60 * 60 * 1e3);
    const getCount = async (table, start, end) => {
      const result = await db.execute(sql7`
          SELECT COUNT(*) as total FROM ${table}
          WHERE createdAt >= ${start} AND createdAt < ${end}
        `);
      const rows = Array.isArray(result) ? result : result?.[0] || [];
      return Number(rows[0]?.total || 0);
    };
    const [
      currentLeads,
      previousLeads,
      currentAppointments,
      previousAppointments,
      currentOfferLeads,
      previousOfferLeads,
      currentCampRegs,
      previousCampRegs
    ] = await Promise.all([
      getCount(leads, currentStart, now),
      getCount(leads, previousStart, currentStart),
      getCount(appointments, currentStart, now),
      getCount(appointments, previousStart, currentStart),
      getCount(offerLeads, currentStart, now),
      getCount(offerLeads, previousStart, currentStart),
      getCount(campRegistrations, currentStart, now),
      getCount(campRegistrations, previousStart, currentStart)
    ]);
    const calcChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round((current - previous) / previous * 100);
    };
    return {
      leads: { current: currentLeads, previous: previousLeads, change: calcChange(currentLeads, previousLeads) },
      appointments: { current: currentAppointments, previous: previousAppointments, change: calcChange(currentAppointments, previousAppointments) },
      offerLeads: { current: currentOfferLeads, previous: previousOfferLeads, change: calcChange(currentOfferLeads, previousOfferLeads) },
      campRegistrations: { current: currentCampRegs, previous: previousCampRegs, change: calcChange(currentCampRegs, previousCampRegs) },
      total: {
        current: currentLeads + currentAppointments + currentOfferLeads + currentCampRegs,
        previous: previousLeads + previousAppointments + previousOfferLeads + previousCampRegs,
        change: calcChange(
          currentLeads + currentAppointments + currentOfferLeads + currentCampRegs,
          previousLeads + previousAppointments + previousOfferLeads + previousCampRegs
        )
      }
    };
  })
});

// server/routers/patientPortal.ts
import { z as z24 } from "zod";
import { TRPCError as TRPCError5 } from "@trpc/server";
import jwt from "jsonwebtoken";

// server/db/patients.ts
init_db();
init_schema();
import { eq as eq21, and as and14, gt, desc as desc12 } from "drizzle-orm";
async function getPatientByPhone(phone) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(patients).where(eq21(patients.phone, phone)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getPatientById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(patients).where(eq21(patients.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function createPatient(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(patients).values({
    fullName: data.fullName,
    phone: data.phone,
    address: data.address || null,
    age: data.age || null,
    gender: data.gender,
    email: data.email || null
  });
  return getPatientByPhone(data.phone);
}
async function updatePatientLastLogin(patientId) {
  const db = await getDb();
  if (!db) return;
  await db.update(patients).set({ lastLoginAt: /* @__PURE__ */ new Date() }).where(eq21(patients.id, patientId));
}
async function updatePatientProfile(patientId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData = {};
  if (data.fullName) updateData.fullName = data.fullName;
  if (data.address !== void 0) updateData.address = data.address;
  if (data.age !== void 0) updateData.age = data.age;
  if (data.email !== void 0) updateData.email = data.email;
  if (Object.keys(updateData).length > 0) {
    await db.update(patients).set(updateData).where(eq21(patients.id, patientId));
  }
  return getPatientById(patientId);
}
async function createOtp(phone) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const code = Math.floor(1e5 + Math.random() * 9e5).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1e3);
  await db.update(patientOtps).set({ isUsed: true }).where(and14(eq21(patientOtps.phone, phone), eq21(patientOtps.isUsed, false)));
  await db.insert(patientOtps).values({
    phone,
    code,
    expiresAt
  });
  return code;
}
async function verifyOtp(phone, code) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(patientOtps).where(
    and14(
      eq21(patientOtps.phone, phone),
      eq21(patientOtps.code, code),
      eq21(patientOtps.isUsed, false),
      gt(patientOtps.expiresAt, /* @__PURE__ */ new Date())
    )
  ).limit(1);
  if (result.length === 0) return false;
  await db.update(patientOtps).set({ isUsed: true }).where(eq21(patientOtps.id, result[0].id));
  return true;
}
async function getPatientAppointments(phone) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(appointments).where(eq21(appointments.phone, phone)).orderBy(desc12(appointments.createdAt));
  return result;
}
async function getPatientOfferLeads(phone) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(offerLeads).where(eq21(offerLeads.phone, phone)).orderBy(desc12(offerLeads.createdAt));
  return result;
}
async function getPatientCampRegistrations(phone) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(campRegistrations).where(eq21(campRegistrations.phone, phone)).orderBy(desc12(campRegistrations.createdAt));
  return result;
}
async function getPatientResults(patientId) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(patientResults).where(eq21(patientResults.patientId, patientId)).orderBy(desc12(patientResults.createdAt));
  return result;
}

// server/routers/patientPortal.ts
var PATIENT_JWT_SECRET = process.env.JWT_SECRET || "patient-portal-secret";
var PATIENT_COOKIE_NAME = "patient_session";
function createPatientToken(patientId, phone) {
  return jwt.sign({ patientId, phone, type: "patient" }, PATIENT_JWT_SECRET, { expiresIn: "30d" });
}
function verifyPatientToken(token) {
  try {
    const decoded = jwt.verify(token, PATIENT_JWT_SECRET);
    if (decoded.type !== "patient") return null;
    return { patientId: decoded.patientId, phone: decoded.phone };
  } catch {
    return null;
  }
}
var patientProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const token = ctx.req.cookies?.[PATIENT_COOKIE_NAME];
  if (!token) {
    throw new TRPCError5({ code: "UNAUTHORIZED", message: "\u064A\u0631\u062C\u0649 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
  }
  const decoded = verifyPatientToken(token);
  if (!decoded) {
    throw new TRPCError5({ code: "UNAUTHORIZED", message: "\u062C\u0644\u0633\u0629 \u0645\u0646\u062A\u0647\u064A\u0629\u060C \u064A\u0631\u062C\u0649 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649" });
  }
  const patient = await getPatientById(decoded.patientId);
  if (!patient || !patient.isActive) {
    throw new TRPCError5({ code: "UNAUTHORIZED", message: "\u0627\u0644\u062D\u0633\u0627\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u0645\u0639\u0637\u0644" });
  }
  return next({
    ctx: { ...ctx, patient }
  });
});
var patientPortalRouter = router({
  // إرسال رمز التحقق
  sendOtp: publicProcedure.input(z24.object({
    phone: z24.string().min(9, "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D").max(15)
  })).mutation(async ({ input }) => {
    const code = await createOtp(input.phone);
    console.log(`[PatientPortal] OTP for ${input.phone}: ${code}`);
    return {
      success: true,
      message: "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642",
      // في الإنتاج، لا نعيد الرمز - فقط للتطوير
      devCode: process.env.NODE_ENV === "development" ? code : void 0
    };
  }),
  // التحقق من الرمز وتسجيل الدخول
  verifyOtp: publicProcedure.input(z24.object({
    phone: z24.string().min(9).max(15),
    code: z24.string().length(6, "\u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 6 \u0623\u0631\u0642\u0627\u0645")
  })).mutation(async ({ ctx, input }) => {
    const isValid = await verifyOtp(input.phone, input.code);
    if (!isValid) {
      throw new TRPCError5({ code: "BAD_REQUEST", message: "\u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D \u0623\u0648 \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629" });
    }
    const patient = await getPatientByPhone(input.phone);
    if (!patient) {
      return { success: true, needsRegistration: true, phone: input.phone };
    }
    await updatePatientLastLogin(patient.id);
    const token = createPatientToken(patient.id, patient.phone);
    ctx.res.cookie(PATIENT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1e3,
      // 30 days
      path: "/"
    });
    return { success: true, needsRegistration: false, patient };
  }),
  // تسجيل مريض جديد
  register: publicProcedure.input(z24.object({
    phone: z24.string().min(9).max(15),
    code: z24.string().length(6),
    fullName: z24.string().min(3, "\u0627\u0644\u0627\u0633\u0645 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 3 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
    address: z24.string().optional(),
    age: z24.number().min(1).max(150).optional(),
    gender: z24.enum(["male", "female"]),
    email: z24.string().email().optional()
  })).mutation(async ({ ctx, input }) => {
    const isValid = await verifyOtp(input.phone, input.code);
    if (!isValid) {
      throw new TRPCError5({ code: "BAD_REQUEST", message: "\u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D \u0623\u0648 \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629" });
    }
    const existing = await getPatientByPhone(input.phone);
    if (existing) {
      throw new TRPCError5({ code: "CONFLICT", message: "\u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645 \u0645\u0633\u062C\u0644 \u0645\u0633\u0628\u0642\u0627\u064B" });
    }
    const patient = await createPatient({
      fullName: input.fullName,
      phone: input.phone,
      address: input.address,
      age: input.age,
      gender: input.gender,
      email: input.email
    });
    if (!patient) {
      throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "\u0641\u0634\u0644 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062D\u0633\u0627\u0628" });
    }
    await updatePatientLastLogin(patient.id);
    const token = createPatientToken(patient.id, patient.phone);
    ctx.res.cookie(PATIENT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1e3,
      path: "/"
    });
    return { success: true, patient };
  }),
  // الحصول على بيانات المريض الحالي
  me: publicProcedure.query(async ({ ctx }) => {
    const token = ctx.req.cookies?.[PATIENT_COOKIE_NAME];
    if (!token) return null;
    const decoded = verifyPatientToken(token);
    if (!decoded) return null;
    const patient = await getPatientById(decoded.patientId);
    return patient;
  }),
  // تسجيل الخروج
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(PATIENT_COOKIE_NAME, { path: "/" });
    return { success: true };
  }),
  // تحديث الملف الشخصي
  updateProfile: patientProcedure.input(z24.object({
    fullName: z24.string().min(3).optional(),
    address: z24.string().optional(),
    age: z24.number().min(1).max(150).optional(),
    email: z24.string().email().optional()
  })).mutation(async ({ ctx, input }) => {
    const updated = await updatePatientProfile(ctx.patient.id, input);
    return updated;
  }),
  // الحصول على حجوزات المريض (مواعيد الأطباء)
  myAppointments: patientProcedure.query(async ({ ctx }) => {
    return getPatientAppointments(ctx.patient.phone);
  }),
  // الحصول على حجوزات العروض
  myOfferBookings: patientProcedure.query(async ({ ctx }) => {
    return getPatientOfferLeads(ctx.patient.phone);
  }),
  // الحصول على تسجيلات المخيمات
  myCampRegistrations: patientProcedure.query(async ({ ctx }) => {
    return getPatientCampRegistrations(ctx.patient.phone);
  }),
  // الحصول على النتائج والتقارير
  myResults: patientProcedure.query(async ({ ctx }) => {
    return getPatientResults(ctx.patient.id);
  })
});

// server/pdfService.ts
import PDFDocument from "pdfkit";
import path from "path";
var AMIRI_REGULAR = path.join(process.cwd(), "server", "fonts", "Amiri-Regular.ttf");
var AMIRI_BOLD = path.join(process.cwd(), "server", "fonts", "Amiri-Bold.ttf");
function addHeader(doc, metadata) {
  const logoPath = "/home/ubuntu/sgh-crm-portal/client/public/sgh-logo-full.png";
  try {
    doc.image(logoPath, doc.page.width - 200, 30, { width: 150 });
  } catch (error) {
    console.warn("Could not load logo:", error);
  }
  doc.fontSize(10).font(AMIRI_REGULAR).text("8000018", 50, 40, { align: "left" }).text("info@sghsanaa.net", 50, 55, { align: "left" });
  doc.moveTo(50, 100).lineTo(doc.page.width - 50, 100).stroke();
  doc.fontSize(16).font(AMIRI_BOLD).text(metadata.tableName, 50, 120, {
    align: "center",
    width: doc.page.width - 100
  });
  let yPos = 150;
  if (metadata.dateRange) {
    doc.fontSize(10).font(AMIRI_REGULAR).text(`\u0646\u0637\u0627\u0642 \u0627\u0644\u062A\u0627\u0631\u064A\u062E: ${metadata.dateRange}`, 50, yPos, { align: "right" });
    yPos += 20;
  }
  if (metadata.filters && Object.keys(metadata.filters).length > 0) {
    const filtersText = Object.entries(metadata.filters).map(([key, value]) => `${key}: ${value}`).join(" | ");
    doc.text(`\u0627\u0644\u0641\u0644\u0627\u062A\u0631: ${filtersText}`, 50, yPos, { align: "right" });
    yPos += 20;
  }
  doc.text(
    `\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0633\u062C\u0644\u0627\u062A: ${metadata.totalRecords} | \u0627\u0644\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0645\u0635\u062F\u0631\u0629: ${metadata.exportedRecords}`,
    50,
    yPos,
    { align: "right" }
  );
  return yPos + 30;
}
function addFooter(doc, metadata) {
  const pageHeight = doc.page.height;
  const footerY = pageHeight - 50;
  doc.moveTo(50, footerY - 10).lineTo(doc.page.width - 50, footerY - 10).stroke();
  doc.fontSize(9).font(AMIRI_REGULAR).text(metadata.exportDate, 50, footerY, { align: "left" });
  doc.text("\u0646\u0631\u0639\u0627\u0643\u0645 \u0643\u0623\u0647\u0627\u0644\u064A\u0646\u0627", 0, footerY, {
    align: "center",
    width: doc.page.width
  });
  doc.text(metadata.exportedBy, doc.page.width - 200, footerY, {
    align: "right",
    width: 150
  });
}
function addTable(doc, columns, data, startY) {
  const tableTop = startY;
  const tableLeft = 50;
  const tableWidth = doc.page.width - 100;
  const columnWidth = tableWidth / columns.length;
  const rowHeight = 25;
  let yPos = tableTop;
  doc.fontSize(10).font(AMIRI_BOLD).fillColor("#2D6A4F");
  const reversedColumns = [...columns].reverse();
  reversedColumns.forEach((col, index2) => {
    const xPos = tableLeft + index2 * columnWidth;
    doc.rect(xPos, yPos, columnWidth, rowHeight).fillAndStroke("#E8F5E9", "#2D6A4F");
    doc.fillColor("#000").text(col.label, xPos + 5, yPos + 7, {
      width: columnWidth - 10,
      align: "center"
    });
  });
  yPos += rowHeight;
  doc.fontSize(9).font(AMIRI_REGULAR);
  data.forEach((row, rowIndex) => {
    if (yPos > doc.page.height - 100) {
      doc.addPage();
      yPos = 50;
    }
    const fillColor = rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5";
    reversedColumns.forEach((col, colIndex) => {
      const xPos = tableLeft + colIndex * columnWidth;
      const cellValue = row[col.key]?.toString() || "-";
      doc.rect(xPos, yPos, columnWidth, rowHeight).fillAndStroke(fillColor, "#CCCCCC");
      doc.fillColor("#000").text(cellValue, xPos + 5, yPos + 7, {
        width: columnWidth - 10,
        align: "center",
        ellipsis: true
      });
    });
    yPos += rowHeight;
  });
}
async function generatePDF(options) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      const contentStartY = addHeader(doc, options.metadata);
      addTable(doc, options.columns, options.data, contentStartY);
      addFooter(doc, options.metadata);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// server/routers.ts
var appRouter = router({
  campaigns: campaignsRouter,
  tasks: tasksRouter,
  system: systemRouter,
  charts: chartsRouter,
  patientPortal: patientPortalRouter,
  whatsapp: whatsappRouter,
  whatsappBroadcasts: whatsappBroadcastsRouter,
  messageSettings: messageSettingsRouter,
  webhooks: webhooksRouter,
  queue: queueRouter,
  // User Preferences
  preferences: router({
    get: protectedProcedure.input(z25.object({ key: z25.string() })).query(async ({ ctx, input }) => {
      const { getUserPreference: getUserPreference2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const pref = await getUserPreference2(ctx.user.id, input.key);
      return pref ? JSON.parse(pref.preferenceValue) : null;
    }),
    set: protectedProcedure.input(z25.object({
      key: z25.string(),
      value: z25.any()
    })).mutation(async ({ ctx, input }) => {
      const { setUserPreference: setUserPreference2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      await setUserPreference2(
        ctx.user.id,
        input.key,
        JSON.stringify(input.value)
      );
      return { success: true };
    }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
      const { getAllUserPreferences: getAllUserPreferences2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const prefs = await getAllUserPreferences2(ctx.user.id);
      return prefs.reduce((acc, pref) => {
        acc[pref.preferenceKey] = JSON.parse(pref.preferenceValue);
        return acc;
      }, {});
    })
  }),
  // Shared Column Templates (admin-managed, visible to all)
  sharedTemplates: router({
    list: protectedProcedure.input(z25.object({ tableKey: z25.string() })).query(async ({ input }) => {
      const { getSharedTemplates: getSharedTemplates2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const templates = await getSharedTemplates2(input.tableKey);
      return templates.map((t2) => ({
        ...t2,
        columns: JSON.parse(t2.columns)
      }));
    }),
    listAll: protectedProcedure.query(async () => {
      const { getAllSharedTemplates: getAllSharedTemplates2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const templates = await getAllSharedTemplates2();
      return templates.map((t2) => ({
        ...t2,
        columns: JSON.parse(t2.columns)
      }));
    }),
    create: protectedProcedure.input(z25.object({
      name: z25.string().min(1),
      tableKey: z25.string(),
      columns: z25.record(z25.string(), z25.boolean())
    })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643 \u0628\u0625\u0646\u0634\u0627\u0621 \u0642\u0648\u0627\u0644\u0628 \u0645\u0634\u062A\u0631\u0643\u0629");
      }
      const { createSharedTemplate: createSharedTemplate2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      await createSharedTemplate2({
        name: input.name,
        tableKey: input.tableKey,
        columns: JSON.stringify(input.columns),
        createdBy: ctx.user.id,
        createdByName: ctx.user.name || null
      });
      return { success: true };
    }),
    delete: protectedProcedure.input(z25.object({ id: z25.number() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643 \u0628\u062D\u0630\u0641 \u0642\u0648\u0627\u0644\u0628 \u0645\u0634\u062A\u0631\u0643\u0629");
      }
      const { deleteSharedTemplate: deleteSharedTemplate2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      await deleteSharedTemplate2(input.id);
      return { success: true };
    }),
    update: protectedProcedure.input(z25.object({
      id: z25.number(),
      name: z25.string().optional(),
      columns: z25.record(z25.string(), z25.boolean()).optional()
    })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643 \u0628\u062A\u0639\u062F\u064A\u0644 \u0642\u0648\u0627\u0644\u0628 \u0645\u0634\u062A\u0631\u0643\u0629");
      }
      const { updateSharedTemplate: updateSharedTemplate2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      await updateSharedTemplate2(input.id, {
        name: input.name,
        columns: input.columns ? JSON.stringify(input.columns) : void 0
      });
      return { success: true };
    })
  }),
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    }),
    updateProfile: protectedProcedure.input(z25.object({
      name: z25.string().min(2, "\u0627\u0644\u0627\u0633\u0645 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u062D\u0631\u0641\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644").optional(),
      email: z25.string().email("\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D").optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("\u0641\u0634\u0644 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A");
      const updateData = {};
      if (input.name !== void 0) updateData.name = input.name;
      if (input.email !== void 0) updateData.email = input.email;
      if (Object.keys(updateData).length === 0) {
        throw new Error("\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0644\u0644\u062A\u062D\u062F\u064A\u062B");
      }
      await db.update(users).set(updateData).where(eq22(users.id, ctx.user.id));
      const updatedUser = await db.select().from(users).where(eq22(users.id, ctx.user.id)).limit(1);
      return updatedUser[0];
    })
  }),
  // Leads management
  leads: leadsRouter,
  // Doctors router
  doctors: doctorsRouter,
  // Appointments router
  appointments: appointmentsRouter,
  // Offers management
  offers: offersRouter,
  // Camps management
  camps: campsRouter,
  // Offer leads management
  offerLeads: offerLeadsRouter,
  // Camp registrations management
  campRegistrations: campRegistrationsRouter,
  // Customer profiles (unified)
  customers: customersRouter,
  // Audit logs
  auditLogs: auditLogsRouter,
  // Saved filters
  savedFilters: savedFiltersRouter,
  // Social Media Insights
  socialMedia: router({
    getStats: protectedProcedure.query(async () => {
      const stats = await getCombinedSocialMediaStats();
      return stats;
    })
  }),
  accessRequests: router({
    list: protectedProcedure.query(async () => {
      return getAllAccessRequests();
    }),
    pending: protectedProcedure.query(async () => {
      return getPendingAccessRequests();
    }),
    approve: protectedProcedure.input(z25.object({ requestId: z25.number() })).mutation(async ({ ctx, input }) => {
      await approveAccessRequest(input.requestId, ctx.user.id);
      await notifyOwner({
        title: "\u062A\u0645 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0637\u0644\u0628 \u062A\u0635\u0631\u064A\u062D",
        content: `\u062A\u0645\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0637\u0644\u0628 \u0627\u0644\u062A\u0635\u0631\u064A\u062D \u0631\u0642\u0645 ${input.requestId}`
      });
      return { success: true };
    }),
    reject: protectedProcedure.input(z25.object({ requestId: z25.number() })).mutation(async ({ ctx, input }) => {
      await rejectAccessRequest(input.requestId, ctx.user.id);
      return { success: true };
    })
  }),
  // Users management (admin only)
  users: usersRouter,
  // Reports (admin only)
  reports: reportsRouter,
  // Cron jobs (admin only)
  cron: router({
    // Run deactivation jobs manually
    runDeactivation: protectedProcedure.mutation(async () => {
      const result = await runDeactivationJobs();
      return result;
    })
  }),
  // Comments system
  comments: commentsRouter,
  followUpTasks: followUpTasksRouter,
  // Sidebar badges - aggregated counts for sidebar icons
  sidebarBadges: protectedProcedure.query(async () => {
    try {
      const { getLeadsStats: getLeadsStats2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { getTasksStats: getTasksStats2 } = await Promise.resolve().then(() => (init_tasks(), tasks_exports));
      const { getUnreadWhatsAppConversationsCount: getUnreadWhatsAppConversationsCount2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { getPendingAccessRequests: getPendingAccessRequests2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const [leadsStats, tasksStats, whatsappUnread, pendingAccess] = await Promise.allSettled([
        getLeadsStats2(),
        getTasksStats2(),
        getUnreadWhatsAppConversationsCount2(),
        getPendingAccessRequests2()
      ]);
      const newLeads = leadsStats.status === "fulfilled" && leadsStats.value ? Number(leadsStats.value.new) || 0 : 0;
      const pendingTasks = tasksStats.status === "fulfilled" && tasksStats.value ? (Number(tasksStats.value.todo) || 0) + (Number(tasksStats.value.overdue) || 0) : 0;
      const unreadMessages = whatsappUnread.status === "fulfilled" ? Number(whatsappUnread.value) || 0 : 0;
      const pendingAccessCount = pendingAccess.status === "fulfilled" ? pendingAccess.value.length : 0;
      return {
        leads: newLeads,
        tasks: pendingTasks,
        whatsapp: unreadMessages,
        management: pendingAccessCount
      };
    } catch (error) {
      console.error("[SidebarBadges] Error fetching badge counts:", error);
      return { leads: 0, tasks: 0, whatsapp: 0, management: 0 };
    }
  }),
  // Export to PDF
  export: router({
    generatePDF: protectedProcedure.input(z25.object({
      metadata: z25.object({
        tableName: z25.string(),
        dateRange: z25.string().optional(),
        filters: z25.record(z25.string(), z25.unknown()).optional(),
        totalRecords: z25.number(),
        exportedRecords: z25.number(),
        exportDate: z25.string(),
        exportedBy: z25.string()
      }),
      columns: z25.array(z25.object({
        key: z25.string(),
        label: z25.string()
      })),
      data: z25.array(z25.record(z25.string(), z25.any()))
    })).mutation(async ({ input }) => {
      try {
        const pdfBuffer = await generatePDF({
          metadata: input.metadata,
          columns: input.columns,
          data: input.data
        });
        const base64 = pdfBuffer.toString("base64");
        return { success: true, pdf: base64 };
      } catch (error) {
        console.error("PDF generation error:", error);
        throw new Error("\u0641\u0634\u0644 \u0625\u0646\u0634\u0627\u0621 \u0645\u0644\u0641 PDF");
      }
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path3 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path2.resolve(import.meta.dirname),
  root: path2.resolve(import.meta.dirname, "client"),
  publicDir: path2.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    hmr: {
      protocol: "wss",
      host: process.env.VITE_HMR_HOST || void 0,
      clientPort: 443
    },
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path3.resolve(import.meta.dirname, "../..", "dist", "public") : path3.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(createUploadRouter());
  app.use(createWebhookRouter());
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
