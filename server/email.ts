/**
 * Email notification service
 * Sends email notifications to hospital staff when new leads are registered
 */

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email notification
 * In production, this should be replaced with actual email service (SendGrid, AWS SES, etc.)
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    // TODO: Integrate with actual email service
    // For now, we'll use the notification system to alert the owner
    console.log('[Email] Would send email:', {
      to: params.to,
      subject: params.subject,
      preview: params.html.substring(0, 100),
    });
    
    return true;
  } catch (error) {
    console.error('[Email] Failed to send email:', error);
    return false;
  }
}

/**
 * Generate HTML email template for new lead notification
 */
export function generateNewLeadEmail(lead: {
  fullName: string;
  phone: string;
  email?: string;
  campaignName: string;
  utmSource?: string;
  utmMedium?: string;
  createdAt: Date;
}): string {
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
          <h1>🎉 تسجيل عميل جديد</h1>
          <p>المستشفى السعودي الألماني - صنعاء</p>
        </div>
        <div class="content">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            تم تسجيل عميل جديد في حملة <strong>${lead.campaignName}</strong>
          </p>
          
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <div class="info-row">
              <div class="info-label">الاسم الكامل:</div>
              <div class="info-value">${lead.fullName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">رقم الهاتف:</div>
              <div class="info-value" dir="ltr">${lead.phone}</div>
            </div>
            ${lead.email ? `
            <div class="info-row">
              <div class="info-label">البريد الإلكتروني:</div>
              <div class="info-value">${lead.email}</div>
            </div>
            ` : ''}
            <div class="info-row">
              <div class="info-label">تاريخ التسجيل:</div>
              <div class="info-value">${lead.createdAt.toLocaleString('ar-YE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}</div>
            </div>
            ${lead.utmSource ? `
            <div class="info-row">
              <div class="info-label">مصدر الحملة:</div>
              <div class="info-value">${lead.utmSource}</div>
            </div>
            ` : ''}
            ${lead.utmMedium ? `
            <div class="info-row">
              <div class="info-label">وسيلة الحملة:</div>
              <div class="info-value">${lead.utmMedium}</div>
            </div>
            ` : ''}
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            يرجى المتابعة مع العميل في أقرب وقت ممكن لتأكيد الموعد وتقديم الخدمة المطلوبة.
          </p>
        </div>
        <div class="footer">
          <p>المستشفى السعودي الألماني - صنعاء</p>
          <p>نرعاكم كأهالينا</p>
          <p style="margin-top: 10px;">
            <a href="tel:8000018" style="color: #00A3E0; text-decoration: none;">
              الرقم المجاني: 8000018
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send new lead notification email
 */
export async function sendNewLeadNotification(lead: {
  fullName: string;
  phone: string;
  email?: string;
  campaignName: string;
  utmSource?: string;
  utmMedium?: string;
  createdAt: Date;
}): Promise<boolean> {
  const emailHtml = generateNewLeadEmail(lead);
  
  // TODO: Replace with actual hospital email address
  const hospitalEmail = process.env.HOSPITAL_EMAIL || 'info@sgh-sanaa.com';
  
  return sendEmail({
    to: hospitalEmail,
    subject: `تسجيل جديد: ${lead.fullName} - ${lead.campaignName}`,
    html: emailHtml,
  });
}

/**
 * Send new appointment notification email
 */
export async function sendNewAppointmentEmail(params: {
  appointment: {
    fullName: string;
    phone: string;
    email?: string;
    doctorName: string;
    doctorSpecialty: string;
    preferredDate?: string;
    preferredTime?: string;
    notes?: string;
  };
  campaign: string;
}): Promise<boolean> {
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
          <h1>📅 حجز موعد جديد</h1>
          <p>المستشفى السعودي الألماني - صنعاء</p>
        </div>
        <div class="content">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            تم حجز موعد جديد من خلال <strong>${campaign}</strong>
          </p>
          
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #00A3E0; margin-top: 0;">معلومات المريض:</h3>
            <div class="info-row">
              <div class="info-label">الاسم الكامل:</div>
              <div class="info-value">${appointment.fullName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">رقم الهاتف:</div>
              <div class="info-value" dir="ltr">${appointment.phone}</div>
            </div>
            ${appointment.email ? `
            <div class="info-row">
              <div class="info-label">البريد الإلكتروني:</div>
              <div class="info-value">${appointment.email}</div>
            </div>
            ` : ''}
            
            <h3 style="color: #00A3E0; margin-top: 20px;">معلومات الموعد:</h3>
            <div class="info-row">
              <div class="info-label">الطبيب:</div>
              <div class="info-value">${appointment.doctorName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">التخصص:</div>
              <div class="info-value">${appointment.doctorSpecialty}</div>
            </div>
            ${appointment.preferredDate ? `
            <div class="info-row">
              <div class="info-label">التاريخ المفضل:</div>
              <div class="info-value">${appointment.preferredDate}</div>
            </div>
            ` : ''}
            ${appointment.preferredTime ? `
            <div class="info-row">
              <div class="info-label">الوقت المفضل:</div>
              <div class="info-value">${appointment.preferredTime}</div>
            </div>
            ` : ''}
            ${appointment.notes ? `
            <div class="info-row">
              <div class="info-label">ملاحظات:</div>
              <div class="info-value">${appointment.notes}</div>
            </div>
            ` : ''}
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            يرجى التواصل مع المريض لتأكيد الموعد وتحديد الوقت المناسب.
          </p>
        </div>
        <div class="footer">
          <p>المستشفى السعودي الألماني - صنعاء</p>
          <p>نرعاكم كأهالينا</p>
          <p style="margin-top: 10px;">
            <a href="tel:8000018" style="color: #00A3E0; text-decoration: none;">
              الرقم المجاني: 8000018
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const hospitalEmail = process.env.HOSPITAL_EMAIL || 'info@sgh-sanaa.com';
  
  return sendEmail({
    to: hospitalEmail,
    subject: `حجز موعد جديد: ${appointment.fullName} - ${appointment.doctorName}`,
    html: emailHtml,
  });
}
