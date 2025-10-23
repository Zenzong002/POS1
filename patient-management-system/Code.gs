/**
 * Patient Management System - Google Apps Script
 * Created for medical patient data management
 */

// ============================================
// Configuration & Constants
// ============================================

const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');

const SHEET_NAMES = {
  PATIENT_LIST: 'Patient_List',
  VITAL_SIGNS: 'VitalSigns',
  INTAKE_OUTPUT: 'IntakeOutput',
  CLINICAL: 'Clinical',
  ACTIVITY: 'Activity',
  MEDICATION: 'Medication',
  BEHAVIOR: 'Behavior',
  MAR: 'MAR',
  LAB_RECORD: 'Lab_Record',
  MEDICATION_LOG: 'Medication_Log'
};

// Dropdown Options
const DROPDOWN_OPTIONS = {
  STOOL_TYPE: [
    '1. ก้อนแข็งเล็ก (ท้องผูก)',
    '2. ก้อนยาวผิวขรุขระ (ท้องผูก)',
    '3. ก้อนยาวคล้ายไส้กรอกมีรอยแตก (ปกติ)',
    '4. ก้อนยาวคล้ายงูผิวเนียม (ปกติ)',
    '5. ก้อนนุ่มขอบชัด (ปกติ)',
    '6. ก้อนฟูขอบยุ่ย (ท้องเสีย)',
    '7. เหลวเป็นน้ำ (ท้องเสียรุนแรง)'
  ],
  STOOL_COLOR: ['สีน้ำตาล', 'สีเหลือง', 'สีเขียว', 'สีดำ', 'สีแดง', 'สีซีด/เทา'],
  O2_SUPPORT: ['NC', 'Simple Mask', 'PRM', 'Venturi', 'CPAP', 'BiPAP', 'Ventilator'],
  MEDICATION_FREQUENCY: ['bid', 'tid', 'qid', 'o.d.', 'h.s.', 'p.c.', 'a.c.', 'PRN', 'EOD'],
  ROUTE: ['IV', 'IM', 'ID', 'PO', 'SC']
};

// Lab Normal Ranges
const LAB_NORMAL_RANGES = {
  WBC: { min: 4000, max: 11000, unit: 'cells/µL' },
  Neutrophil: { min: 40, max: 70, unit: '%' },
  Lymphocyte: { min: 20, max: 40, unit: '%' },
  RBC: { min: 4.5, max: 5.5, unit: 'M/µL' },
  Hb: { min: 13, max: 17, unit: 'g/dL' },
  Hct: { min: 40, max: 50, unit: '%' },
  Platelet: { min: 150000, max: 450000, unit: '/µL' },
  CRP: { min: 0, max: 3, unit: 'mg/L' },
  Albumin: { min: 3.5, max: 5.5, unit: 'g/dL' },
  AST: { min: 0, max: 40, unit: 'U/L' },
  ALT: { min: 0, max: 40, unit: 'U/L' },
  BUN: { min: 7, max: 20, unit: 'mg/dL' },
  Creatinine: { min: 0.6, max: 1.2, unit: 'mg/dL' },
  Na: { min: 135, max: 145, unit: 'mEq/L' },
  K: { min: 3.5, max: 5.0, unit: 'mEq/L' }
};

// ============================================
// Web App Entry Point
// ============================================

function doGet(e) {
  const template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('Patient Management System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ============================================
// Sheet Initialization
// ============================================

function initializeSheets() {
  const ss = getSpreadsheet();

  // Create sheets if they don't exist
  Object.values(SHEET_NAMES).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      setupSheetHeaders(sheet, sheetName);
    }
  });

  return { success: true, message: 'Sheets initialized successfully' };
}

