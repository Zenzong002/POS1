# 🏥 Patient Daily Record System

> **ระบบบันทึกข้อมูลผู้ป่วยรายวันแบบครบวงจร สำหรับผู้ป่วย B1**

ระบบ Web Application สำหรับบันทึกและติดตามข้อมูลผู้ป่วยรายวัน พัฒนาด้วย Google Apps Script + HTML + CSS (Tailwind) + Chart.js โดยใช้ Google Sheets เป็นฐานข้อมูล

---

## 📋 สารบัญ

- [ภาพรวมระบบ](#ภาพรวมระบบ)
- [คุณสมบัติหลัก](#คุณสมบัติหลัก)
- [เทคโนโลยีที่ใช้](#เทคโนโลยีที่ใช้)
- [การติดตั้ง](#การติดตั้ง)
- [การใช้งาน](#การใช้งาน)
- [โครงสร้างข้อมูล](#โครงสร้างข้อมูล)
- [คำแนะนำสำหรับมือถือ](#คำแนะนำสำหรับมือถือ)
- [การแก้ไขปัญหา](#การแก้ไขปัญหา)

---

## 🎯 ภาพรวมระบบ

### วัตถุประสงค์
ระบบบันทึกข้อมูลผู้ป่วยรายวันแบบครบวงจร เพื่อใช้ในการดูแลผู้ป่วย B1 อย่างเป็นระบบ โดยสามารถ:
- ✅ บันทึกข้อมูลย้อนหลังได้ (ระบุวันที่และเวลา)
- ✅ ติดตามข้อมูลแบบ Real-time
- ✅ แสดงกราฟแนวโน้ม
- ✅ สรุปข้อมูลตามเวร (เช้า/ดึก)
- ✅ Export ข้อมูลได้

### จุดเด่น
- 🌐 **เข้าถึงได้ทุกที่** - ไม่ต้องติดตั้งซอฟต์แวร์
- 📱 **Responsive Design** - ใช้ได้ทั้งมือถือและคอมพิวเตอร์
- 💰 **ฟรี 100%** - ใช้ Google Workspace
- 🔒 **ปลอดภัย** - ข้อมูลเก็บบน Google Cloud
- ⚡ **รวดเร็ว** - UI/UX ที่ใช้งานง่าย
- 📊 **Visualization** - กราฟและสถิติแบบ Real-time

---

## 🚀 คุณสมบัติหลัก

### 1. 💉 Vital Signs Recording
บันทึก Vital Signs ครบถ้วน:
- Temperature (°C)
- Blood Pressure (Systolic/Diastolic)
- Heart Rate (bpm)
- Respiratory Rate (/min)
- SpO₂ (%)
- Glasgow Coma Scale (3-15)
- O₂ Support (Room Air, NC, Simple Mask, PRM, Venturi, CPAP, BiPAP, MV, HFNC)
- O₂ LPM (Flow rate)

### 2. 💧 Intake/Output Recording
บันทึก I/O พร้อมรายละเอียด:
- **Intake** (ml)
- **Output:**
  - Urine (ml)
  - Stool (ml) + สี + Bristol Stool Type
  - Suction (ml) + สีของสารคัดหลั่ง
- **คำนวณ Balance** อัตโนมัติ

**Secretion Colors:**
- ใส (Clear)
- ขาวขุ่น (White/Cloudy)
- เหลือง (Yellow)
- เขียว (Green)
- แดง (Red/Bloody)
- น้ำตาล (Brown)
- ดำ (Black)

**Stool Colors:**
- น้ำตาล (Brown - Normal)
- เหลือง (Yellow)
- เขียว (Green)
- ดำ (Black - Melena)
- แดง (Red - Fresh blood)
- ซีด/เทา (Pale/Gray)

**Bristol Stool Chart:**
- Type 1-7 (ก้อนแข็งเล็กๆ ถึง เหลวเป็นน้ำ)

### 3. 🩺 Clinical Observation
ติดตามอาการทางคลินิก:
- **Rash** (ผื่น): None / Mild / Moderate / Severe
- **Lung Sound** (เสียงปอด): Clear / Rhonchi / Wheezing / Crackles / Decreased
- **Edema** (บวมน้ำ): None / 1+ / 2+ / 3+ / 4+
- **Cyanosis & Hypoxia**: Yes/No
- **Try Wean** (นาที): ติดตามการถอด ventilator

### 4. 🏃 Activity & Therapy

**Physical Therapy (PT):**
- ☑ Mobility
- ☑ Balance
- ☑ Strength
- ☑ Gait
- ☑ Aerobic
- ☑ Chest PT

**Occupational Therapy (OT):**
- ☑ Mouth Care
- ☑ Oral Motor
- ☑ VitalStim
- ☑ Speech
- ☑ Cognitive

**Mobility Time:**
- Sitting Time (นาที)
- Standing Time (นาที)

### 5. 😊 Behavior & Symptoms

**Sleep/Apnea Monitoring:**
- Apnea Day (ครั้ง)
- Apnea Night (ครั้ง)
- Sleep Day (ชั่วโมง)
- Sleep Night (ชั่วโมง)

**Behavioral Issues:**
- Agitation (ครั้ง)
- Delirium (ครั้ง)

**Common Symptoms:**
- ☑ Fever
- ☑ Cough
- ☑ Runny Nose
- ☑ Vomiting
- ☑ Diarrhea
- ☑ Headache
- ☑ Seizure
- ☑ Rash

**Clinical Notes:**
- PRN Medication
- Chief Complaint

### 6. 💊 Medication Administration Record (MAR)
บันทึกการให้ยาครบถ้วน:
- Drug Name (ชื่อยา)
- Dose (ขนาด)
- **Frequency:** od, bid, tid, qid, hs, pc, ac, PRN, EOD
- **Route:** PO, IV, IM, SC, ID, Inhale, Topical
- Time Given (เวลาที่ให้ยา)
- Note (หมายเหตุ)

### 7. 🔬 Laboratory Results
บันทึกผล Lab แบบทศนิยม 2 ตำแหน่ง:

**Complete Blood Count (CBC):**
- WBC, Neutrophil %, Lymphocyte %, RBC, Hb, Hct, Platelet, CRP

**Liver Function Test (LFT):**
- Total Protein, Albumin, AST, ALT, ALP

**Renal Function & Electrolytes:**
- BUN, Creatinine, eGFR, Na, K, Cl, HCO₃

**Vitamins & Minerals:**
- Vitamin D, Ca, Mg, Phosphate

**Other Tests:**
- Sputum C/S (text field)
- CXR Report (textarea)

### 8. 📊 Dashboard
แสดงกราฟแนวโน้ม:
- **Vital Signs Trends** (Temperature, Heart Rate, SpO₂)
- **I/O Balance Chart** (Intake vs Output vs Balance)
- **Mobility Time** (Sitting, Standing)
- **Lab Values Trends** (เลือกได้: Albumin, Na, K, Hb, WBC, Creatinine)
- **Time Range:** 7 วัน / 14 วัน / 30 วัน / ทั้งหมด

### 9. 📋 Daily Summary
สรุปข้อมูลตามเวร:
- **เวรเช้า:** 07:00-19:00
- **เวรดึก:** 19:00-07:00

**สรุปประกอบด้วย:**
- จำนวนการบันทึก (Vitals, Activity, Medications)
- สถิติ Vital Signs (Avg/Max/Min/Latest)
- I/O Balance พร้อมรายละเอียด
- Stool Count + Colors + Bristol Types
- Secretion Colors
- Activity Summary (PT/OT, Sitting/Standing)
- Sleep & Apnea Summary
- Behavioral Issues
- Symptoms
- PRN Medications
- Chief Complaints
- Medications Given (ตาราง)
- **Export:** คัดลอกข้อมูลทั้งหมดไปยัง Clipboard

### 10. 📜 Medication Log
แสดงประวัติการให้ยาทั้งหมด:
- เรียงตาม Timestamp
- กรองตามช่วงวันที่
- แสดงเป็นตาราง

### 11. 📜 Lab Log
แสดงประวัติผล Lab ทั้งหมด:
- เรียงตาม Timestamp
- กรองตามช่วงวันที่
- แสดงเป็นการ์ด พร้อม CXR และ Sputum C/S

---

## 🛠️ เทคโนโลยีที่ใช้

| เทคโนโลยี | รายละเอียด |
|----------|-----------|
| **Backend** | Google Apps Script (Server-side JavaScript) |
| **Frontend** | HTML5 + Vanilla JavaScript |
| **Styling** | Tailwind CSS 3.x (CDN) |
| **Charts** | Chart.js 4.x (CDN) |
| **Database** | Google Sheets (5 sheets) |
| **Fonts** | Google Fonts - Sarabun |

---

## 📥 การติดตั้ง

### ขั้นตอนที่ 1: สร้าง Google Sheet

1. ไปที่ [Google Sheets](https://sheets.google.com)
2. สร้าง Spreadsheet ใหม่
3. ตั้งชื่อว่า **"Patient Daily Record System - B1"**
4. คัดลอก **Spreadsheet ID** จาก URL:
   ```
   https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   ```
   ตัวอย่าง: `1AbC2DeFgHiJkLmNoPqRsTuVwXyZ`

5. เก็บ ID ไว้ใช้ในขั้นตอนถัดไป

---

### ขั้นตอนที่ 2: เปิด Apps Script Editor

1. ในหน้า Google Sheet ที่สร้างไว้
2. คลิกเมนู **Extensions** > **Apps Script**
3. จะเปิดหน้า Apps Script Editor

---

### ขั้นตอนที่ 3: Copy โค้ดทั้งหมด

#### 3.1 Code.gs (Backend)

1. ใน Apps Script Editor จะมีไฟล์ **Code.gs** อยู่แล้ว
2. ลบโค้ดเก่าทิ้งทั้งหมด
3. **Copy โค้ดจากไฟล์ `Code.gs`** ทั้งหมดมาวางแทน
4. **⚠️ สำคัญ:** แก้ไขบรรทัดที่ 25:
   ```javascript
   const SPREADSHEET_ID = 'ใส่_SPREADSHEET_ID_ของคุณที่นี่';
   ```
   ตัวอย่าง:
   ```javascript
   const SPREADSHEET_ID = '1AbC2DeFgHiJkLmNoPqRsTuVwXyZ';
   ```

#### 3.2 Index.html (Frontend)

1. คลิกปุ่ม **+** ข้าง Files
2. เลือก **HTML**
3. ตั้งชื่อว่า **Index**
4. ลบโค้ดเก่าทิ้งทั้งหมด
5. **Copy โค้ดจากไฟล์ `Index.html`** ทั้งหมดมาวาง

---

### ขั้นตอนที่ 4: Initialize Sheets

1. ใน Apps Script Editor ให้คลิกที่ไฟล์ **Code.gs**
2. ในแถบเมนูด้านบน เลือก **Function:** dropdown
3. เลือก **`initializeSheets`**
4. กดปุ่ม **▶ Run**
5. ครั้งแรกจะขออนุญาต:
   - คลิก **Review Permissions**
   - เลือกบัญชี Google ของคุณ
   - คลิก **Advanced**
   - คลิก **Go to [Project Name] (unsafe)** (ปลอดภัย เพราะเป็นโปรเจคของคุณเอง)
   - คลิก **Allow**

6. เมื่อ Run เสร็จ กลับไปที่ Google Sheet
7. จะเห็น **5 sheets** ถูกสร้างขึ้น:
   - DailyVitals
   - DailyActivity
   - Medication
   - Lab
   - Summary

---

### ขั้นตอนที่ 5: Deploy Web App

1. ใน Apps Script Editor คลิกปุ่ม **Deploy** (มุมบนขวา)
2. เลือก **New deployment**
3. คลิกไอคอน **⚙️ (Settings)** ข้าง "Select type"
4. เลือก **Web app**
5. ตั้งค่าดังนี้:
   - **Description:** `Patient Daily Record System v1.0`
   - **Execute as:** `Me (อีเมลของคุณ)`
   - **Who has access:** `Anyone` (ถ้าต้องการให้คนอื่นใช้) หรือ `Only myself` (ถ้าใช้เองเท่านั้น)
6. คลิก **Deploy**
7. คัดลอก **Web app URL** ที่ได้
   ```
   https://script.google.com/macros/s/XXXXX/exec
   ```
8. เก็บ URL นี้ไว้ เป็น URL สำหรับเปิดใช้งานระบบ

---

### ขั้นตอนที่ 6: เปิดใช้งาน

1. เปิด Web browser (Chrome, Safari, Firefox)
2. วาง **Web app URL** ที่คัดลอกไว้
3. กด Enter
4. ระบบจะเปิดขึ้นมา พร้อมใช้งาน! 🎉

---

## 📱 การใช้งาน

### การบันทึกข้อมูล

#### 1. Vital Signs
1. คลิกแท็บ **💉 Vital Signs**
2. กรอกข้อมูล:
   - วันที่และเวลาบันทึก (default = วันนี้)
   - Vital Signs ทั้งหมด
   - I/O (Intake, Urine, Stool, Suction)
   - Clinical Observations
3. คลิก **💾 บันทึก Vital Signs**
4. จะมีแจ้งเตือนสีเขียว ✅ เมื่อบันทึกสำเร็จ

#### 2. Activity
1. คลิกแท็บ **🏃 Activity**
2. กรอกข้อมูล:
   - วันที่และเวลาบันทึก
   - เลือก PT/OT Activities (checkbox)
   - กรอก Sitting/Standing Time
   - Sleep & Apnea Monitoring
   - Behavioral Issues
   - เลือก Symptoms
   - PRN Medication & Chief Complaint
3. คลิก **💾 บันทึก Activity**

#### 3. Medication
1. คลิกแท็บ **💊 Medication**
2. กรอกข้อมูล:
   - วันที่และเวลาบันทึก
   - Drug Name, Dose, Frequency, Route
   - Time Given, Note
3. คลิก **💾 บันทึกยา**

#### 4. Lab
1. คลิกแท็บ **🔬 Lab**
2. กรอกข้อมูล:
   - วันที่และเวลาบันทึก
   - ผล Lab ทั้งหมด (CBC, LFT, Renal, Electrolytes, Vitamins)
   - Sputum C/S, CXR Report
3. คลิก **💾 บันทึกผล Lab**

---

### การดูข้อมูล

#### 1. Dashboard
1. คลิกแท็บ **📊 Dashboard**
2. เลือกช่วงเวลา (7/14/30 วัน หรือ ทั้งหมด)
3. ดูกราฟ:
   - Vital Signs Trends
   - I/O Balance
   - Mobility Time
   - Lab Values (เลือก Lab ที่ต้องการดู)
4. คลิก **🔄 Refresh Dashboard** เพื่ออัพเดตข้อมูล

#### 2. Summary
1. คลิกแท็บ **📋 Summary**
2. เลือก:
   - **วันที่:** วันที่ต้องการสรุป
   - **เวร:** เช้า (07:00-19:00) หรือ ดึก (19:00-07:00)
3. คลิก **📊 Generate Summary**
4. ดูสรุปข้อมูลทั้งหมด
5. คลิก **📋 Copy Summary to Clipboard** เพื่อคัดลอกข้อมูล

#### 3. Medication Log
1. คลิกแท็บ **📜 Med Log**
2. เลือกช่วงเวลา (7/14/30 วัน หรือ ทั้งหมด)
3. คลิก **🔄 Refresh**
4. ดูตารางประวัติการให้ยา

#### 4. Lab Log
1. คลิกแท็บ **📜 Lab Log**
2. เลือกช่วงเวลา (30/60/90 วัน หรือ ทั้งหมด)
3. คลิก **🔄 Refresh**
4. ดูการ์ดผล Lab ทั้งหมด

---

## 📊 โครงสร้างข้อมูล

### Sheet 1: DailyVitals
| คอลัมน์ | ประเภท | คำอธิบาย |
|--------|-------|---------|
| Timestamp | DateTime | เวลาที่บันทึกลงระบบ |
| RecordDate | Date | วันที่บันทึก |
| RecordTime | Time | เวลาที่บันทึก |
| PatientName | Text | ชื่อผู้ป่วย (B1) |
| HN | Text | Hospital Number |
| Temperature | Number | อุณหภูมิร่างกาย (°C) |
| BP_Systolic | Number | ความดันโลหิตตัวบน |
| BP_Diastolic | Number | ความดันโลหิตตัวล่าง |
| HeartRate | Number | อัตราการเต้นของหัวใจ |
| RespiratoryRate | Number | อัตราการหายใจ |
| SpO2 | Number | ออกซิเจนในเลือด (%) |
| GCS | Number | Glasgow Coma Scale (3-15) |
| O2Support | Text | ประเภทการช่วยหายใจ |
| O2_LPM | Number | อัตราการไหลของออกซิเจน |
| Intake | Number | ปริมาณน้ำเข้า (ml) |
| Urine | Number | ปัสสาวะ (ml) |
| Stool | Number | อุจจาระ (ml) |
| Suction | Number | สารคัดหลั่ง (ml) |
| SecretionColor | Text | สีของสารคัดหลั่ง |
| StoolColor | Text | สีของอุจจาระ |
| StoolType | Text | Bristol Stool Type |
| Rash | Text | ผื่น |
| LungSound | Text | เสียงปอด |
| Edema | Text | บวมน้ำ |
| Cyanosis | Text | ซีด |
| Hypoxia | Text | ขาดออกซิเจน |
| TryWean | Number | เวลาพยายามถอดเครื่อง (นาที) |

### Sheet 2: DailyActivity
| คอลัมน์ | ประเภท | คำอธิบาย |
|--------|-------|---------|
| Timestamp | DateTime | เวลาที่บันทึกลงระบบ |
| RecordDate | Date | วันที่บันทึก |
| RecordTime | Time | เวลาที่บันทึก |
| PatientName | Text | ชื่อผู้ป่วย |
| HN | Text | Hospital Number |
| PT_Mobility | Boolean | กายภาพบำบัด - การเคลื่อนไหว |
| PT_Balance | Boolean | กายภาพบำบัด - การทรงตัว |
| PT_Strength | Boolean | กายภาพบำบัด - กำลัง |
| PT_Gait | Boolean | กายภาพบำบัด - การเดิน |
| PT_Aerobic | Boolean | กายภาพบำบัด - แอโรบิก |
| PT_ChestPT | Boolean | กายภาพบำบัด - ทรวงอก |
| OT_MouthCare | Boolean | กิจกรรมบำบัด - ดูแลช่องปาก |
| OT_OralMotor | Boolean | กิจกรรมบำบัด - กล้ามเนื้อปาก |
| OT_VitalStim | Boolean | กิจกรรมบำบัด - กระตุ้นไฟฟ้า |
| OT_Speech | Boolean | กิจกรรมบำบัด - พูด |
| OT_Cognitive | Boolean | กิจกรรมบำบัด - ความคิด |
| SittingTime | Number | เวลานั่ง (นาที) |
| StandingTime | Number | เวลายืน (นาที) |
| ApneaDay | Number | หยุดหายใจกลางวัน (ครั้ง) |
| ApneaNight | Number | หยุดหายใจกลางคืน (ครั้ง) |
| SleepDay | Number | นอนกลางวัน (ชม.) |
| SleepNight | Number | นอนกลางคืน (ชม.) |
| Agitation | Number | ความกระวนกระวาย (ครั้ง) |
| Delirium | Number | สับสน (ครั้ง) |
| Symptoms | Text | อาการ (CSV) |
| PRN_Medication | Text | ยา PRN |
| ChiefComplaint | Text | ข้อร้องเรียนหลัก |

### Sheet 3: Medication
| คอลัมน์ | ประเภท | คำอธิบาย |
|--------|-------|---------|
| Timestamp | DateTime | เวลาที่บันทึกลงระบบ |
| RecordDate | Date | วันที่บันทึก |
| RecordTime | Time | เวลาที่บันทึก |
| PatientName | Text | ชื่อผู้ป่วย |
| HN | Text | Hospital Number |
| DrugName | Text | ชื่อยา |
| Dose | Text | ขนาด |
| Frequency | Text | ความถี่ (od, bid, tid, etc.) |
| Route | Text | เส้นทาง (PO, IV, IM, etc.) |
| TimeGiven | Time | เวลาที่ให้ยา |
| Note | Text | หมายเหตุ |

### Sheet 4: Lab
| คอลัมน์ | ประเภท | คำอธิบาย |
|--------|-------|---------|
| Timestamp | DateTime | เวลาที่บันทึกลงระบบ |
| RecordDate | Date | วันที่บันทึก |
| RecordTime | Time | เวลาที่บันทึก |
| PatientName | Text | ชื่อผู้ป่วย |
| HN | Text | Hospital Number |
| WBC | Number (2 ทศนิยม) | White Blood Cell |
| Neutrophil | Number (2 ทศนิยม) | Neutrophil % |
| Lymphocyte | Number (2 ทศนิยม) | Lymphocyte % |
| RBC | Number (2 ทศนิยม) | Red Blood Cell |
| Hb | Number (2 ทศนิยม) | Hemoglobin |
| Hct | Number (2 ทศนิยม) | Hematocrit |
| Platelet | Number (2 ทศนิยม) | Platelet |
| CRP | Number (2 ทศนิยม) | C-Reactive Protein |
| TotalProtein | Number (2 ทศนิยม) | Total Protein |
| Albumin | Number (2 ทศนิยม) | Albumin |
| AST | Number (2 ทศนิยม) | AST |
| ALT | Number (2 ทศนิยม) | ALT |
| ALP | Number (2 ทศนิยม) | Alkaline Phosphatase |
| BUN | Number (2 ทศนิยม) | Blood Urea Nitrogen |
| Creatinine | Number (2 ทศนิยม) | Creatinine |
| eGFR | Number (2 ทศนิยม) | eGFR |
| Na | Number (2 ทศนิยม) | Sodium |
| K | Number (2 ทศนิยม) | Potassium |
| Cl | Number (2 ทศนิยม) | Chloride |
| HCO3 | Number (2 ทศนิยม) | Bicarbonate |
| VitaminD | Number (2 ทศนิยม) | Vitamin D |
| Ca | Number (2 ทศนิยม) | Calcium |
| Mg | Number (2 ทศนิยม) | Magnesium |
| Phosphate | Number (2 ทศนิยม) | Phosphate |
| SputumCS | Text | Sputum Culture & Sensitivity |
| CXR | Text | Chest X-Ray Report |

### Sheet 5: Summary
| คอลัมน์ | ประเภท | คำอธิบาย |
|--------|-------|---------|
| Timestamp | DateTime | เวลาที่สร้าง Summary |
| Date | Date | วันที่ Summary |
| Shift | Text | เวร (เช้า/ดึก) |
| PatientName | Text | ชื่อผู้ป่วย |
| HN | Text | Hospital Number |
| SummaryData | JSON | ข้อมูล Summary ทั้งหมด (JSON format) |

---

## 📱 คำแนะนำสำหรับมือถือ

### สำหรับ iPhone/iPad (iOS)

1. **เปิด Web app URL ใน Safari** (ห้ามใช้ Chrome หรือ Google App)
   - ถ้าเปิดจาก link ใน Google App จะแสดงข้อผิดพลาด
   - วิธีแก้: Copy URL และวางใน Safari

2. **Add to Home Screen:**
   - เปิด URL ใน Safari
   - กดปุ่ม **Share** (ไอคอนส่งออก)
   - เลื่อนหา **Add to Home Screen**
   - กด **Add**
   - ไอคอนจะปรากฏบน Home Screen
   - เปิดจากไอคอนนี้ทุกครั้ง

3. **ประสบการณ์การใช้งาน:**
   - ✅ ทำงานเหมือน Native App
   - ✅ Full screen mode
   - ✅ ไม่มี browser bar
   - ✅ เร็วกว่าเปิดใน browser

### สำหรับ Android

1. **เปิด Web app URL ใน Chrome**
   - ถ้าเปิดจาก link ใน Google App ให้เลือก **Open in Chrome**

2. **Add to Home Screen:**
   - เปิด URL ใน Chrome
   - กดปุ่ม **Menu** (⋮)
   - เลือก **Add to Home Screen**
   - ตั้งชื่อและกด **Add**
   - ไอคอนจะปรากฏบน Home Screen

3. **Install as PWA (ถ้ามี prompt):**
   - Chrome อาจแสดง banner "Add to Home Screen"
   - กด **Install**
   - เปิดใช้งานเหมือน App ทั่วไป

---

## 🔧 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### 1. ไม่สามารถเปิด Web App ได้ (ข้อผิดพลาด: "Sorry, unable to open the file")

**สาเหตุ:** เปิดใน Google App หรือ browser ที่ไม่รองรับ

**วิธีแก้:**
- **iPhone/iPad:** เปิดใน Safari เท่านั้น
- **Android:** เปิดใน Chrome
- Copy URL และวางใน browser ที่ถูกต้อง

#### 2. ข้อมูลไม่บันทึก

**ตรวจสอบ:**
1. ใส่ SPREADSHEET_ID ถูกต้องใน `Code.gs` หรือไม่
2. Run `initializeSheets()` แล้วหรือยัง
3. ให้สิทธิ์ (Permissions) แล้วหรือยัง
4. ตรวจสอบ Error ใน Apps Script:
   - เปิด Apps Script Editor
   - ไปที่ **Executions** (ด้านซ้าย)
   - ดู Error log

#### 3. Dashboard ไม่แสดงกราฟ

**สาเหตุ:** ยังไม่มีข้อมูล หรือข้อมูลไม่ถูกต้อง

**วิธีแก้:**
1. บันทึกข้อมูลอย่างน้อย 2-3 รายการก่อน
2. เลือก Time Range ที่มีข้อมูล
3. กดปุ่ม **🔄 Refresh Dashboard**

#### 4. Summary ไม่แสดงข้อมูล

**สาเหตุ:** ไม่มีข้อมูลในช่วงเวรที่เลือก

**วิธีแก้:**
1. ตรวจสอบวันที่และเวรที่เลือก
2. บันทึกข้อมูลในช่วงเวลานั้นก่อน
3. Generate Summary ใหม่

#### 5. Notification ไม่ปรากฏ

**วิธีแก้:**
- รอ 2-3 วินาที
- ตรวจสอบ browser console (F12) ดู error
- ลอง refresh หน้า

#### 6. บันทึกข้อมูลย้อนหลังไม่ได้

**วิธีแก้:**
1. เปลี่ยนวันที่และเวลาในฟอร์ม
2. Default จะเป็นวันนี้ แต่สามารถเลือกได้เอง
3. บันทึกตามปกติ

---

## 🔄 การอัพเดตระบบ

### เมื่อต้องการแก้ไขโค้ด

1. แก้ไขโค้ดใน Apps Script Editor
2. **Save** (Ctrl+S หรือ Cmd+S)
3. **Deploy** > **Manage deployments**
4. คลิกไอคอน **✏️ Edit**
5. เลือก **Version:** → **New version**
6. กด **Deploy**
7. URL จะยังเหมือนเดิม แต่โค้ดจะอัพเดต

### การ Rollback (ถ้าเจอปัญหา)

1. **Deploy** > **Manage deployments**
2. คลิกไอคอน **✏️ Edit**
3. เลือก **Version:** → เลือก version เก่า
4. กด **Deploy**

---

## 💡 เทคนิคการใช้งานขั้นสูง

### 1. การ Export ข้อมูลเป็น CSV

Google Sheets สามารถ Export เป็น CSV ได้:
1. เปิด Google Sheet
2. เลือก Sheet ที่ต้องการ Export
3. **File** > **Download** > **Comma Separated Values (.csv)**

### 2. การสร้าง Chart เพิ่มเติมใน Google Sheets

1. เปิด Google Sheet
2. เลือกข้อมูลที่ต้องการ
3. **Insert** > **Chart**
4. Customize ตามต้องการ

### 3. การแชร์ระบบให้ผู้อื่นใช้

**Option 1: แชร์ URL**
- Copy Web App URL ที่ Deploy แล้ว
- ส่งให้ผู้อื่น
- ต้องตั้งค่า "Who has access" เป็น "Anyone"

**Option 2: แชร์ Google Sheet**
- แชร์ Google Sheet ให้ผู้อื่นดู (View only)
- พวกเขาจะดูข้อมูลได้ แต่ไม่สามารถแก้ไข Web App

### 4. การทำ Backup

**วิธีที่ 1: Copy Sheet**
1. คลิกขวาที่แท็บ Sheet
2. เลือก **Copy to** > **New spreadsheet**

**วิธีที่ 2: Export ทั้งหมด**
1. **File** > **Download** > **Microsoft Excel (.xlsx)**

**วิธีที่ 3: Google Takeout**
1. ไปที่ [Google Takeout](https://takeout.google.com)
2. เลือก **Drive**
3. Export ข้อมูลทั้งหมด

---

## 📞 การขอความช่วยเหลือ

### ปัญหาทางเทคนิค

1. ตรวจสอบ [Google Apps Script Documentation](https://developers.google.com/apps-script)
2. ตรวจสอบ Error log ใน Apps Script Editor
3. ดู Console log ใน browser (F12)

### การปรับแต่งระบบ

โค้ดสามารถปรับแต่งได้เอง:
- **Code.gs:** แก้ไข Backend logic, เพิ่ม function
- **Index.html:** แก้ไข UI, เพิ่มฟีเจอร์
- **CSS:** ปรับแต่งสี, ฟอนต์, layout

---

## 📝 License

ระบบนี้พัฒนาเพื่อใช้ภายในองค์กร สามารถปรับแต่งและใช้งานได้ตามต้องการ

---

## 🙏 ขอบคุณ

ขอบคุณที่ใช้ระบบ Patient Daily Record System!

**พัฒนาด้วย ❤️ โดย Claude Code**

---

## 📚 เอกสารอ้างอิง

- [Google Apps Script Guide](https://developers.google.com/apps-script/guides/web)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Google Sheets API](https://developers.google.com/sheets/api)

---

**Version:** 1.0.0
**Last Updated:** 2025-01-25
**Developed with:** Google Apps Script + HTML + Tailwind CSS + Chart.js
