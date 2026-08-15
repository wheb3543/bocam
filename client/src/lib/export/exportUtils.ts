// Extend jsPDF type to include autoTable
type JsPDFInstance = {
  autoTable: (options: unknown) => JsPDFInstance;
  lastAutoTable?: {
    finalY: number;
  };
  setR2L: (value: boolean) => void;
  setLanguage: (lang: string) => void;
  setFontSize: (size: number) => void;
  setFont: (font: string, style?: string) => void;
  text: (text: string, x: number, y: number, options?: { align?: string }) => void;
  setDrawColor: (r: number, g: number, b: number) => void;
  line: (x1: number, y1: number, x2: number, y2: number) => void;
  internal: {
    pageSize: {
      getWidth: () => number;
      getHeight: () => number;
    };
  };
  getNumberOfPages: () => number;
  setPage: (page: number) => void;
  setTextColor: (r: number, g?: number, b?: number) => void;
  save: (filename: string) => void;
  [key: string]: unknown;
};

export interface BookingData {
  id: number;
  patientName: string;
  phone: string;
  specialty: string;
  status: string;
  createdAt: Date;
  type?: string;
  source?: string;
}

export interface ReportStats {
  totalBookings: number;
  newLeads: number;
  conversionRate: number;
  revenue: number;
}

/**
 * تصدير التقارير إلى PDF
 * يستخدم dynamic import لتأجيل تحميل jspdf حتى الحاجة الفعلية
 */
export const exportToPDF = async (
  bookings: BookingData[],
  stats: ReportStats,
  dateRange: { from: Date; to: Date }
) => {
  // Dynamic import - يُحمَّل فقط عند الضغط على زر التصدير
  const [{ default: jsPDF }, _] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // إعدادات الخط والاتجاه
  doc.setR2L(true);
  doc.setLanguage('ar');

  // العنوان الرئيسي
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('تقرير الحجوزات والمواعيد', doc.internal.pageSize.getWidth() / 2, 20, {
    align: 'center',
  });

  // معلومات المستشفى
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('المستشفى السعودي الألماني - صنعاء', doc.internal.pageSize.getWidth() / 2, 28, {
    align: 'center',
  });

  // الفترة الزمنية
  doc.setFontSize(10);
  const fromDate = dateRange.from.toLocaleDateString('ar-YE');
  const toDate = dateRange.to.toLocaleDateString('ar-YE');
  doc.text(`الفترة: من ${fromDate} إلى ${toDate}`, doc.internal.pageSize.getWidth() / 2, 35, {
    align: 'center',
  });

  // خط فاصل
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 38, doc.internal.pageSize.getWidth() - 20, 38);

  // الإحصائيات الرئيسية
  let yPos = 45;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('الإحصائيات الرئيسية', 20, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const statsData = [
    ['إجمالي الحجوزات', stats.totalBookings.toString()],
    ['العملاء الجدد', stats.newLeads.toString()],
    ['معدل التحويل', `${stats.conversionRate.toFixed(1)}%`],
    ['الإيرادات', `${stats.revenue.toLocaleString('ar-YE')} ريال`],
  ];

  if ('autoTable' in doc) {
    (doc as unknown as JsPDFInstance).autoTable({
      startY: yPos,
      head: [['المؤشر', 'القيمة']],
      body: statsData,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 3,
        halign: 'right',
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 20, right: 20 },
    } as unknown);
  }

  // جدول الحجوزات التفصيلية
  const lastAutoTableFinalY =
    'lastAutoTable' in doc ? (doc as unknown as JsPDFInstance).lastAutoTable?.finalY : undefined;
  yPos = lastAutoTableFinalY ? lastAutoTableFinalY + 10 : yPos + 50;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('الحجوزات التفصيلية', 20, yPos);

  yPos += 5;

  const bookingsData = bookings.map((booking, index) => [
    (index + 1).toString(),
    booking.patientName,
    booking.phone,
    booking.specialty,
    getStatusLabel(booking.status),
    new Date(booking.createdAt).toLocaleDateString('ar-YE'),
  ]);

  if ('autoTable' in doc) {
    (doc as unknown as JsPDFInstance).autoTable({
      startY: yPos,
      head: [['#', 'اسم المريض', 'الهاتف', 'التخصص', 'الحالة', 'التاريخ']],
      body: bookingsData,
      theme: 'striped',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 2,
        halign: 'right',
      },
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
        3: { cellWidth: 35 },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 30, halign: 'center' },
      },
    } as unknown);
  }

  // تذييل الصفحة
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `صفحة ${i} من ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      `تم الإنشاء: ${new Date().toLocaleString('ar-YE')}`,
      doc.internal.pageSize.getWidth() - 20,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }

  // حفظ الملف
  const fileName = `تقرير_الحجوزات_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

/**
 * تصدير التقارير إلى Excel - محسّن
 * يستخدم dynamic import لتأجيل تحميل exceljs حتى الحاجة الفعلية
 */
