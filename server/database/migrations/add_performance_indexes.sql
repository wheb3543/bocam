-- Performance Indexes Migration
-- إضافة الفهارس لتحسين أداء قاعدة البيانات

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_isActive ON users(isActive);
CREATE INDEX IF NOT EXISTS idx_users_createdAt ON users(createdAt);

-- Indexes for campaigns table
CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(type);
CREATE INDEX IF NOT EXISTS idx_campaigns_startDate ON campaigns(startDate);
CREATE INDEX IF NOT EXISTS idx_campaigns_endDate ON campaigns(endDate);
CREATE INDEX IF NOT EXISTS idx_campaigns_teamLeaderId ON campaigns(teamLeaderId);
CREATE INDEX IF NOT EXISTS idx_campaigns_isActive ON campaigns(isActive);

-- Indexes for leads table
CREATE INDEX IF NOT EXISTS idx_leads_campaignId ON leads(campaignId);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_createdAt ON leads(createdAt);
CREATE INDEX IF NOT EXISTS idx_leads_updatedAt ON leads(updatedAt);
CREATE INDEX IF NOT EXISTS idx_leads_assignedTo ON leads(assignedTo);

-- Indexes for campRegistrations table
CREATE INDEX IF NOT EXISTS idx_campRegistrations_campId ON campRegistrations(campId);
CREATE INDEX IF NOT EXISTS idx_campRegistrations_patientId ON campRegistrations(patientId);
CREATE INDEX IF NOT EXISTS idx_campRegistrations_status ON campRegistrations(status);
CREATE INDEX IF NOT EXISTS idx_campRegistrations_createdAt ON campRegistrations(createdAt);
CREATE INDEX IF NOT EXISTS idx_campRegistrations_appointmentDate ON campRegistrations(appointmentDate);

-- Indexes for appointments table
CREATE INDEX IF NOT EXISTS idx_appointments_patientId ON appointments(patientId);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_doctorId ON appointments(doctorId);
CREATE INDEX IF NOT EXISTS idx_appointments_createdAt ON appointments(createdAt);

-- Indexes for patients table
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_createdAt ON patients(createdAt);

-- Indexes for tasks table
CREATE INDEX IF NOT EXISTS idx_tasks_assignedTo ON tasks(assignedTo);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_dueDate ON tasks(dueDate);
CREATE INDEX IF NOT EXISTS idx_tasks_createdAt ON tasks(createdAt);

-- Indexes for messageSettings table
CREATE INDEX IF NOT EXISTS idx_messageSettings_campaignId ON messageSettings(campaignId);
CREATE INDEX IF NOT EXISTS idx_messageSettings_type ON messageSettings(type);

-- Indexes for webhookEvents table
CREATE INDEX IF NOT EXISTS idx_webhookEvents_eventType ON webhookEvents(eventType);
CREATE INDEX IF NOT EXISTS idx_webhookEvents_createdAt ON webhookEvents(createdAt);
CREATE INDEX IF NOT EXISTS idx_webhookEvents_status ON webhookEvents(status);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_leads_campaign_status ON leads(campaignId, status);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_created ON leads(campaignId, createdAt);
CREATE INDEX IF NOT EXISTS idx_campRegistrations_camp_status ON campRegistrations(campId, status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_status ON appointments(patientId, status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON appointments(date, status);
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, isActive);
CREATE INDEX IF NOT EXISTS idx_campaigns_status_dates ON campaigns(status, startDate, endDate);
