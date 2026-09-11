import PDFDocument from 'pdfkit';
import type { OrderRecord } from '../src/types';

/**
 * Generate a professional, clean vector PDF invoice/receipt for verified orders.
 * Uses built-in standard PDF fonts (Helvetica, Helvetica-Bold) for instant,
 * reliable cross-platform rendering with zero external font file dependencies.
 */
export function generateInvoicePdf(order: OrderRecord): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 45,
        size: 'A4',
        info: {
          Title: `Invoice_${order.id}`,
          Author: 'Ajay Gadhe (AJT77)',
          Subject: `Official Payment Receipt for ${order.course}`,
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const primaryColor = '#0f172a'; // slate-900
      const secondaryColor = '#0284c7'; // sky-600
      const lightBg = '#f8fafc'; // slate-50
      const borderColor = '#e2e8f0'; // slate-200
      const textMuted = '#64748b'; // slate-500

      const invoiceNumber = `INV-${order.id.replace(/^ord_ajt77_/, '').toUpperCase()}`;
      const issueDate = order.created_at
        ? new Date(order.created_at).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'Asia/Kolkata',
          })
        : new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });

      // Top Bar / Brand Header
      doc.rect(45, 45, 505, 55).fill(primaryColor);

      doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold');
      doc.text('AJT77', 60, 56);

      doc.fillColor('#94a3b8').fontSize(8).font('Helvetica');
      doc.text('AJAYTRADES77  •  PRICE ACTION & SMC EDUCATION', 60, 80);

      doc.fillColor('#38bdf8').fontSize(11).font('Helvetica-Bold');
      doc.text('OFFICIAL PAYMENT RECEIPT', 360, 58, { align: 'right', width: 175 });

      doc.fillColor('#ffffff').fontSize(8).font('Helvetica');
      doc.text('STATUS: PAID & VERIFIED', 360, 78, { align: 'right', width: 175 });

      doc.moveDown(3);

      // Metadata Cards (Invoice Info & Customer Info)
      const topY = 120;

      // Box 1: Billed To
      doc.rect(45, topY, 245, 95).fillAndStroke(lightBg, borderColor);
      doc.fillColor(textMuted).fontSize(8).font('Helvetica-Bold');
      doc.text('BILLED TO (CUSTOMER)', 55, topY + 10);

      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold');
      doc.text(order.customer_name || 'Valued Trader', 55, topY + 25);

      doc.fillColor('#334155').fontSize(9).font('Helvetica');
      doc.text(`Email: ${order.customer_email}`, 55, topY + 42);
      doc.text(`Mobile: ${order.customer_phone || 'N/A'}`, 55, topY + 56);
      doc.text(`Access: Instant Community & Curriculum`, 55, topY + 70);

      // Box 2: Order & Transaction Details
      doc.rect(305, topY, 245, 95).fillAndStroke(lightBg, borderColor);
      doc.fillColor(textMuted).fontSize(8).font('Helvetica-Bold');
      doc.text('TRANSACTION DETAILS', 315, topY + 10);

      doc.fillColor('#334155').fontSize(9).font('Helvetica');
      doc.text(`Invoice No:`, 315, topY + 25);
      doc.font('Helvetica-Bold').text(invoiceNumber, 400, topY + 25);

      doc.font('Helvetica').text(`Order ID:`, 315, topY + 40);
      doc.font('Helvetica-Bold').fontSize(8).text(order.id, 380, topY + 40);

      doc.font('Helvetica').fontSize(9).text(`Payment ID:`, 315, topY + 54);
      doc.font('Helvetica-Bold').fontSize(8).text(order.razorpay_payment_id || 'VERIFIED_TXN', 380, topY + 54);

      doc.font('Helvetica').fontSize(9).text(`Issue Date:`, 315, topY + 68);
      doc.font('Helvetica-Bold').text(issueDate, 380, topY + 68);

      doc.font('Helvetica').text(`Status:`, 315, topY + 82);
      doc.fillColor('#059669').font('Helvetica-Bold').text('PAID (CONFIRMED)', 380, topY + 82);

      // Itemized Table
      const tableY = 235;

      // Table Header
      doc.rect(45, tableY, 505, 22).fill(primaryColor);
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
      doc.text('ITEM DESCRIPTION', 55, tableY + 7);
      doc.text('TYPE', 320, tableY + 7);
      doc.text('QTY', 390, tableY + 7, { width: 30, align: 'center' });
      doc.text('AMOUNT (INR)', 435, tableY + 7, { width: 100, align: 'right' });

      // Table Row
      const rowY = tableY + 22;
      doc.rect(45, rowY, 505, 45).fillAndStroke('#ffffff', borderColor);

      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold');
      doc.text(order.course, 55, rowY + 10);

      doc.fillColor(textMuted).fontSize(8).font('Helvetica');
      doc.text('Institutional Price Action & SMC Curriculum by Ajay Gadhe', 55, rowY + 24);

      doc.fillColor('#334155').fontSize(9).font('Helvetica');
      doc.text(order.course.includes('Pro') ? 'Pro Tier' : 'Standard', 320, rowY + 16);

      doc.text('1', 390, rowY + 16, { width: 30, align: 'center' });

      const formattedAmount = `₹${order.amount.toLocaleString('en-IN')}`;
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold');
      doc.text(formattedAmount, 435, rowY + 16, { width: 100, align: 'right' });

      // Financial Summary Box
      const summaryY = rowY + 60;
      doc.rect(330, summaryY, 220, 85).fillAndStroke(lightBg, borderColor);

      doc.fillColor('#334155').fontSize(9).font('Helvetica');
      doc.text('Subtotal:', 345, summaryY + 12);
      doc.text(formattedAmount, 440, summaryY + 12, { width: 95, align: 'right' });

      doc.text('Taxes / Surcharge:', 345, summaryY + 28);
      doc.text('₹0.00', 440, summaryY + 28, { width: 95, align: 'right' });

      doc.rect(345, summaryY + 44, 190, 1).fill('#cbd5e1');

      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold');
      doc.text('Total Paid:', 345, summaryY + 54);
      doc.fillColor(secondaryColor).fontSize(13).font('Helvetica-Bold');
      doc.text(formattedAmount, 440, summaryY + 52, { width: 95, align: 'right' });

      // Verification Badge & Authenticity Notice
      const noticeY = summaryY + 115;
      doc.rect(45, noticeY, 505, 80).fillAndStroke('#f1f5f9', '#cbd5e1');

      doc.fillColor(primaryColor).fontSize(9).font('Helvetica-Bold');
      doc.text('OFFICIAL VERIFICATION & ENROLLMENT NOTICE', 55, noticeY + 12);

      doc.fillColor('#475569').fontSize(8).font('Helvetica');
      doc.text(
        'This electronically generated receipt confirms genuine server-side verification of payment via Razorpay. ' +
        'Your enrollment has been successfully recorded in the AJT77 student register. ' +
        'Please preserve this invoice and your Order ID for all mentorship communications, group onboarding, and student verification.',
        55,
        noticeY + 26,
        { width: 485, lineGap: 2 }
      );

      doc.fillColor(textMuted).fontSize(7.5).font('Helvetica-Bold');
      doc.text('Founder & Lead Educator: Ajay Gadhe  •  AjayTrades77 / AJT77', 55, noticeY + 62);

      // Footer
      const footerY = 745;
      doc.rect(45, footerY, 505, 1).fill(borderColor);

      doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica');
      doc.text('AJT77 Institutional Education  •  Trade • Learn • Earn  •  Generated electronically. No physical signature required.', 45, footerY + 8, {
        align: 'center',
        width: 505,
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