function setupSheetHeaders(sheet, sheetName) {
  let headers = [];

  switch(sheetName) {
    case SHEET_NAMES.PATIENT_LIST:
      headers = ['Timestamp', 'HN', 'ชื่อ-นามสกุล', 'อายุ', 'เพศ', 'Dx', 'Allergies', 'Admission Date', 'Status', 'Ward'];
      break;
    case SHEET_NAMES.VITAL_SIGNS:
      headers = ['Timestamp', 'HN', 'Date', 'Time', 'Temp (°C)', 'HR (bpm)', 'RR (bpm)', 'BP (mmHg)', 'SpO₂ (%)', 'O₂ Support', 'O₂ Flow', 'Pain Score', 'GCS', 'Recorded By'];
      break;
    case SHEET_NAMES.INTAKE_OUTPUT:
      headers = ['Timestamp', 'HN', 'Date', 'Time', 'Intake (mL)', 'Output (mL)', 'Balance (mL)', 'Urine (mL)', 'Stool Type', 'Stool Color', 'Stool Amount', 'Vomit (mL)', 'Drain (mL)', 'Other', 'Recorded By'];
      break;
    case SHEET_NAMES.CLINICAL:
      headers = ['Timestamp', 'HN', 'Date', 'Time', 'Chief Complaint', 'Assessment', 'Plan', 'Note', 'Recorded By'];
      break;
    case SHEET_NAMES.ACTIVITY:
      headers = ['Timestamp', 'HN', 'Date', 'Time', 'Activity Type', 'Duration (min)', 'Distance (m)', 'Note', 'Recorded By'];
      break;
    case SHEET_NAMES.MEDICATION:
      headers = ['Timestamp', 'HN', 'Med Name', 'Dose', 'Frequency', 'Route', 'Start Date', 'End Date', 'Status', 'Indication', 'Recorded By'];
      break;
    case SHEET_NAMES.BEHAVIOR:
      headers = ['Timestamp', 'HN', 'Date', 'Time', 'Behavior Type', 'Severity', 'Trigger', 'Intervention', 'Outcome', 'Recorded By'];
      break;
    case SHEET_NAMES.MAR:
      headers = ['Timestamp', 'HN', 'Date', 'Time', 'Med Name', 'Dose', 'Route', 'Given By', 'Remarks'];
      break;
    case SHEET_NAMES.LAB_RECORD:
      headers = ['Timestamp', 'HN', 'Date', 'Lab Type', 'Test Name', 'Result', 'Unit', 'Normal Range', 'Flag', 'Recorded By'];
      break;
    case SHEET_NAMES.MEDICATION_LOG:
      headers = ['Timestamp', 'HN', 'Date', 'Action', 'Med Name', 'Old Value', 'New Value', 'Reason', 'Recorded By'];
      break;
  }

  if (headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold')
      .setBackground('#4A5568')
      .setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
}

// ============================================
// Helper Functions
// ============================================

function getSpreadsheet() {
  let ss;
  if (SPREADSHEET_ID) {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.create('Patient Management Database');
      PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
    }
  }
  return ss;
}

function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    initializeSheets();
    sheet = ss.getSheetByName(sheetName);
  }
  return sheet;
}

function getCurrentTimestamp() {
  return new Date();
}

