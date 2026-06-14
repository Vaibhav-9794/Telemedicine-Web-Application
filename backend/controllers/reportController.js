const { MedicalReport } = require('../config/db');
const { saveBase64File } = require('../middleware/upload');

/**
 * Upload a medical report
 * POST /api/reports/upload
 */
const uploadReport = async (req, res) => {
  try {
    const { fileName, fileData } = req.body; // fileData is base64
    const patientId = req.user._id;

    if (!fileName || !fileData) {
      return res.status(400).json({ message: 'File name and file data (base64) are required' });
    }

    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can upload medical reports' });
    }

    // Save base64 string to public uploads directory
    const savedFile = saveBase64File(fileData, fileName);

    const report = await MedicalReport.create({
      patientId,
      fileName: savedFile.fileName,
      fileUrl: savedFile.fileUrl,
      uploadDate: new Date().toISOString()
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Error uploading report:', error);
    res.status(500).json({ message: 'Server error uploading medical report' });
  }
};

/**
 * Get reports list for a patient
 * GET /api/reports/patient
 * GET /api/reports/patient/:patientId (for doctors/admins)
 */
const getPatientReports = async (req, res) => {
  try {
    let patientId = req.user._id;

    // Doctors or Admins can fetch reports of a specific patient by passing patientId
    if (['doctor', 'admin'].includes(req.user.role)) {
      patientId = req.params.patientId || req.query.patientId;
      if (!patientId) {
        return res.status(400).json({ message: 'Patient ID is required' });
      }
    }

    const reports = await MedicalReport.find({ patientId });
    
    // Sort by upload date (most recent first)
    reports.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    res.json(reports);
  } catch (error) {
    console.error('Error fetching patient reports:', error);
    res.status(500).json({ message: 'Server error fetching reports' });
  }
};

module.exports = {
  uploadReport,
  getPatientReports
};
