import PDFDocument from 'pdfkit';
import path from 'path';
import { getHospitalDb } from '../db';
import { sql } from 'drizzle-orm';

const AMIRI_REGULAR = path.join(process.cwd(), 'server', 'fonts', 'Amiri-Regular.ttf');
const AMIRI_BOLD = path.join(process.cwd(), 'server', 'fonts', 'Amiri-Bold.ttf');

export async function generateLabResultPDF(orderId: number): Promise<Buffer> {
  const hospitalDb = await getHospitalDb();
  if (!hospitalDb) throw new Error("Hospital database not available");

  // جلب البيانات من قاعدة بيانات المستشفى
  const [order] = await hospitalDb.execute(
    sql`SELECT * FROM lab_orders WHERE ORDER_ID = ${orderId} LIMIT 1`
  );
  if (!order) throw new Error("Order not found");

  const details = await hospitalDb.execute(
    sql`SELECT * FROM lab_results_details WHERE ORDER_ID = ${orderId}`
  );

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'portrait',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      addLabHeader(doc, order);
      addLabResultsTable(doc, details);
      addLabFooter(doc, order);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function addLabHeader(doc: PDFKit.PDFDocument, order: any) {
  const logoPath = path.join(process.cwd(), 'client', 'public', 'SGHHospitalColorBilingual.png');
  try {
    doc.image(logoPath, doc.page.width - 200, 30, { width: 150 });
  } catch (error) {
    console.warn('Could not load logo:', error);
  }

  doc.fontSize(10).font(AMIRI_REGULAR)
    .text('المستشفى السعودي الألماني - صنعاء', 50, 40, { align: 'left' })
    .text('8000018', 50, 55, { align: 'left' })
    .text('info@sghsanaa.net', 50, 70, { align: 'left' });

  doc.moveTo(50, 100).lineTo(doc.page.width - 50, 100).stroke();

  doc.fontSize(16).font(AMIRI_BOLD)
    .text('تقرير نتيجة الفحص', 50, 120, { align: 'center' });

  let yPos = 150;
  doc.fontSize(11).font(AMIRI_REGULAR)
    .text(`اسم المريض: ${order.PATIENT_NAME}`, 50, yPos, { align: 'right' });
  yPos += 20;
  doc.text(`رقم الهاتف: ${order.PHONE_NO}`, 50, yPos, { align: 'right' });
  yPos += 20;
  doc.text(`الطبيب: ${order.DOCTOR_NAME}`, 50, yPos, { align: 'right' });
  yPos += 20;
  doc.text(`نوع الفحص: ${order.MAIN_TEST_NAME}`, 50, yPos, { align: 'right' });
  yPos += 20;
  doc.text(`تاريخ النتيجة: ${new Date(order.RESULT_DATE).toLocaleDateString('ar-SA')}`, 50, yPos, { align: 'right' });
}

function addLabResultsTable(doc: PDFKit.PDFDocument, details: any[]) {
  const tableTop = 250;
  const tableLeft = 50;
  const tableWidth = doc.page.width - 100;
  const rowHeight = 25;

  doc.fontSize(10).font(AMIRI_BOLD).fillColor('#2D6A4F');

  const headers = ['المادة', 'القيمة', 'المعدل الطبيعي', 'الوحدة'];
  const columnWidths = [tableWidth * 0.35, tableWidth * 0.2, tableWidth * 0.25, tableWidth * 0.2];

  let xPos = tableLeft;
  headers.forEach((header, index) => {
    doc.rect(xPos, tableTop, columnWidths[index], rowHeight)
      .fillAndStroke('#E8F5E9', '#2D6A4F');
    doc.fillColor('#000')
      .text(header, xPos + 5, tableTop + 7, { width: columnWidths[index] - 10, align: 'center' });
    xPos += columnWidths[index];
  });

  doc.fontSize(9).font(AMIRI_REGULAR);
  let yPos = tableTop + rowHeight;

  details.forEach((detail, rowIndex) => {
    if (yPos > doc.page.height - 100) {
      doc.addPage();
      yPos = 50;
    }

    const fillColor = rowIndex % 2 === 0 ? '#FFFFFF' : '#F5F5F5';
    const values = [detail.PARAMETER_NAME, detail.RESULT_VALUE, detail.NORMAL_RANGE || '-', detail.UNIT || '-'];

    xPos = tableLeft;
    values.forEach((value, colIndex) => {
      doc.rect(xPos, yPos, columnWidths[colIndex], rowHeight)
        .fillAndStroke(fillColor, '#CCCCCC');
      doc.fillColor('#000')
        .text(value, xPos + 5, yPos + 7, { width: columnWidths[colIndex] - 10, align: 'center' });
      xPos += columnWidths[colIndex];
    });

    yPos += rowHeight;
  });
}

function addLabFooter(doc: PDFKit.PDFDocument, order: any) {
  const pageHeight = doc.page.height;
  const footerY = pageHeight - 50;

  doc.moveTo(50, footerY - 10).lineTo(doc.page.width - 50, footerY - 10).stroke();

  doc.fontSize(9).font(AMIRI_REGULAR)
    .text(`رقم الطلب: ${order.ORDER_ID}`, 50, footerY, { align: 'left' })
    .text('نرعاكم كأهالينا', 0, footerY, { align: 'center', width: doc.page.width })
    .text(new Date().toLocaleDateString('ar-SA'), doc.page.width - 200, footerY, { align: 'right', width: 150 });
}