function formatDate(date) {
  if (!date) return '';
  if (typeof date === 'string') date = new Date(date);
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function formatDateTime(date) {
  if (!date) return '';
  if (typeof date === 'string') date = new Date(date);
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

// ============================================
// Patient Management Functions
// ============================================

function getAllPatients() {
  const sheet = getSheet(SHEET_NAMES.PATIENT_LIST);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  const headers = data[0];
  const patients = [];

  for (let i = 1; i < data.length; i++) {
    const patient = {};
    headers.forEach((header, index) => {
      patient[header] = data[i][index];
    });
    patients.push(patient);
  }

  return patients;
}

function getPatientByHN(hn) {
  const patients = getAllPatients();
  return patients.find(p => p.HN === hn) || null;
}

function addPatient(patientData) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    const sheet = getSheet(SHEET_NAMES.PATIENT_LIST);
    const timestamp = getCurrentTimestamp();

    // Check if HN already exists
    const existing = getPatientByHN(patientData.hn);
    if (existing) {
      throw new Error('HN already exists');
    }

    const rowData = [
      timestamp,
      patientData.hn,
      patientData.name,
      patientData.age,
      patientData.gender,
      patientData.dx,
      patientData.allergies || '',
      patientData.admissionDate || formatDate(new Date()),
      patientData.status || 'Active',
      patientData.ward || ''
    ];

    sheet.appendRow(rowData);

    return { success: true, message: 'Patient added successfully', hn: patientData.hn };
  } catch (error) {
    return { success: false, message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

function updatePatient(hn, patientData) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    const sheet = getSheet(SHEET_NAMES.PATIENT_LIST);
    const data = sheet.getDataRange().getValues();

    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === hn) { // HN is in column 2 (index 1)
        rowIndex = i + 1; // Sheet rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Patient not found');
    }

    const rowData = [
      data[rowIndex - 1][0], // Keep original timestamp
      hn,
      patientData.name,
      patientData.age,
      patientData.gender,
      patientData.dx,
      patientData.allergies || '',
      patientData.admissionDate,
      patientData.status,
      patientData.ward || ''
    ];

    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);

    return { success: true, message: 'Patient updated successfully' };
  } catch (error) {
    return { success: false, message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

function deletePatient(hn) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    const sheet = getSheet(SHEET_NAMES.PATIENT_LIST);
    const data = sheet.getDataRange().getValues();

    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === hn) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Patient not found');
    }

    sheet.deleteRow(rowIndex);

    return { success: true, message: 'Patient deleted successfully' };
  } catch (error) {
    return { success: false, message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

// ============================================
// Vital Signs Functions
// ============================================

function addVitalSigns(vitalData) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    const sheet = getSheet(SHEET_NAMES.VITAL_SIGNS);
    const timestamp = vitalData.timestamp || getCurrentTimestamp();

    const rowData = [
      timestamp,
      vitalData.hn,
      vitalData.date || formatDate(new Date()),
      vitalData.time,
      vitalData.temp,
      vitalData.hr,
      vitalData.rr,
      vitalData.bp,
      vitalData.spo2,
      vitalData.o2Support,
      vitalData.o2Flow || '',
      vitalData.painScore || '',
      vitalData.gcs || '',
      vitalData.recordedBy
    ];

    sheet.appendRow(rowData);

    return { success: true, message: 'Vital signs recorded successfully' };
  } catch (error) {
    return { success: false, message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

function getVitalSignsByHN(hn, limit = 50) {
  const sheet = getSheet(SHEET_NAMES.VITAL_SIGNS);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  const headers = data[0];
  const vitals = [];

  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === hn) { // HN column
      const vital = {};
      headers.forEach((header, index) => {
        vital[header] = data[i][index];
      });
      vitals.push(vital);

      if (vitals.length >= limit) break;
    }
  }

  return vitals.reverse();
}

// ============================================
// Intake/Output Functions
// ============================================

function addIntakeOutput(ioData) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    const sheet = getSheet(SHEET_NAMES.INTAKE_OUTPUT);
    const timestamp = ioData.timestamp || getCurrentTimestamp();

    const intake = parseFloat(ioData.intake) || 0;
    const output = parseFloat(ioData.output) || 0;
    const balance = intake - output;

    const rowData = [
      timestamp,
      ioData.hn,
      ioData.date || formatDate(new Date()),
      ioData.time,
      intake,
      output,
      balance,
      ioData.urine || '',
      ioData.stoolType || '',
      ioData.stoolColor || '',
      ioData.stoolAmount || '',
      ioData.vomit || '',
      ioData.drain || '',
      ioData.other || '',
      ioData.recordedBy
    ];

    sheet.appendRow(rowData);

    return { success: true, message: 'I/O recorded successfully', balance: balance };
  } catch (error) {
    return { success: false, message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

function getIntakeOutputByHN(hn, limit = 50) {
  const sheet = getSheet(SHEET_NAMES.INTAKE_OUTPUT);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  const headers = data[0];
  const records = [];

  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === hn) {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = data[i][index];
      });
      records.push(record);

      if (records.length >= limit) break;
    }
  }

  return records.reverse();
}