export const exportToExcel = async (
  bookings: BookingData[],
  stats: ReportStats,
  dateRange: { from: Date; to: Date }
) => {
  // Dynamic import - يُحمَّل فقط عند الضغط على زر التصدير
  const ExcelJS = await import('exceljs');

  // إنشاء workbook جديد
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BOCAM CRM';
  workbook.created = new Date();

  // ===== ورقة الإحصائيات =====
  const statsSheet = workbook.addWorksheet('الإحصائيات');

  // إضافة العنوان
  statsSheet.mergeCells('A1:B1');
  statsSheet.getCell('A1').value = 'تقرير الحجوزات والمواعيد - المستشفى السعودي الألماني - صنعاء';
  statsSheet.getCell('A1').font = { bold: true, size: 14 };
  statsSheet.getCell('A1').alignment = { horizontal: 'center' };

  // إضافة الفترة الزمنية
  statsSheet.getCell('A3').value = 'الفترة الزمنية';
  statsSheet.getCell('A3').font = { bold: true };
  statsSheet.getCell('A4').value = 'من';
  statsSheet.getCell('B4').value = dateRange.from.toLocaleDateString('ar-YE');
  statsSheet.getCell('A5').value = 'إلى';
  statsSheet.getCell('B5').value = dateRange.to.toLocaleDateString('ar-YE');

  // إضافة الإحصائيات الرئيسية
  statsSheet.getCell('A7').value = 'الإحصائيات الرئيسية';
  statsSheet.getCell('A7').font = { bold: true };
  statsSheet.getCell('A8').value = 'المؤشر';
  statsSheet.getCell('B8').value = 'القيمة';
  statsSheet.getCell('A8').font = { bold: true };
  statsSheet.getCell('B8').font = { bold: true };

  statsSheet.getCell('A9').value = 'إجمالي الحجوزات';
  statsSheet.getCell('B9').value = stats.totalBookings;
  statsSheet.getCell('A10').value = 'العملاء الجدد';
  statsSheet.getCell('B10').value = stats.newLeads;
  statsSheet.getCell('A11').value = 'معدل التحويل';
  statsSheet.getCell('B11').value = `${stats.conversionRate.toFixed(1)}%`;
  statsSheet.getCell('A12').value = 'الإيرادات (ريال)';
  statsSheet.getCell('B12').value = stats.revenue.toLocaleString('ar-YE');

  statsSheet.getCell('A14').value = `تم الإنشاء: ${new Date().toLocaleString('ar-YE')}`;

  // تنسيق عرض الأعمدة
  statsSheet.getColumn('A').width = 30;
  statsSheet.getColumn('B').width = 25;

  // ===== ورقة الحجوزات التفصيلية =====
  const bookingsSheet = workbook.addWorksheet('الحجوزات التفصيلية');

  // إضافة رؤوس الأعمدة
  const headers = [
    '#',
    'اسم المريض',
    'رقم الهاتف',
    'التخصص/الخدمة',
    'نوع الحجز',
    'الحالة',
    'المصدر',
    'تاريخ الحجز',
    'وقت الحجز',
  ];
  bookingsSheet.addRow(headers);
  const headerRow = bookingsSheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF3498DB' },
  };
  headerRow.eachCell((cell) => {
    cell.alignment = { horizontal: 'center' };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  });

  // إضافة البيانات
  bookings.forEach((booking, index) => {
    bookingsSheet.addRow([
      index + 1,
      booking.patientName || 'غير محدد',
      booking.phone || '',
      booking.specialty || 'غير محدد',
      getBookingTypeLabel(booking.type),
      getStatusLabel(booking.status),
      getSourceLabel(booking.source || 'direct'),
      new Date(booking.createdAt).toLocaleDateString('ar-YE'),
      new Date(booking.createdAt).toLocaleTimeString('ar-YE', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    ]);
  });

  // تنسيق عرض الأعمدة
  bookingsSheet.getColumn(1).width = 5;
  bookingsSheet.getColumn(2).width = 25;
  bookingsSheet.getColumn(3).width = 15;
  bookingsSheet.getColumn(4).width = 20;
  bookingsSheet.getColumn(5).width = 18;
  bookingsSheet.getColumn(6).width = 15;
  bookingsSheet.getColumn(7).width = 15;
  bookingsSheet.getColumn(8).width = 15;
  bookingsSheet.getColumn(9).width = 12;

  // حفظ الملف
  const fileName = `تقرير_الحجوزات_${new Date().toISOString().split('T')[0]}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * دالة مساعدة للحصول على تسمية الحالة بالعربية
 */
function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    attended: 'حضر',
    no_show: 'لم يحضر',
    new: 'جديد',
    contacted: 'تم التواصل',
    booked: 'تم الحجز',
    not_interested: 'غير مهتم',
    no_answer: 'لم يرد',
    active: 'نشط',
    inactive: 'غير نشط',
  };
  return statusMap[status] || status;
}

/**
 * دالة مساعدة للحصول على تسمية المصدر بالعربية
 */
function getSourceLabel(source: string): string {
  const sourceMap: Record<string, string> = {
    website: 'الموقع الإلكتروني',
    facebook: 'فيسبوك',
    instagram: 'إنستغرام',
    whatsapp: 'واتساب',
    phone: 'اتصال هاتفي',
    direct: 'مباشر',
    referral: 'إحالة',
    campaign: 'حملة تسويقية',
    google: 'جوجل',
    other: 'أخرى',
  };
  return sourceMap[source] || source;
}

/**
 * دالة مساعدة للحصول على تسمية نوع الحجز بالعربية
 */
function getBookingTypeLabel(type?: string): string {
  if (!type) {
    return 'غير محدد';
  }

  const typeMap: Record<string, string> = {
    appointment: 'موعد طبيب',
    offer: 'طلب عرض',
    camp: 'تسجيل مخيم',
    lead: 'عميل محتمل',
    consultation: 'استشارة',
    emergency: 'طوارئ',
  };
  return typeMap[type] || type;
}
