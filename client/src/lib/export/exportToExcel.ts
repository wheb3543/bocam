/**
 * تصدير البيانات إلى Excel
 * يستخدم dynamic import لتأجيل تحميل xlsx (277KB) حتى الحاجة الفعلية
 */
export async function exportToExcel(data: Record<string, unknown>[], filename: string, sheetName: string = 'Sheet1') {
  // Dynamic import - يُحمَّل فقط عند الضغط على زر التصدير
  const XLSX = await import('xlsx');

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate file and trigger download
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function formatLeadsForExport(leads: Record<string, unknown>[]) {
  return leads.map((lead) => ({
    'الاسم الكامل': lead.fullName as string,
    'رقم الهاتف': lead.phone as string,
    'البريد الإلكتروني': (lead.email as string | null) || '-',
    الحالة: getStatusLabel(lead.status as string),
    المصدر: (lead.source as string | null) || '-',
    'تاريخ التسجيل': new Date(lead.createdAt as Date | string).toLocaleDateString('ar-SA'),
    ملاحظات: (lead.notes as string | null) || '-',
  }));
}

export function formatAppointmentsForExport(appointments: Record<string, unknown>[]) {
  return appointments.map((apt) => ({
    'الاسم الكامل': apt.fullName as string,
    'رقم الهاتف': apt.phone as string,
    'البريد الإلكتروني': (apt.email as string | null) || '-',
    الطبيب: (apt.doctorName as string | null) || `طبيب #${apt.doctorId as number}`,
    التخصص: (apt.doctorSpecialty as string | null) || '-',
    'التاريخ المفضل': (apt.preferredDate as string | null) || '-',
    'الوقت المفضل': (apt.preferredTime as string | null) || '-',
    الحالة: getAppointmentStatusLabel(apt.status as string),
    'تاريخ التسجيل': new Date(apt.createdAt as Date | string).toLocaleDateString('ar-SA'),
    ملاحظات: (apt.notes as string | null) || '-',
  }));
}

export function formatOfferLeadsForExport(offerLeads: Record<string, unknown>[]) {
  return offerLeads.map((lead) => ({
    'الاسم الكامل': lead.fullName as string,
    'رقم الهاتف': lead.phone as string,
    'البريد الإلكتروني': (lead.email as string | null) || '-',
    العرض: (lead.offerTitle as string | null) || 'غير محدد',
    الحالة: getStatusLabel(lead.status as string),
    المصدر: (lead.source as string | null) || '-',
    'تاريخ التسجيل': new Date(lead.createdAt as Date | string).toLocaleDateString('ar-SA'),
    ملاحظات: (lead.notes as string | null) || '-',
  }));
}

export function formatCampRegistrationsForExport(registrations: Record<string, unknown>[]) {
  return registrations.map((reg) => ({
    'الاسم الكامل': reg.fullName as string,
    'رقم الهاتف': reg.phone as string,
    'البريد الإلكتروني': (reg.email as string | null) || '-',
    المخيم: (reg.campTitle as string | null) || 'غير محدد',
    العمر: (reg.age as number | null) || '-',
    'الحالة الطبية': (reg.medicalCondition as string | null) || '-',
    الحالة: getCampStatusLabel(reg.status as string),
    المصدر: (reg.source as string | null) || '-',
    'تاريخ التسجيل': new Date(reg.createdAt as Date | string).toLocaleDateString('ar-SA'),
    ملاحظات: (reg.notes as string | null) || '-',
  }));
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    new: 'جديد',
    contacted: 'تم التواصل',
    booked: 'تم الحجز',
    not_interested: 'غير مهتم',
    no_answer: 'لم يرد',
  };
  return labels[status] || status;
}

function getAppointmentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    cancelled: 'ملغي',
    completed: 'مكتمل',
  };
  return labels[status] || status;
}

function getCampStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    attended: 'حضر',
    cancelled: 'ملغي',
  };
  return labels[status] || status;
}