// ============================================
// Clinical Notes Functions
// ============================================

function addClinicalNote(clinicalData) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    const sheet = getSheet(SHEET_NAMES.CLINICAL);
    const timestamp = clinicalData.timestamp || getCurrentTimestamp();

    const rowData = [
      timestamp,
      clinicalData.hn,
      clinicalData.date || formatDate(new Date()),
      clinicalData.time,
      clinicalData.chiefComplaint || '',
      clinicalData.assessment || '',
      clinicalData.plan || '',
      clinicalData.note || '',
      clinicalData.recordedBy
    ];

    sheet.appendRow(rowData);

    return { success: true, message: 'Clinical note recorded successfully' };
  } catch (error) {
    return { success: false, message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

function getClinicalNotesByHN(hn, limit = 50) {
  const sheet = getSheet(SHEET_NAMES.CLINICAL);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  const headers = data[0];
  const notes = [];

  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === hn) {
      const note = {};
      headers.forEach((header, index) => {
        note[header] = data[i][index];
      });
      notes.push(note);

      if (notes.length >= limit) break;
    }
  }

  return notes.reverse();
}

// ============================================
// Activity Functions
// ============================================

function addActivity(activityData) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    const sheet = getSheet(SHEET_NAMES.ACTIVITY);
    const timestamp = activityData.timestamp || getCurrentTimestamp();

    const rowData = [
      timestamp,
      activityData.hn,
      activityData.date || formatDate(new Date()),
      activityData.time,
      activityData.activityType,
      activityData.duration || '',
      activityData.distance || '',
      activityData.note || '',
      activityData.recordedBy
    ];

    sheet.appendRow(rowData);

    return { success: true, message: 'Activity recorded successfully' };
  } catch (error) {
    return { success: false, message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

function getActivitiesByHN(hn, limit = 50) {
  const sheet = getSheet(SHEET_NAMES.ACTIVITY);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  const headers = data[0];
  const activities = [];

  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === hn) {
      const activity = {};
      headers.forEach((header, index) => {
        activity[header] = data[i][index];
      });
      activities.push(activity);

      if (activities.length >= limit) break;
    }
  }

  return activities.reverse();
}

// ============================================
// Medication Functions
// ============================================

function addMedication(medData) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    const sheet = getSheet(SHEET_NAMES.MEDICATION);
    const timestamp = getCurrentTimestamp();

    const rowData = [
      timestamp,
      medData.hn,
      medData.medName,
      medData.dose,
      medData.frequency,
      medData.route,
      medData.startDate || formatDate(new Date()),
      medData.endDate || '',
      medData.status || 'Active',
      medData.indication || '',
      medData.recordedBy
    ];

    sheet.appendRow(rowData);

    // Log medication change
    logMedicationChange(medData.hn, 'Added', medData.medName, '', medData.dose, 'New medication', medData.recordedBy);

    return { success: true, message: 'Medication added successfully' };
  } catch (error) {
    return { success: false, message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

function getMedicationsByHN(hn) {
  const sheet = getSheet(SHEET_NAMES.MEDICATION);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  const headers = data[0];
  const medications = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === hn) {
      const med = {};
      headers.forEach((header, index) => {
        med[header] = data[i][index];
      });
      medications.push(med);
    }
  }

  return medications;
}

