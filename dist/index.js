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
  campRegistrations: () => campRegistrations,
  campaigns: () => campaigns,
  camps: () => camps,
  doctors: () => doctors,
  leadStatusHistory: () => leadStatusHistory,
  leads: () => leads,
  offerLeads: () => offerLeads,
  offers: () => offers,
  settings: () => settings,
  users: () => users
});
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";
var users, campaigns, leads, leadStatusHistory, settings, doctors, appointments, accessRequests, offers, camps, offerLeads, campRegistrations;
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
      role: mysqlEnum("role", ["user", "admin", "manager", "staff", "viewer"]).default("user").notNull(),
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
      startDate: timestamp("startDate"),
      endDate: timestamp("endDate"),
      isActive: boolean("isActive").default(true).notNull(),
      metaPixelId: varchar("metaPixelId", { length: 100 }),
      metaAccessToken: text("metaAccessToken"),
      whatsappEnabled: boolean("whatsappEnabled").default(false).notNull(),
      whatsappWelcomeMessage: text("whatsappWelcomeMessage"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    leads = mysqlTable("leads", {
      id: int("id").autoincrement().primaryKey(),
      campaignId: int("campaignId").notNull(),
      fullName: varchar("fullName", { length: 255 }).notNull(),
      phone: varchar("phone", { length: 20 }).notNull(),
      email: varchar("email", { length: 320 }),
      status: mysqlEnum("status", ["new", "contacted", "booked", "not_interested", "no_answer"]).default("new").notNull(),
      source: varchar("source", { length: 100 }),
      utmSource: varchar("utmSource", { length: 100 }),
      utmMedium: varchar("utmMedium", { length: 100 }),
      utmCampaign: varchar("utmCampaign", { length: 100 }),
      utmContent: varchar("utmContent", { length: 100 }),
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
      utmContent: varchar("utmContent", { length: 100 }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
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
      fullName: varchar("fullName", { length: 255 }).notNull(),
      phone: varchar("phone", { length: 20 }).notNull(),
      email: varchar("email", { length: 320 }),
      notes: text("notes"),
      status: mysqlEnum("status", ["new", "contacted", "booked", "not_interested", "no_answer"]).default("new").notNull(),
      statusNotes: text("statusNotes"),
      source: varchar("source", { length: 100 }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    campRegistrations = mysqlTable("campRegistrations", {
      id: int("id").autoincrement().primaryKey(),
      campId: int("campId").notNull(),
      fullName: varchar("fullName", { length: 255 }).notNull(),
      phone: varchar("phone", { length: 20 }).notNull(),
      email: varchar("email", { length: 320 }),
      age: int("age"),
      procedures: text("procedures"),
      // JSON array of selected procedures
      medicalCondition: text("medicalCondition"),
      notes: text("notes"),
      status: mysqlEnum("status", ["pending", "confirmed", "attended", "cancelled"]).default("pending").notNull(),
      statusNotes: text("statusNotes"),
      source: varchar("source", { length: 100 }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  approveAccessRequest: () => approveAccessRequest,
  createAccessRequest: () => createAccessRequest,
  createAppointment: () => createAppointment,
  createCampaign: () => createCampaign,
  createLead: () => createLead,
  createLeadStatusHistory: () => createLeadStatusHistory,
  getAllAccessRequests: () => getAllAccessRequests,
  getAllAppointments: () => getAllAppointments,
  getAllCampaigns: () => getAllCampaigns,
  getAllDoctors: () => getAllDoctors,
  getAllLeads: () => getAllLeads,
  getAllUnifiedLeads: () => getAllUnifiedLeads,
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
  getPendingAccessRequests: () => getPendingAccessRequests,
  getSetting: () => getSetting,
  getUserByEmail: () => getUserByEmail,
  getUserById: () => getUserById,
  getUserByOpenId: () => getUserByOpenId,
  getUserByUsername: () => getUserByUsername,
  isUserAllowed: () => isUserAllowed,
  rejectAccessRequest: () => rejectAccessRequest,
  searchLeads: () => searchLeads,
  updateAppointmentStatus: () => updateAppointmentStatus,
  updateCampaign: () => updateCampaign,
  updateLead: () => updateLead,
  upsertSetting: () => upsertSetting,
  upsertUser: () => upsertUser
});
import { eq, desc, like, or, sql } from "drizzle-orm";
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
    await db.insert(appointments).values(appointment);
    return { success: true };
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
    status: appointments.status,
    utmSource: appointments.utmSource,
    utmMedium: appointments.utmMedium,
    utmCampaign: appointments.utmCampaign,
    utmContent: appointments.utmContent,
    createdAt: appointments.createdAt,
    updatedAt: appointments.updatedAt,
    doctorName: doctors.name,
    doctorSpecialty: doctors.specialty
  }).from(appointments).leftJoin(doctors, eq(appointments.doctorId, doctors.id));
  return result;
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
    const { offerLeads: offerLeads2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const offerLeadsData = await db.select({
      id: offerLeads2.id,
      fullName: offerLeads2.fullName,
      phone: offerLeads2.phone,
      email: offerLeads2.email,
      notes: offerLeads2.notes,
      status: offerLeads2.status,
      createdAt: offerLeads2.createdAt,
      source: offerLeads2.source,
      offerId: offerLeads2.offerId
    }).from(offerLeads2).orderBy(desc(offerLeads2.createdAt));
    const { campRegistrations: campRegistrations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const campRegistrationsData = await db.select({
      id: campRegistrations2.id,
      fullName: campRegistrations2.fullName,
      phone: campRegistrations2.phone,
      email: campRegistrations2.email,
      notes: campRegistrations2.notes,
      status: campRegistrations2.status,
      createdAt: campRegistrations2.createdAt,
      source: campRegistrations2.source,
      campId: campRegistrations2.campId
    }).from(campRegistrations2).orderBy(desc(campRegistrations2.createdAt));
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
var _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    _db = null;
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
      const { eq: eq10 } = await import("drizzle-orm");
      const { users: users2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const dbConn = await getDb();
      if (dbConn) {
        await dbConn.update(users2).set({ lastSignedIn: signedInAt }).where(eq10(users2.email, user.email));
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
        const { eq: eq10 } = await import("drizzle-orm");
        const { users: users2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const dbConn = await getDb();
        if (dbConn) {
          await dbConn.update(users2).set({ lastSignedIn: /* @__PURE__ */ new Date() }).where(eq10(users2.id, user.id));
        }
      }
      res.redirect(302, "/admin");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/routers.ts
init_db();
init_schema();
import { z as z8 } from "zod";
import { eq as eq9 } from "drizzle-orm";

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
import { eq as eq2, and as and2 } from "drizzle-orm";

// shared/_core/utils/slug.ts
function generateSlug(text2) {
  return text2.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}
function isValidSlug(slug) {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 255;
}

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
    try {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");
      const allOffers = await dbInstance.select().from(offers).where(eq2(offers.isActive, true)).orderBy(offers.createdAt);
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
      const offer = await dbInstance.select().from(offers).where(and2(eq2(offers.slug, input.slug), eq2(offers.isActive, true))).limit(1);
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
      const existingOffer = await dbInstance.select().from(offers).where(eq2(offers.slug, slug)).limit(1);
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
      }).where(eq2(offers.id, input.id));
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
      await dbInstance.update(offers).set({ isActive: false }).where(eq2(offers.id, input.id));
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
      await dbInstance.delete(offers).where(eq2(offers.id, input.id));
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
import { eq as eq3, and as and3, desc as desc2 } from "drizzle-orm";
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
    const db = await getDb();
    if (!db) return [];
    const result = await db.select().from(camps).where(eq3(camps.isActive, true)).orderBy(desc2(camps.createdAt));
    return result;
  }),
  /**
   * Get all camps for admin (includes inactive)
   * الحصول على جميع المخيمات للإدارة (يشمل غير النشطة)
   */
  getAllAdmin: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const result = await db.select().from(camps).orderBy(desc2(camps.createdAt));
    return result;
  }),
  /**
   * Get camp by ID
   * الحصول على مخيم بواسطة المعرف
   */
  getById: publicProcedure.input(z3.object({ id: z3.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(camps).where(eq3(camps.id, input.id)).limit(1);
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
      eq3(camps.slug, input.slug),
      eq3(camps.isActive, true)
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
    const existing = await db.select().from(camps).where(eq3(camps.slug, slug)).limit(1);
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
        eq3(camps.slug, data.slug)
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
    }).where(eq3(camps.id, id));
    return { success: true };
  }),
  /**
   * Delete camp (admin only)
   * حذف مخيم (للإدارة فقط)
   */
  delete: protectedProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(camps).where(eq3(camps.id, input.id));
    return { success: true };
  }),
  /**
   * Toggle camp active status (admin only)
   * تبديل حالة نشاط المخيم (للإدارة فقط)
   */
  toggleActive: protectedProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const current = await db.select().from(camps).where(eq3(camps.id, input.id)).limit(1);
    if (current.length === 0) {
      throw new Error("\u0627\u0644\u0645\u062E\u064A\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
    }
    await db.update(camps).set({ isActive: !current[0].isActive }).where(eq3(camps.id, input.id));
    return { success: true, isActive: !current[0].isActive };
  })
});

