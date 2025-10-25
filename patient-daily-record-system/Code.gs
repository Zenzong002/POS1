/**
 * ========================================
 * PATIENT DAILY RECORD SYSTEM
 * Google Apps Script Backend
 * ========================================
 *
 * ระบบบันทึกข้อมูลผู้ป่วยรายวัน (Patient Daily Record System)
 * สำหรับผู้ป่วย B1
 *
 * Sheets:
 * 1. DailyVitals - Vital Signs + I/O + Clinical Observations
 * 2. DailyActivity - PT/OT + Mobility + Sleep/Behavior
 * 3. Medication - Medication Administration Record
 * 4. Lab - Laboratory Results
 * 5. Summary - Daily Summary by Shift
 */

// ========================================
// CONFIGURATION
// ========================================

/**
 * ⚠️ สำคัญ: ใส่ SPREADSHEET_ID ของคุณที่นี่
 * หา ID จาก URL: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
 */
const SPREADSHEET_ID = ''; // ใส่ ID ของ Google Sheet ที่นี่

// Sheet Names
const SHEET_NAMES = {
  DAILY_VITALS: 'DailyVitals',
  DAILY_ACTIVITY: 'DailyActivity',
  MEDICATION: 'Medication',
  LAB: 'Lab',
  SUMMARY: 'Summary'
};

// Patient Info (ปรับแต่งได้)
const PATIENT_INFO = {
  name: 'B1',
  hn: 'HN001'
};

// ========================================
// WEB APP ENTRY POINT
// ========================================

/**
 * doGet - เปิดหน้า Web App
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Patient Daily Record System - B1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ========================================
// SHEET INITIALIZATION
// ========================================

/**
 * initializeSheets - สร้างและตั้งค่า Headers สำหรับทุก Sheet
 * เรียกใช้ครั้งแรกเพื่อสร้างโครงสร้างข้อมูล
 */
function initializeSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 1. DailyVitals Sheet
  const vitalsSheet = getOrCreateSheet(SHEET_NAMES.DAILY_VITALS);
  if (vitalsSheet.getLastRow() === 0) {
    vitalsSheet.appendRow([
      'Timestamp', 'RecordDate', 'RecordTime', 'PatientName', 'HN',
      // Vital Signs
      'Temperature', 'BP_Systolic', 'BP_Diastolic', 'HeartRate', 'RespiratoryRate',
      'SpO2', 'GCS', 'O2Support', 'O2_LPM',
      // I/O
      'Intake', 'Urine', 'Stool', 'Suction', 'SecretionColor', 'StoolColor', 'StoolType',
      // Clinical
      'Rash', 'LungSound', 'Edema', 'Cyanosis', 'Hypoxia', 'TryWean'
    ]);
    vitalsSheet.getRange(1, 1, 1, vitalsSheet.getLastColumn()).setFontWeight('bold');
  }

  // 2. DailyActivity Sheet
  const activitySheet = getOrCreateSheet(SHEET_NAMES.DAILY_ACTIVITY);
  if (activitySheet.getLastRow() === 0) {
    activitySheet.appendRow([
      'Timestamp', 'RecordDate', 'RecordTime', 'PatientName', 'HN',
      // PT
      'PT_Mobility', 'PT_Balance', 'PT_Strength', 'PT_Gait', 'PT_Aerobic', 'PT_ChestPT',
      // OT
      'OT_MouthCare', 'OT_OralMotor', 'OT_VitalStim', 'OT_Speech', 'OT_Cognitive',
      // Mobility Time
      'SittingTime', 'StandingTime',
      // Sleep/Behavior
      'ApneaDay', 'ApneaNight', 'SleepDay', 'SleepNight', 'Agitation', 'Delirium',
      // Symptoms
      'Symptoms', 'PRN_Medication', 'ChiefComplaint'
    ]);
    activitySheet.getRange(1, 1, 1, activitySheet.getLastColumn()).setFontWeight('bold');
  }

  // 3. Medication Sheet
  const medSheet = getOrCreateSheet(SHEET_NAMES.MEDICATION);
  if (medSheet.getLastRow() === 0) {
    medSheet.appendRow([
      'Timestamp', 'RecordDate', 'RecordTime', 'PatientName', 'HN',
      'DrugName', 'Dose', 'Frequency', 'Route', 'TimeGiven', 'Note'
    ]);
    medSheet.getRange(1, 1, 1, medSheet.getLastColumn()).setFontWeight('bold');
  }

  // 4. Lab Sheet
  const labSheet = getOrCreateSheet(SHEET_NAMES.LAB);
  if (labSheet.getLastRow() === 0) {
    labSheet.appendRow([
      'Timestamp', 'RecordDate', 'RecordTime', 'PatientName', 'HN',
      // CBC
      'WBC', 'Neutrophil', 'Lymphocyte', 'RBC', 'Hb', 'Hct', 'Platelet', 'CRP',
      // LFT
      'TotalProtein', 'Albumin', 'AST', 'ALT', 'ALP',
      // Renal & Electrolytes
      'BUN', 'Creatinine', 'eGFR', 'Na', 'K', 'Cl', 'HCO3',
      // Vitamins & Minerals
      'VitaminD', 'Ca', 'Mg', 'Phosphate',
      // Other
      'SputumCS', 'CXR'
    ]);
    labSheet.getRange(1, 1, 1, labSheet.getLastColumn()).setFontWeight('bold');
  }

  // 5. Summary Sheet
  const summarySheet = getOrCreateSheet(SHEET_NAMES.SUMMARY);
  if (summarySheet.getLastRow() === 0) {
    summarySheet.appendRow([
      'Timestamp', 'Date', 'Shift', 'PatientName', 'HN', 'SummaryData'
    ]);
    summarySheet.getRange(1, 1, 1, summarySheet.getLastColumn()).setFontWeight('bold');
  }

  return 'All sheets initialized successfully!';
}