function updateMedicationStatus(hn, medName, newStatus, reason, recordedBy) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    const sheet = getSheet(SHEET_NAMES.MEDICATION);
    const data = sheet.getDataRange().getValues();

    let updated = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === hn && data[i][2] === medName) {
        const oldStatus = data[i][8];
        sheet.getRange(i + 1, 9).setValue(newStatus);

        // Log medication change
        logMedicationChange(hn, 'Status Changed', medName, oldStatus, newStatus, reason, recordedBy);
        updated = true;
        break;
      }
    }

    if (!updated) {
      throw new Error('Medication not found');
    }

    return { success: true, message: 'Medication status updated successfully' };
  } catch (error) {
    return { success: false, message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

// ============================================
// Behavior Functions
// ============================================

function addBehavior(behaviorData) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    const sheet = getSheet(SHEET_NAMES.BEHAVIOR);
    const timestamp = behaviorData.timestamp || getCurrentTimestamp();

    const rowData = [
      timestamp,
      behaviorData.hn,
      behaviorData.date || formatDate(new Date()),
      behaviorData.time,
      behaviorData.behaviorType,
      behaviorData.severity || '',
      behaviorData.trigger || '',
      behaviorData.intervention || '',
      behaviorData.outcome || '',
      behaviorData.recordedBy
    ];

    sheet.appendRow(rowData);

    return { success: true, message: 'Behavior recorded successfully' };
  } catch (error) {
    return { success: false, message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

function getBehaviorsByHN(hn, limit = 50) {
  const sheet = getSheet(SHEET_NAMES.BEHAVIOR);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  const headers = data[0];
  const behaviors = [];

  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === hn) {
      const behavior = {};
      headers.forEach((header, index) => {
        behavior[header] = data[i][index];
      });
      behaviors.push(behavior);

      if (behaviors.length >= limit) break;
    }
  }

  return behaviors.reverse();
}

// ============================================
// MAR (Medication Administration Record) Functions
// ============================================

function addMAR(marData) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    const sheet = getSheet(SHEET_NAMES.MAR);
    const timestamp = marData.timestamp || getCurrentTimestamp();

    const rowData = [
      timestamp,
      marData.hn,
      marData.date || formatDate(new Date()),
      marData.time,
      marData.medName,
      marData.dose,
      marData.route,
      marData.givenBy,
      marData.remarks || ''
    ];

    sheet.appendRow(rowData);

    return { success: true, message: 'Medication administration recorded successfully' };
  } catch (error) {
    return { success: false, message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

function getMARByHN(hn, date) {
  const sheet = getSheet(SHEET_NAMES.MAR);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  const headers = data[0];
  const records = [];
  const targetDate = date || formatDate(new Date());

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === hn && data[i][2] === targetDate) {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = data[i][index];
      });
      records.push(record);
    }
  }

  return records;
}

// ============================================
// Lab Record Functions
// ============================================

function addLabRecord(labData) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    const sheet = getSheet(SHEET_NAMES.LAB_RECORD);
    const timestamp = labData.timestamp || getCurrentTimestamp();

    // Check if result is abnormal
    const flag = checkLabFlag(labData.testName, labData.result);

    const rowData = [
      timestamp,
      labData.hn,
      labData.date || formatDate(new Date()),
      labData.labType,
      labData.testName,
      labData.result,
      labData.unit,
      labData.normalRange || '',
      flag,
      labData.recordedBy
    ];

    sheet.appendRow(rowData);

    return {
      success: true,
      message: 'Lab result recorded successfully',
      flag: flag
    };
  } catch (error) {
    return { success: false, message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

function checkLabFlag(testName, result) {
  const numResult = parseFloat(result);
  if (isNaN(numResult)) return '';

  const range = LAB_NORMAL_RANGES[testName];
  if (!range) return '';

  if (numResult < range.min) return 'L';
  if (numResult > range.max) return 'H';
  return 'N';
}

function getLabRecordsByHN(hn, limit = 100) {
  const sheet = getSheet(SHEET_NAMES.LAB_RECORD);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  const headers = data[0];
  const records = [];

  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === hn) {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = data[i][index];
      });
      records.push(record);

      if (records.length >= limit) break;
    }
  }

  return records.reverse();
}