// server/routers/offerLeads.ts
import { z as z4 } from "zod";
import { eq as eq4, desc as desc3 } from "drizzle-orm";
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

// server/routers/offerLeads.ts
var offerLeadsRouter = router({
  // Submit a new offer lead (public)
  submit: publicProcedure.input(
    z4.object({
      offerId: z4.number(),
      fullName: z4.string().min(1),
      phone: z4.string().min(1),
      email: z4.string().email().optional(),
      notes: z4.string().optional(),
      source: z4.string().optional()
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
      status: "new"
    });
    const { offers: offers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const [offer] = await db.select().from(offers2).where(eq4(offers2.id, input.offerId)).limit(1);
    if (offer) {
      await sendNewOfferLeadTelegram({
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        offerTitle: offer.title
      });
    }
    return { success: true, id: lead.insertId };
  }),
  // List all offer leads (protected)
  list: protectedProcedure.query(async () => {
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
    }).from(offerLeads).leftJoin(offers2, eq4(offers2.id, offerLeads.offerId)).orderBy(desc3(offerLeads.createdAt));
    return results;
  }),
  // Get stats for offer leads (protected)
  stats: protectedProcedure.query(async () => {
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
  }),
  // Update offer lead status (protected)
  updateStatus: protectedProcedure.input(
    z4.object({
      id: z4.number(),
      status: z4.enum(["new", "contacted", "booked", "not_interested", "no_answer"]),
      notes: z4.string().optional()
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(offerLeads).set({
      status: input.status,
      statusNotes: input.notes,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq4(offerLeads.id, input.id));
    return { success: true };
  }),
  // Delete offer lead (protected)
  delete: protectedProcedure.input(z4.object({ id: z4.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(offerLeads).where(eq4(offerLeads.id, input.id));
    return { success: true };
  })
});

// server/routers/campRegistrations.ts
import { z as z5 } from "zod";
import { eq as eq5, desc as desc4 } from "drizzle-orm";
init_db();
init_schema();
var campRegistrationsRouter = router({
  // Submit a new camp registration (public)
  submit: publicProcedure.input(
    z5.object({
      campId: z5.number(),
      fullName: z5.string().min(1),
      phone: z5.string().min(1),
      email: z5.string().email().optional(),
      age: z5.number().optional(),
      procedures: z5.string().optional(),
      // JSON string of selected procedures
      medicalCondition: z5.string().optional(),
      notes: z5.string().optional(),
      source: z5.string().optional()
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
      status: "pending"
    });
    const { camps: camps2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const [camp] = await db.select().from(camps2).where(eq5(camps2.id, input.campId)).limit(1);
    if (camp) {
      await sendNewCampRegistrationTelegram({
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        campTitle: camp.name,
        age: input.age
      });
    }
    return { success: true, id: registration.insertId };
  }),
  // List all camp registrations (protected)
  list: protectedProcedure.query(async () => {
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
    }).from(campRegistrations).leftJoin(camps2, eq5(camps2.id, campRegistrations.campId)).orderBy(desc4(campRegistrations.createdAt));
    return results;
  }),
  // Get stats for camp registrations (protected)
  stats: protectedProcedure.query(async () => {
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
  }),
  // Update camp registration status (protected)
  updateStatus: protectedProcedure.input(
    z5.object({
      id: z5.number(),
      status: z5.enum(["pending", "confirmed", "attended", "cancelled"]),
      notes: z5.string().optional()
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(campRegistrations).set({
      status: input.status,
      statusNotes: input.notes,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq5(campRegistrations.id, input.id));
    return { success: true };
  }),
  // Delete camp registration (protected)
  delete: protectedProcedure.input(z5.object({ id: z5.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(campRegistrations).where(eq5(campRegistrations.id, input.id));
    return { success: true };
  })
});

// server/routers/doctors.ts
import { z as z6 } from "zod";
init_db();
init_schema();
import { eq as eq6 } from "drizzle-orm";
var doctorsRouter = router({
  // List all doctors (public)
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const results = await db.select().from(doctors);
    return results;
  }),
  // Get doctor by ID (public)
  getById: publicProcedure.input(z6.object({ id: z6.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(doctors).where(eq6(doctors.id, input.id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }),
  // Get doctor by slug (public)
  getBySlug: publicProcedure.input(z6.object({ slug: z6.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(doctors).where(eq6(doctors.slug, input.slug)).limit(1);
    return result.length > 0 ? result[0] : null;
  }),
  // Create doctor (protected)
  create: protectedProcedure.input(
    z6.object({
      name: z6.string().min(1, "\u0627\u0644\u0627\u0633\u0645 \u0645\u0637\u0644\u0648\u0628"),
      slug: z6.string().min(1, "\u0627\u0644\u0631\u0627\u0628\u0637 \u0645\u0637\u0644\u0648\u0628"),
      specialty: z6.string().min(1, "\u0627\u0644\u062A\u062E\u0635\u0635 \u0645\u0637\u0644\u0648\u0628"),
      image: z6.string().optional(),
      bio: z6.string().optional(),
      experience: z6.string().optional(),
      languages: z6.string().optional(),
      consultationFee: z6.string().optional(),
      procedures: z6.string().optional(),
      isVisiting: z6.enum(["yes", "no"]).default("no"),
      available: z6.enum(["yes", "no"]).default("yes")
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const doctor = await db.insert(doctors).values(input);
    return { success: true, id: Number(doctor[0].insertId) };
  }),
  // Update doctor (protected)
  update: protectedProcedure.input(
    z6.object({
      id: z6.number(),
      name: z6.string().min(1, "\u0627\u0644\u0627\u0633\u0645 \u0645\u0637\u0644\u0648\u0628"),
      slug: z6.string().min(1, "\u0627\u0644\u0631\u0627\u0628\u0637 \u0645\u0637\u0644\u0648\u0628"),
      specialty: z6.string().min(1, "\u0627\u0644\u062A\u062E\u0635\u0635 \u0645\u0637\u0644\u0648\u0628"),
      image: z6.string().optional(),
      bio: z6.string().optional(),
      experience: z6.string().optional(),
      languages: z6.string().optional(),
      consultationFee: z6.string().optional(),
      procedures: z6.string().optional(),
      isVisiting: z6.enum(["yes", "no"]),
      available: z6.enum(["yes", "no"])
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(doctors).set(data).where(eq6(doctors.id, id));
    return { success: true };
  }),
  // Delete doctor (protected)
  delete: protectedProcedure.input(z6.object({ id: z6.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(doctors).where(eq6(doctors.id, input.id));
    return { success: true };
  }),
  // Toggle doctor availability (protected)
  toggleAvailability: protectedProcedure.input(
    z6.object({
      id: z6.number(),
      available: z6.enum(["yes", "no"])
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(doctors).set({ available: input.available }).where(eq6(doctors.id, input.id));
    return { success: true };
  })
});

// server/routers/users.ts
init_schema();
import { z as z7 } from "zod";
import { eq as eq7 } from "drizzle-orm";
init_db();
import { TRPCError as TRPCError3 } from "@trpc/server";
import bcrypt from "bcryptjs";
var userInputSchema = z7.object({
  username: z7.string().min(3, "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 3 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
  password: z7.string().min(6, "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 6 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644").optional(),
  name: z7.string().optional(),
  email: z7.string().email("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D").optional(),
  role: z7.enum(["user", "admin", "manager", "staff", "viewer"]).default("user"),
  isActive: z7.enum(["yes", "no"]).default("yes")
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
  getById: adminOnlyProcedure.input(z7.object({ id: z7.number() })).query(async ({ input }) => {
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
    }).from(users).where(eq7(users.id, input.id)).limit(1);
    if (user.length === 0) {
      throw new TRPCError3({ code: "NOT_FOUND", message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    }
    return user[0];
  }),
  // Create new user (admin only)
  create: adminOnlyProcedure.input(userInputSchema).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const existingUser = await db.select().from(users).where(eq7(users.username, input.username)).limit(1);
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
  update: adminOnlyProcedure.input(z7.object({
    id: z7.number(),
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
    await db.update(users).set(updateData).where(eq7(users.id, id));
    return { success: true };
  }),
  // Delete user (admin only)
  delete: adminOnlyProcedure.input(z7.object({ id: z7.number() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    if (input.id === ctx.user.id) {
      throw new TRPCError3({
        code: "FORBIDDEN",
        message: "\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062D\u0630\u0641 \u062D\u0633\u0627\u0628\u0643 \u0627\u0644\u062E\u0627\u0635"
      });
    }
    await db.delete(users).where(eq7(users.id, input.id));
    return { success: true };
  }),
  // Toggle user active status (admin only)
  toggleActive: adminOnlyProcedure.input(z7.object({ id: z7.number() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    if (input.id === ctx.user.id) {
      throw new TRPCError3({
        code: "FORBIDDEN",
        message: "\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062A\u0639\u0637\u064A\u0644 \u062D\u0633\u0627\u0628\u0643 \u0627\u0644\u062E\u0627\u0635"
      });
    }
    const user = await db.select().from(users).where(eq7(users.id, input.id)).limit(1);
    if (user.length === 0) {
      throw new TRPCError3({ code: "NOT_FOUND", message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    }
    const newStatus = user[0].isActive === "yes" ? "no" : "yes";
    await db.update(users).set({ isActive: newStatus }).where(eq7(users.id, input.id));
    return { success: true, newStatus };
  })
});

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

// server/whatsappConfig.ts
var WHATSAPP_CONFIG = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "EAAS0ZBbtHNpIBPwk3J7dpwNxpMfXMgR60m4PAqfZCtvNZAVDYjQ9Gr3hEvsYTqAEqGZBTbHL6yl4sZBxxnXYpN813HrgEHyMomebkwZC0n7eqlOxmfL3XnRMdwyTU33jcbNMilBZAobCyoRqEZAQx4EOFq8wc46qrXS3iEGNop1JYj2PlG4DJMWAzFthMdK5EyBBZCKhdzM6jl95qYVFV61ChCQMMNbpiyEh8SfXkyfqSYZByc5kNMhUcsywHeypNnaZARsE4GBVpt9W1OTam7IBQw1gOLzdHiZBkjMN6rcZD",
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  apiVersion: "v18.0",
  apiUrl: "https://graph.facebook.com"
};
function getWhatsAppEndpoint(path3) {
  return `${WHATSAPP_CONFIG.apiUrl}/${WHATSAPP_CONFIG.apiVersion}/${path3}`;
}

// server/whatsapp.ts
async function sendWhatsAppMessage(params) {
  try {
    if (!WHATSAPP_CONFIG.phoneNumberId) {
      console.log("[WhatsApp] Phone Number ID not configured. Would send message:", {
        to: params.to,
        message: params.message.substring(0, 100)
      });
      return true;
    }
    const phoneNumber = params.to.replace(/[^0-9]/g, "");
    const response = await fetch(
      getWhatsAppEndpoint(`${WHATSAPP_CONFIG.phoneNumberId}/messages`),
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phoneNumber,
          type: "text",
          text: {
            body: params.message
          }
        })
      }
    );
    if (!response.ok) {
      const error = await response.text();
      console.error("[WhatsApp] API error:", error);
      return false;
    }
    const result = await response.json();
    console.log("[WhatsApp] Message sent successfully:", result);
    return true;
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
import { eq as eq8, and as and4, lte } from "drizzle-orm";
async function deactivateExpiredOffers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Cron] Database not available for deactivateExpiredOffers");
    return { success: false, deactivated: 0 };
  }
  try {
    const now = /* @__PURE__ */ new Date();
    const expiredOffers = await db.select().from(offers).where(
      and4(
        eq8(offers.isActive, true),
        lte(offers.endDate, now)
      )
    );
    if (expiredOffers.length === 0) {
      console.log("[Cron] No expired offers found");
      return { success: true, deactivated: 0 };
    }
    for (const offer of expiredOffers) {
      await db.update(offers).set({ isActive: false }).where(eq8(offers.id, offer.id));
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
      and4(
        eq8(camps.isActive, true),
        lte(camps.endDate, now)
      )
    );
    if (expiredCamps.length === 0) {
      console.log("[Cron] No expired camps found");
      return { success: true, deactivated: 0 };
    }
    for (const camp of expiredCamps) {
      await db.update(camps).set({ isActive: false }).where(eq8(camps.id, camp.id));
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

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  // Leads management
  leads: router({
    // Public endpoint for lead submission from landing page
    submit: publicProcedure.input(z8.object({
      campaignSlug: z8.string(),
      fullName: z8.string().min(1),
      phone: z8.string().min(1),
      email: z8.string().email().optional(),
      utmSource: z8.string().optional(),
      utmMedium: z8.string().optional(),
      utmCampaign: z8.string().optional(),
      utmContent: z8.string().optional()
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
        status: "new",
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
    getById: protectedProcedure.input(z8.object({ id: z8.number() })).query(async ({ input }) => {
      return getLeadById(input.id);
    }),
    search: protectedProcedure.input(z8.object({ searchTerm: z8.string() })).query(async ({ input }) => {
      return searchLeads(input.searchTerm);
    }),
    getByCampaign: protectedProcedure.input(z8.object({ campaignId: z8.number() })).query(async ({ input }) => {
      return getLeadsByCampaign(input.campaignId);
    }),
    updateStatus: protectedProcedure.input(z8.object({
      id: z8.number(),
      status: z8.enum(["new", "contacted", "booked", "not_interested", "no_answer"]),
      notes: z8.string().optional()
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
      return { success: true };
    }),
    getStatusHistory: protectedProcedure.input(z8.object({ leadId: z8.number() })).query(async ({ input }) => {
      return getLeadStatusHistory(input.leadId);
    }),
    stats: protectedProcedure.query(async () => {
      return getLeadsStats();
    }),
    sendWhatsApp: protectedProcedure.input(z8.object({
      leadId: z8.number(),
      message: z8.string().min(1)
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
    sendBookingConfirmation: protectedProcedure.input(z8.object({
      leadId: z8.number(),
      appointmentDate: z8.string().optional(),
      appointmentTime: z8.string().optional()
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
  }),
  // Campaigns management
  campaigns: router({
    list: protectedProcedure.query(async () => {
      return getAllCampaigns();
    }),
    getById: protectedProcedure.input(z8.object({ id: z8.number() })).query(async ({ input }) => {
      return getCampaignById(input.id);
    }),
    create: protectedProcedure.input(z8.object({
      name: z8.string(),
      slug: z8.string(),
      description: z8.string().optional(),
      startDate: z8.date().optional(),
      endDate: z8.date().optional(),
      metaPixelId: z8.string().optional(),
      whatsappEnabled: z8.boolean().optional(),
      whatsappWelcomeMessage: z8.string().optional()
    })).mutation(async ({ input }) => {
      return createCampaign(input);
    }),
    update: protectedProcedure.input(z8.object({
      id: z8.number(),
      name: z8.string().optional(),
      description: z8.string().optional(),
      isActive: z8.boolean().optional(),
      metaPixelId: z8.string().optional(),
      whatsappEnabled: z8.boolean().optional(),
      whatsappWelcomeMessage: z8.string().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateCampaign(id, data);
    }),
    stats: protectedProcedure.input(z8.object({ campaignId: z8.number() })).query(async ({ input }) => {
      return getCampaignStats(input.campaignId);
    })
  }),
  // Doctors router
  doctors: doctorsRouter,
  // Appointments router
  appointments: router({
    submit: publicProcedure.input(z8.object({
      fullName: z8.string(),
      phone: z8.string(),
      email: z8.string().optional(),
      doctorId: z8.number(),
      age: z8.number().optional(),
      procedure: z8.string().optional(),
      preferredDate: z8.string().optional(),
      preferredTime: z8.string().optional(),
      additionalNotes: z8.string().optional(),
      campaignSlug: z8.string(),
      utmSource: z8.string().optional(),
      utmMedium: z8.string().optional(),
      utmCampaign: z8.string().optional(),
      utmContent: z8.string().optional()
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
        status: "pending",
        utmSource: input.utmSource,
        utmMedium: input.utmMedium,
        utmCampaign: input.utmCampaign,
        utmContent: input.utmContent
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
      return appointment;
    }),
    list: protectedProcedure.query(async () => {
      return getAllAppointments();
    }),
    updateStatus: protectedProcedure.input(z8.object({
      id: z8.number(),
      status: z8.string(),
      staffNotes: z8.string().optional()
    })).mutation(async ({ input }) => {
      await updateAppointmentStatus(input.id, input.status, input.staffNotes);
      return { success: true };
    }),
    updateAppointment: protectedProcedure.input(z8.object({
      id: z8.number(),
      appointmentDate: z8.string().optional(),
      status: z8.string().optional(),
      staffNotes: z8.string().optional()
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
      await db.update(appointments).set(updateData).where(eq9(appointments.id, input.id));
      return { success: true };
    })
  }),
  // Offers management
  offers: offersRouter,
  // Camps management
  camps: campsRouter,
  // Offer leads management
  offerLeads: offerLeadsRouter,
  // Camp registrations management
  campRegistrations: campRegistrationsRouter,
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
    approve: protectedProcedure.input(z8.object({ requestId: z8.number() })).mutation(async ({ ctx, input }) => {
      await approveAccessRequest(input.requestId, ctx.user.id);
      await notifyOwner({
        title: "\u062A\u0645 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0637\u0644\u0628 \u062A\u0635\u0631\u064A\u062D",
        content: `\u062A\u0645\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0637\u0644\u0628 \u0627\u0644\u062A\u0635\u0631\u064A\u062D \u0631\u0642\u0645 ${input.requestId}`
      });
      return { success: true };
    }),
    reject: protectedProcedure.input(z8.object({ requestId: z8.number() })).mutation(async ({ ctx, input }) => {
      await rejectAccessRequest(input.requestId, ctx.user.id);
      return { success: true };
    })
  }),
  // Users management (admin only)
  users: usersRouter,
  // Cron jobs (admin only)
  cron: router({
    // Run deactivation jobs manually
    runDeactivation: protectedProcedure.mutation(async () => {
      const result = await runDeactivationJobs();
      return result;
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
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
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
      const clientTemplate = path2.resolve(
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
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/cron/scheduler.ts
function initSimpleCronScheduler() {
  console.log("[Cron] Initializing simple scheduler (24h interval)...");
  runDeactivationJobs();
  setInterval(() => {
    runDeactivationJobs();
  }, 24 * 60 * 60 * 1e3);
  console.log("[Cron] Simple scheduler initialized. Running every 24 hours.");
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
    initSimpleCronScheduler();
  });
}
startServer().catch(console.error);