/**
 * getOrCreateSheet - สร้าง Sheet ถ้ายังไม่มี
 */
function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

// ========================================
// DAILY VITALS - Vital Signs + I/O + Clinical
// ========================================

/**
 * saveDailyVitals - บันทึก Vital Signs + I/O + Clinical Observations
 */
function saveDailyVitals(data) {
  try {
    const sheet = getOrCreateSheet(SHEET_NAMES.DAILY_VITALS);
    const timestamp = new Date();

    sheet.appendRow([
      timestamp,
      data.recordDate || new Date().toISOString().split('T')[0],
      data.recordTime || new Date().toTimeString().split(' ')[0],
      PATIENT_INFO.name,
      PATIENT_INFO.hn,
      // Vital Signs
      data.temperature || '',
      data.bpSystolic || '',
      data.bpDiastolic || '',
      data.heartRate || '',
      data.respiratoryRate || '',
      data.spo2 || '',
      data.gcs || '',
      data.o2Support || '',
      data.o2LPM || '',
      // I/O
      data.intake || 0,
      data.urine || 0,
      data.stool || 0,
      data.suction || 0,
      data.secretionColor || '',
      data.stoolColor || '',
      data.stoolType || '',
      // Clinical
      data.rash || '',
      data.lungSound || '',
      data.edema || '',
      data.cyanosis || '',
      data.hypoxia || '',
      data.tryWean || 0
    ]);

    return { success: true, message: 'บันทึก Vital Signs สำเร็จ' };
  } catch (error) {
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * getDailyVitals - ดึงข้อมูล Vital Signs ตามช่วงวัน
 */
function getDailyVitals(days = 30) {
  try {
    const sheet = getOrCreateSheet(SHEET_NAMES.DAILY_VITALS);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) return [];

    const headers = data[0];
    const rows = data.slice(1);

    // คำนวณวันที่เริ่มต้น
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // กรองข้อมูลตามวันที่
    const filtered = rows.filter(row => {
      const recordDate = new Date(row[1]); // RecordDate column
      return recordDate >= startDate;
    });

    // แปลงเป็น Object
    return filtered.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
  } catch (error) {
    Logger.log('Error in getDailyVitals: ' + error);
    return [];
  }
}

// ========================================
// DAILY ACTIVITY - PT/OT + Mobility + Sleep/Behavior
// ========================================

/**
 * saveDailyActivity - บันทึก PT/OT + Mobility + Sleep/Behavior
 */
function saveDailyActivity(data) {
  try {
    const sheet = getOrCreateSheet(SHEET_NAMES.DAILY_ACTIVITY);
    const timestamp = new Date();

    sheet.appendRow([
      timestamp,
      data.recordDate || new Date().toISOString().split('T')[0],
      data.recordTime || new Date().toTimeString().split(' ')[0],
      PATIENT_INFO.name,
      PATIENT_INFO.hn,
      // PT
      data.pt_mobility || false,
      data.pt_balance || false,
      data.pt_strength || false,
      data.pt_gait || false,
      data.pt_aerobic || false,
      data.pt_chestPT || false,
      // OT
      data.ot_mouthCare || false,
      data.ot_oralMotor || false,
      data.ot_vitalStim || false,
      data.ot_speech || false,
      data.ot_cognitive || false,
      // Mobility Time
      data.sittingTime || 0,
      data.standingTime || 0,
      // Sleep/Behavior
      data.apneaDay || 0,
      data.apneaNight || 0,
      data.sleepDay || 0,
      data.sleepNight || 0,
      data.agitation || 0,
      data.delirium || 0,
      // Symptoms
      data.symptoms || '',
      data.prnMedication || '',
      data.chiefComplaint || ''
    ]);

    return { success: true, message: 'บันทึก Activity สำเร็จ' };
  } catch (error) {
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * getDailyActivity - ดึงข้อมูล Activity
 */
function getDailyActivity(days = 30) {
  try {
    const sheet = getOrCreateSheet(SHEET_NAMES.DAILY_ACTIVITY);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) return [];

    const headers = data[0];
    const rows = data.slice(1);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const filtered = rows.filter(row => {
      const recordDate = new Date(row[1]);
      return recordDate >= startDate;
    });

    return filtered.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
  } catch (error) {
    Logger.log('Error in getDailyActivity: ' + error);
    return [];
  }
}

// ========================================
// MEDICATION - Medication Administration Record
// ========================================

/**
 * saveMedication - บันทึกการให้ยา
 */
function saveMedication(data) {
  try {
    const sheet = getOrCreateSheet(SHEET_NAMES.MEDICATION);
    const timestamp = new Date();

    sheet.appendRow([
      timestamp,
      data.recordDate || new Date().toISOString().split('T')[0],
      data.recordTime || new Date().toTimeString().split(' ')[0],
      PATIENT_INFO.name,
      PATIENT_INFO.hn,
      data.drugName || '',
      data.dose || '',
      data.frequency || '',
      data.route || '',
      data.timeGiven || '',
      data.note || ''
    ]);

    return { success: true, message: 'บันทึกยาสำเร็จ' };
  } catch (error) {
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * getMedications - ดึงข้อมูลการให้ยา
 */
function getMedications(days = 30) {
  try {
    const sheet = getOrCreateSheet(SHEET_NAMES.MEDICATION);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) return [];

    const headers = data[0];
    const rows = data.slice(1);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const filtered = rows.filter(row => {
      const recordDate = new Date(row[1]);
      return recordDate >= startDate;
    });

    return filtered.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
  } catch (error) {
    Logger.log('Error in getMedications: ' + error);
    return [];
  }
}

// ========================================
// LAB - Laboratory Results
// ========================================

/**
 * saveLabResults - บันทึกผล Lab
 */
function saveLabResults(data) {
  try {
    const sheet = getOrCreateSheet(SHEET_NAMES.LAB);
    const timestamp = new Date();

    sheet.appendRow([
      timestamp,
      data.recordDate || new Date().toISOString().split('T')[0],
      data.recordTime || new Date().toTimeString().split(' ')[0],
      PATIENT_INFO.name,
      PATIENT_INFO.hn,
      // CBC
      parseFloat(data.wbc) || '',
      parseFloat(data.neutrophil) || '',
      parseFloat(data.lymphocyte) || '',
      parseFloat(data.rbc) || '',
      parseFloat(data.hb) || '',
      parseFloat(data.hct) || '',
      parseFloat(data.platelet) || '',
      parseFloat(data.crp) || '',
      // LFT
      parseFloat(data.totalProtein) || '',
      parseFloat(data.albumin) || '',
      parseFloat(data.ast) || '',
      parseFloat(data.alt) || '',
      parseFloat(data.alp) || '',
      // Renal & Electrolytes
      parseFloat(data.bun) || '',
      parseFloat(data.creatinine) || '',
      parseFloat(data.egfr) || '',
      parseFloat(data.na) || '',
      parseFloat(data.k) || '',
      parseFloat(data.cl) || '',
      parseFloat(data.hco3) || '',
      // Vitamins & Minerals
      parseFloat(data.vitaminD) || '',
      parseFloat(data.ca) || '',
      parseFloat(data.mg) || '',
      parseFloat(data.phosphate) || '',
      // Other
      data.sputumCS || '',
      data.cxr || ''
    ]);

    return { success: true, message: 'บันทึกผล Lab สำเร็จ' };
  } catch (error) {
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * getLabResults - ดึงข้อมูลผล Lab
 */
function getLabResults(days = 90) {
  try {
    const sheet = getOrCreateSheet(SHEET_NAMES.LAB);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) return [];

    const headers = data[0];
    const rows = data.slice(1);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const filtered = rows.filter(row => {
      const recordDate = new Date(row[1]);
      return recordDate >= startDate;
    });

    return filtered.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
  } catch (error) {
    Logger.log('Error in getLabResults: ' + error);
    return [];
  }
}

// ========================================
// DASHBOARD DATA
// ========================================

/**
 * getDashboardData - ดึงข้อมูลสำหรับ Dashboard
 */
function getDashboardData(days = 7) {
  try {
    return {
      vitals: getDailyVitals(days),
      activity: getDailyActivity(days),
      medications: getMedications(days),
      labs: getLabResults(days)
    };
  } catch (error) {
    Logger.log('Error in getDashboardData: ' + error);
    return { vitals: [], activity: [], medications: [], labs: [] };
  }
}

// ========================================
// SUMMARY - สรุปข้อมูลตามเวร
// ========================================

/**
 * getSummary - สรุปข้อมูลตามเวร
 * @param {string} date - วันที่ (YYYY-MM-DD)
 * @param {string} shift - 'morning' (07:00-19:00) หรือ 'night' (19:00-07:00)
 */
function getSummary(date, shift) {
  try {
    const targetDate = new Date(date);
    const vitals = getDailyVitals(365); // ดึงข้อมูลย้อนหลัง 1 ปี
    const activity = getDailyActivity(365);
    const medications = getMedications(365);

    // กำหนดช่วงเวลา
    let startTime, endTime;
    if (shift === 'morning') {
      startTime = '07:00:00';
      endTime = '19:00:00';
    } else {
      startTime = '19:00:00';
      endTime = '07:00:00';
    }

    // กรองข้อมูลตามวันที่และเวลา
    const filterByShift = (data) => {
      return data.filter(item => {
        const recordDate = new Date(item.RecordDate);
        const recordTime = item.RecordTime;

        if (shift === 'morning') {
          return recordDate.toDateString() === targetDate.toDateString() &&
                 recordTime >= startTime && recordTime < endTime;
        } else {
          // Night shift (19:00 วันนี้ ถึง 07:00 วันถัดไป)
          const nextDay = new Date(targetDate);
          nextDay.setDate(nextDay.getDate() + 1);

          return (
            (recordDate.toDateString() === targetDate.toDateString() && recordTime >= startTime) ||
            (recordDate.toDateString() === nextDay.toDateString() && recordTime < endTime)
          );
        }
      });
    };

    const vitalData = filterByShift(vitals);
    const activityData = filterByShift(activity);
    const medData = filterByShift(medications);

    // คำนวณสถิติ Vital Signs
    const vitalStats = calculateVitalStats(vitalData);

    // คำนวณ I/O Balance
    const ioBalance = calculateIOBalance(vitalData);

    // รวม Activity
    const activitySummary = summarizeActivity(activityData);

    // สรุป Medications
    const medSummary = medData.map(med => ({
      drug: med.DrugName,
      dose: med.Dose,
      frequency: med.Frequency,
      route: med.Route,
      timeGiven: med.TimeGiven,
      note: med.Note
    }));

    const summary = {
      date: date,
      shift: shift === 'morning' ? 'เวรเช้า (07:00-19:00)' : 'เวรดึก (19:00-07:00)',
      patientName: PATIENT_INFO.name,
      hn: PATIENT_INFO.hn,
      recordCount: {
        vitals: vitalData.length,
        activity: activityData.length,
        medications: medData.length
      },
      vitalStats: vitalStats,
      ioBalance: ioBalance,
      activitySummary: activitySummary,
      medications: medSummary,
      generatedAt: new Date().toISOString()
    };

    // บันทึกลง Summary Sheet
    saveSummary(summary);

    return summary;
  } catch (error) {
    Logger.log('Error in getSummary: ' + error);
    return { error: error.toString() };
  }
}

/**
 * calculateVitalStats - คำนวณสถิติ Vital Signs
 */
function calculateVitalStats(data) {
  if (data.length === 0) return {};

  const stats = {
    temperature: { avg: 0, max: 0, min: 999, latest: 0 },
    heartRate: { avg: 0, max: 0, min: 999, latest: 0 },
    respiratoryRate: { avg: 0, max: 0, min: 999, latest: 0 },
    spo2: { avg: 0, max: 0, min: 999, latest: 0 },
    bpSystolic: { avg: 0, max: 0, min: 999, latest: 0 },
    bpDiastolic: { avg: 0, max: 0, min: 999, latest: 0 },
    gcs: { avg: 0, max: 0, min: 999, latest: 0 }
  };

  const fields = ['Temperature', 'HeartRate', 'RespiratoryRate', 'SpO2', 'BP_Systolic', 'BP_Diastolic', 'GCS'];
  const keys = ['temperature', 'heartRate', 'respiratoryRate', 'spo2', 'bpSystolic', 'bpDiastolic', 'gcs'];

  fields.forEach((field, index) => {
    const values = data.map(item => parseFloat(item[field])).filter(v => !isNaN(v) && v > 0);
    if (values.length > 0) {
      const key = keys[index];
      stats[key].avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
      stats[key].max = Math.max(...values).toFixed(1);
      stats[key].min = Math.min(...values).toFixed(1);
      stats[key].latest = values[values.length - 1].toFixed(1);
    }
  });

  return stats;
}

/**
 * calculateIOBalance - คำนวณ I/O Balance
 */
function calculateIOBalance(data) {
  let totalIntake = 0;
  let totalUrine = 0;
  let totalStool = 0;
  let totalSuction = 0;

  const stoolColors = [];
  const stoolTypes = [];
  const secretionColors = [];
  let stoolCount = 0;

  data.forEach(item => {
    totalIntake += parseFloat(item.Intake) || 0;
    totalUrine += parseFloat(item.Urine) || 0;

    const stoolAmt = parseFloat(item.Stool) || 0;
    if (stoolAmt > 0) {
      totalStool += stoolAmt;
      stoolCount++;
      if (item.StoolColor) stoolColors.push(item.StoolColor);
      if (item.StoolType) stoolTypes.push(item.StoolType);
    }

    totalSuction += parseFloat(item.Suction) || 0;
    if (item.SecretionColor) secretionColors.push(item.SecretionColor);
  });

  const totalOutput = totalUrine + totalStool + totalSuction;
  const balance = totalIntake - totalOutput;

  return {
    intake: totalIntake,
    output: {
      urine: totalUrine,
      stool: totalStool,
      suction: totalSuction,
      total: totalOutput
    },
    balance: balance,
    stool: {
      count: stoolCount,
      colors: [...new Set(stoolColors)],
      types: [...new Set(stoolTypes)]
    },
    secretionColors: [...new Set(secretionColors)]
  };
}

/**
 * summarizeActivity - สรุป Activity
 */
function summarizeActivity(data) {
  let totalSitting = 0;
  let totalStanding = 0;
  let totalApneaDay = 0;
  let totalApneaNight = 0;
  let totalSleepDay = 0;
  let totalSleepNight = 0;
  let totalAgitation = 0;
  let totalDelirium = 0;

  const ptActivities = [];
  const otActivities = [];
  const symptoms = [];
  const prnMeds = [];
  const complaints = [];

  data.forEach(item => {
    totalSitting += parseFloat(item.SittingTime) || 0;
    totalStanding += parseFloat(item.StandingTime) || 0;
    totalApneaDay += parseFloat(item.ApneaDay) || 0;
    totalApneaNight += parseFloat(item.ApneaNight) || 0;
    totalSleepDay += parseFloat(item.SleepDay) || 0;
    totalSleepNight += parseFloat(item.SleepNight) || 0;
    totalAgitation += parseFloat(item.Agitation) || 0;
    totalDelirium += parseFloat(item.Delirium) || 0;

    // PT Activities
    if (item.PT_Mobility) ptActivities.push('Mobility');
    if (item.PT_Balance) ptActivities.push('Balance');
    if (item.PT_Strength) ptActivities.push('Strength');
    if (item.PT_Gait) ptActivities.push('Gait');
    if (item.PT_Aerobic) ptActivities.push('Aerobic');
    if (item.PT_ChestPT) ptActivities.push('Chest PT');

    // OT Activities
    if (item.OT_MouthCare) otActivities.push('Mouth Care');
    if (item.OT_OralMotor) otActivities.push('Oral Motor');
    if (item.OT_VitalStim) otActivities.push('VitalStim');
    if (item.OT_Speech) otActivities.push('Speech');
    if (item.OT_Cognitive) otActivities.push('Cognitive');

    if (item.Symptoms) symptoms.push(item.Symptoms);
    if (item.PRN_Medication) prnMeds.push(item.PRN_Medication);
    if (item.ChiefComplaint) complaints.push(item.ChiefComplaint);
  });

  return {
    mobility: {
      sitting: totalSitting,
      standing: totalStanding
    },
    sleep: {
      apneaDay: totalApneaDay,
      apneaNight: totalApneaNight,
      sleepDay: totalSleepDay.toFixed(1),
      sleepNight: totalSleepNight.toFixed(1)
    },
    behavior: {
      agitation: totalAgitation,
      delirium: totalDelirium
    },
    ptActivities: [...new Set(ptActivities)],
    otActivities: [...new Set(otActivities)],
    symptoms: [...new Set(symptoms.flatMap(s => s.split(',')))].filter(s => s.trim()),
    prnMedications: [...new Set(prnMeds)].filter(p => p.trim()),
    chiefComplaints: [...new Set(complaints)].filter(c => c.trim())
  };
}

/**
 * saveSummary - บันทึก Summary ลง Sheet
 */
function saveSummary(summary) {
  try {
    const sheet = getOrCreateSheet(SHEET_NAMES.SUMMARY);
    const timestamp = new Date();

    sheet.appendRow([
      timestamp,
      summary.date,
      summary.shift,
      summary.patientName,
      summary.hn,
      JSON.stringify(summary)
    ]);

    return { success: true };
  } catch (error) {
    Logger.log('Error in saveSummary: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * getPatientInfo - ดึงข้อมูลผู้ป่วย
 */
function getPatientInfo() {
  return PATIENT_INFO;
}

/**
 * testInitialize - ฟังก์ชันทดสอบการสร้าง Sheet
 */
function testInitialize() {
  return initializeSheets();
}