function getAbnormalLabs(hn) {
  const allLabs = getLabRecordsByHN(hn);
  return allLabs.filter(lab => lab.Flag === 'H' || lab.Flag === 'L');
}

// ============================================
// Medication Log Functions
// ============================================

function logMedicationChange(hn, action, medName, oldValue, newValue, reason, recordedBy) {
  const sheet = getSheet(SHEET_NAMES.MEDICATION_LOG);
  const timestamp = getCurrentTimestamp();

  const rowData = [
    timestamp,
    hn,
    formatDate(new Date()),
    action,
    medName,
    oldValue,
    newValue,
    reason,
    recordedBy
  ];

  sheet.appendRow(rowData);
}

function getMedicationLogByHN(hn, limit = 50) {
  const sheet = getSheet(SHEET_NAMES.MEDICATION_LOG);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  const headers = data[0];
  const logs = [];

  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === hn) {
      const log = {};
      headers.forEach((header, index) => {
        log[header] = data[i][index];
      });
      logs.push(log);

      if (logs.length >= limit) break;
    }
  }

  return logs.reverse();
}

// ============================================
// Dashboard & Analytics Functions
// ============================================

function getDashboardData(hn, dateRange = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);

  return {
    patient: getPatientByHN(hn),
    vitals: getVitalSignsByHN(hn, 50),
    intakeOutput: getIntakeOutputByHN(hn, 50),
    medications: getMedicationsByHN(hn),
    labs: getLabRecordsByHN(hn, 50),
    abnormalLabs: getAbnormalLabs(hn),
    clinicalNotes: getClinicalNotesByHN(hn, 20),
    activities: getActivitiesByHN(hn, 20),
    behaviors: getBehaviorsByHN(hn, 20)
  };
}

function getDailySummary(hn, date) {
  const targetDate = date || formatDate(new Date());

  // Get all data for the specified date
  const vitals = getVitalSignsByHN(hn).filter(v => v.Date === targetDate);
  const io = getIntakeOutputByHN(hn).filter(i => i.Date === targetDate);
  const clinical = getClinicalNotesByHN(hn).filter(c => c.Date === targetDate);
  const mar = getMARByHN(hn, targetDate);
  const behaviors = getBehaviorsByHN(hn).filter(b => b.Date === targetDate);

  // Calculate averages and totals
  const avgTemp = vitals.length > 0 ?
    vitals.reduce((sum, v) => sum + parseFloat(v['Temp (°C)'] || 0), 0) / vitals.length : 0;

  const avgHR = vitals.length > 0 ?
    vitals.reduce((sum, v) => sum + parseFloat(v['HR (bpm)'] || 0), 0) / vitals.length : 0;

  const totalIntake = io.reduce((sum, i) => sum + parseFloat(i['Intake (mL)'] || 0), 0);
  const totalOutput = io.reduce((sum, i) => sum + parseFloat(i['Output (mL)'] || 0), 0);
  const balance = totalIntake - totalOutput;

  return {
    date: targetDate,
    vitals: {
      count: vitals.length,
      avgTemp: avgTemp.toFixed(1),
      avgHR: avgHR.toFixed(0),
      data: vitals
    },
    intakeOutput: {
      totalIntake: totalIntake,
      totalOutput: totalOutput,
      balance: balance,
      data: io
    },
    medications: mar,
    clinical: clinical,
    behaviors: behaviors
  };
}

