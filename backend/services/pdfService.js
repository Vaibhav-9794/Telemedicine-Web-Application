const PDFDocument = require('pdfkit');

/**
 * Generates a PDF prescription as a buffer
 * @param {object} prescription - Prescription record
 * @param {object} doctorUser - Doctor User object (contains name, email, phone)
 * @param {object} doctorProfile - Doctor profile details (specialization, etc.)
 * @param {object} patientUser - Patient User object (contains name, email, phone)
 * @returns {Promise<Buffer>}
 */
const generatePrescriptionPDF = (prescription, doctorUser, doctorProfile, patientUser) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header Colors & Styling
      const primaryColor = '#0f766e'; // Teal 700 (Healthcare theme)
      const secondaryColor = '#4b5563'; // Gray 600
      const textColor = '#1f2937'; // Gray 800
      const lightGray = '#f3f4f6'; // Gray 100

      // Hospital/Clinic Title
      doc.fillColor(primaryColor)
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('MEDICARE CLINIC', { align: 'right' });

      doc.fontSize(10)
         .font('Helvetica')
         .fillColor(secondaryColor)
         .text('123 Health Ave, Medical District, NY 10001\nPhone: +1 (555) 019-2834 | support@medicare.com', { align: 'right' });

      doc.moveDown(1);

      // Doctor Details (Left-aligned header)
      doc.fillColor(primaryColor)
         .fontSize(16)
         .font('Helvetica-Bold')
         .text(`Dr. ${doctorUser.name || 'Doctor'}`, 50, doc.y - 40);

      doc.fontSize(11)
         .font('Helvetica')
         .fillColor(secondaryColor)
         .text(`${doctorProfile.specialization || 'General Practitioner'}`, 50)
         .text(`Qualification: ${doctorProfile.qualification || 'MBBS'}`, 50)
         .text(`Experience: ${doctorProfile.experience || 0} Years`, 50);

      // Divider Line
      doc.strokeColor(primaryColor)
         .lineWidth(2)
         .moveTo(50, 170)
         .lineTo(545, 170)
         .stroke();

      doc.y = 185; // Move cursor past line

      // Metadata Container (Patient and Date)
      doc.fillColor(lightGray)
         .rect(50, doc.y, 495, 60)
         .fill();

      doc.fillColor(textColor)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('PATIENT DETAILS', 65, doc.y + 10)
         .text('PRESCRIPTION DETAILS', 300, doc.y + 10);

      const patientPhone = patientUser.phone || 'N/A';
      const patientEmail = patientUser.email || 'N/A';
      const presDate = new Date(prescription.createdAt || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc.font('Helvetica')
         .fontSize(9)
         .fillColor(secondaryColor)
         .text(`Name: ${patientUser.name || 'Patient'}`, 65, doc.y + 25)
         .text(`Phone: ${patientPhone}`, 65, doc.y + 35)
         .text(`Date: ${presDate}`, 300, doc.y + 25)
         .text(`Prescription ID: ${prescription._id}`, 300, doc.y + 35);

      doc.moveDown(4);

      // Rx Logo (The recipe symbol)
      doc.fillColor(primaryColor)
         .fontSize(28)
         .font('Helvetica-Bold')
         .text('Rx', 50, doc.y);

      doc.moveDown(0.5);

      // Medicines Table / List
      const medicines = prescription.medicineDetails || [];
      let currentY = doc.y;

      medicines.forEach((med, idx) => {
        // Medicine name
        doc.fillColor(textColor)
           .fontSize(11)
           .font('Helvetica-Bold')
           .text(`${idx + 1}. ${med.name}`, 65, currentY);

        // Dosage and duration
        doc.fillColor(secondaryColor)
           .fontSize(10)
           .font('Helvetica')
           .text(`${med.dosage} | ${med.duration}`, 350, currentY);

        currentY += 16;

        // Instructions
        doc.fillColor(secondaryColor)
           .fontSize(9)
           .font('Helvetica-Oblique')
           .text(`Instructions: ${med.instructions || 'As directed by physician'}`, 80, currentY);

        currentY += 24;
      });

      if (medicines.length === 0) {
        doc.fillColor(secondaryColor)
           .fontSize(11)
           .font('Helvetica-Oblique')
           .text('No medicines prescribed.', 65, currentY);
        currentY += 30;
      }

      doc.y = currentY + 10;

      // Special Instructions Box
      if (prescription.instructions) {
        doc.strokeColor('#d1d5db')
           .lineWidth(1)
           .rect(50, doc.y, 495, 50)
           .stroke();

        doc.fillColor(textColor)
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('Special Instructions / Advice:', 65, doc.y + 10);

        doc.fillColor(secondaryColor)
           .fontSize(9)
           .font('Helvetica')
           .text(prescription.instructions, 65, doc.y + 22);

        doc.moveDown(4);
      } else {
        doc.moveDown(2);
      }

      // Footer
      const footerY = 720;
      doc.strokeColor('#e5e7eb')
         .lineWidth(1)
         .moveTo(50, footerY)
         .lineTo(545, footerY)
         .stroke();

      doc.fillColor(secondaryColor)
         .fontSize(8)
         .font('Helvetica')
         .text('This prescription is digitally signed and authorized. Medicare Telehealth Services.', 50, footerY + 10);

      doc.fillColor(primaryColor)
         .fontSize(11)
         .font('Helvetica-Bold')
         .text(`Dr. ${doctorUser.name}`, 400, footerY + 10, { align: 'right' });

      doc.fontSize(8)
         .font('Helvetica')
         .fillColor(secondaryColor)
         .text('Authorized Digital Signature', 400, footerY + 23, { align: 'right' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generatePrescriptionPDF
};