function getChartData(hn, dataType, days = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let chartData = {
    labels: [],
    datasets: []
  };

  switch(dataType) {
    case 'vitals':
      const vitals = getVitalSignsByHN(hn, days * 10);
      const tempData = [];
      const hrData = [];
      const spo2Data = [];
      const labels = [];

      vitals.forEach(v => {
        const dateTime = `${v.Date} ${v.Time}`;
        labels.push(dateTime);
        tempData.push(parseFloat(v['Temp (°C)']) || null);
        hrData.push(parseFloat(v['HR (bpm)']) || null);
        spo2Data.push(parseFloat(v['SpO₂ (%)']) || null);
      });

      chartData = {
        labels: labels,
        datasets: [
          { label: 'Temperature (°C)', data: tempData, borderColor: 'rgb(239, 68, 68)', yAxisID: 'y' },
          { label: 'Heart Rate (bpm)', data: hrData, borderColor: 'rgb(59, 130, 246)', yAxisID: 'y1' },
          { label: 'SpO₂ (%)', data: spo2Data, borderColor: 'rgb(16, 185, 129)', yAxisID: 'y2' }
        ]
      };
      break;

    case 'io':
      const io = getIntakeOutputByHN(hn, days * 10);
      const intakeData = [];
      const outputData = [];
      const balanceData = [];
      const ioLabels = [];

      io.forEach(i => {
        const dateTime = `${i.Date} ${i.Time}`;
        ioLabels.push(dateTime);
        intakeData.push(parseFloat(i['Intake (mL)']) || 0);
        outputData.push(parseFloat(i['Output (mL)']) || 0);
        balanceData.push(parseFloat(i['Balance (mL)']) || 0);
      });

      chartData = {
        labels: ioLabels,
        datasets: [
          { label: 'Intake (mL)', data: intakeData, backgroundColor: 'rgba(59, 130, 246, 0.5)' },
          { label: 'Output (mL)', data: outputData, backgroundColor: 'rgba(239, 68, 68, 0.5)' },
          { label: 'Balance (mL)', data: balanceData, type: 'line', borderColor: 'rgb(16, 185, 129)' }
        ]
      };
      break;

    case 'labs':
      const labs = getLabRecordsByHN(hn, 100);
      // Group by test name
      const labsByTest = {};
      labs.forEach(lab => {
        if (!labsByTest[lab['Test Name']]) {
          labsByTest[lab['Test Name']] = [];
        }
        labsByTest[lab['Test Name']].push({
          date: lab.Date,
          result: parseFloat(lab.Result) || null
        });
      });

      const labDatasets = [];
      const colors = ['rgb(239, 68, 68)', 'rgb(59, 130, 246)', 'rgb(16, 185, 129)', 'rgb(245, 158, 11)', 'rgb(139, 92, 246)'];
      let colorIndex = 0;

      Object.keys(labsByTest).forEach(testName => {
        const testData = labsByTest[testName];
        labDatasets.push({
          label: testName,
          data: testData.map(d => d.result),
          borderColor: colors[colorIndex % colors.length],
          fill: false
        });
        colorIndex++;
      });

      chartData = {
        labels: labs.map(l => l.Date).filter((v, i, a) => a.indexOf(v) === i),
        datasets: labDatasets
      };
      break;
  }

  return chartData;
}

// ============================================
// Utility Functions for Dropdowns
// ============================================

function getDropdownOptions(optionType) {
  return DROPDOWN_OPTIONS[optionType] || [];
}

function getAllDropdownOptions() {
  return DROPDOWN_OPTIONS;
}

// ============================================
// Trigger Functions
// ============================================

function onEdit(e) {
  // This function can be used to automatically update dashboard or trigger alerts
  // when data is manually edited in the sheet
  const sheet = e.source.getActiveSheet();
  const range = e.range;

  // Add any custom logic here for real-time updates
}

// ============================================
// Search & Filter Functions
// ============================================

function searchPatients(query) {
  const patients = getAllPatients();
  const lowerQuery = query.toLowerCase();

  return patients.filter(p =>
    p.HN.toLowerCase().includes(lowerQuery) ||
    p['ชื่อ-นามสกุล'].toLowerCase().includes(lowerQuery) ||
    p.Dx.toLowerCase().includes(lowerQuery)
  );
}

function getActivePatients() {
  const patients = getAllPatients();
  return patients.filter(p => p.Status === 'Active');
}

function getPatientsByWard(ward) {
  const patients = getAllPatients();
  return patients.filter(p => p.Ward === ward);
}
