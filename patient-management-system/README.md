# Patient Management System (PMS)

ระบบจัดการข้อมูลผู้ป่วยแบบครบวงจร ใช้ Google Apps Script + Google Sheet + HTML (Tailwind CSS) พร้อม Chart.js สำหรับแสดงกราฟแนวโน้ม

## 🌟 Features

### ✅ การจัดการข้อมูลผู้ป่วย
- เพิ่ม / แก้ไข / ลบ ข้อมูลผู้ป่วย
- ค้นหาและเลือกผู้ป่วยได้อย่างรวดเร็ว
- แสดงข้อมูลสำคัญ (HN, ชื่อ, Dx, Allergies, Admission Date, Status)

### 📊 ฟอร์มบันทึกข้อมูล 9 หมวด
1. **Vital Signs** - อุณหภูมิ, ชีพจร, BP, SpO₂, O₂ Support, Pain Score, GCS
2. **Intake/Output** - ปริมาณน้ำเข้า-ออก, Balance, Stool Type/Color, Urine, Vomit, Drain
3. **Clinical Notes** - Chief Complaint, Assessment, Plan, Note
4. **Medication** - การจัดการยา (เพิ่ม/หยุด/เปลี่ยนแปลง) พร้อม Medication Log
5. **Activity** - กิจกรรมต่างๆ เช่น การเดิน, PT
6. **Behavior** - พฤติกรรม, Trigger, Intervention, Outcome
7. **Lab Results** - ผลแลป CBC, CRP, LFT, Renal/Electrolyte พร้อมตรวจสอบค่าผิดปกติอัตโนมัติ
8. **MAR** - Medication Administration Record (บันทึกการให้ยา)
9. **Medication Log** - ประวัติการเปลี่ยนแปลงยา

### 📈 Dashboard & Analytics
- **Daily Summary** - สรุปข้อมูลรายวัน (Vitals, I/O, Meds, Clinical)
- **Abnormal Lab Alerts** - แจ้งเตือนผลแลปผิดปกติอัตโนมัติ
- **Vital Signs Trend Chart** - กราฟแนวโน้ม Temp, HR, SpO₂
- **I/O Balance Chart** - กราฟ Intake/Output/Balance
- **Current Medications** - รายการยาปัจจุบัน
- **Lab Result History** - ประวัติผลแลป

### 🎯 ฟีเจอร์พิเศษ
- ✅ Timestamp อัตโนมัติทุกการบันทึก
- ✅ สามารถบันทึกข้อมูลย้อนหลังได้
- ✅ Dropdown มาตรฐาน (Stool Type, O₂ Support, Medication Frequency, Route)
- ✅ การตรวจสอบค่าผิดปกติของ Lab อัตโนมัติ
- ✅ Responsive Design - รองรับการใช้งานบน Mobile/Tablet
- ✅ Real-time Dashboard Update
- ✅ LockService ป้องกันการเขียนข้อมูลซ้ำ

## 🏗️ โครงสร้างระบบ

### Google Sheet Structure
ระบบใช้ Google Sheet เป็นฐานข้อมูล ประกอบด้วย 10 ชีต:

1. **Patient_List** - ข้อมูลผู้ป่วย
2. **VitalSigns** - Vital Signs
3. **IntakeOutput** - I/O พร้อม Stool Type & Color
4. **Clinical** - Clinical Notes
5. **Activity** - กิจกรรม
6. **Medication** - รายการยา
7. **Behavior** - พฤติกรรม
8. **MAR** - Medication Administration Record
9. **Lab_Record** - ผลแลป
10. **Medication_Log** - ประวัติการเปลี่ยนยา

### Files Structure
```
patient-management-system/
├── Code.gs          # Google Apps Script backend
├── Index.html       # หน้าหลัก UI
├── Stylesheet.html  # CSS styles (Tailwind + Custom)
├── JavaScript.html  # Client-side JavaScript + Chart.js
└── README.md        # เอกสารนี้
```

## 🚀 การติดตั้งและ Deploy

### ขั้นตอนที่ 1: สร้าง Google Apps Script Project

1. ไปที่ [Google Apps Script](https://script.google.com/)
2. คลิก **New Project**
3. ตั้งชื่อโปรเจค เช่น "Patient Management System"

### ขั้นตอนที่ 2: เพิ่มไฟล์

1. ลบ `Code.gs` เดิม และสร้างไฟล์ใหม่ 4 ไฟล์:
   - `Code.gs`
   - `Index.html`
   - `Stylesheet.html`
   - `JavaScript.html`

2. คัดลอกโค้ดจากไฟล์ต่างๆ ในโฟลเดอร์นี้ไปยังไฟล์ที่สร้างใน Google Apps Script

### ขั้นตอนที่ 3: Deploy เป็น Web App

1. คลิก **Deploy** > **New deployment**
2. เลือก type: **Web app**
3. ตั้งค่า:
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone with the link (หรือตามความต้องการ)
4. คลิก **Deploy**
5. อนุญาต permissions ที่ระบบขอ
6. คัดลอก **Web app URL** ที่ได้

### ขั้นตอนที่ 4: เริ่มใช้งาน

1. เปิด **Web app URL** ในเบราว์เซอร์
2. คลิกปุ่ม **Initialize Sheets** เพื่อสร้างชีตพื้นฐาน
3. เริ่มเพิ่มข้อมูลผู้ป่วยผ่านปุ่ม **+ จัดการข้อมูลผู้ป่วย**

## 📖 คู่มือการใช้งาน

### 1. การเพิ่มผู้ป่วย

1. คลิกปุ่ม **+ จัดการข้อมูลผู้ป่วย**
2. กรอกข้อมูล:
   - HN (รหัสผู้ป่วย)
   - ชื่อ-นามสกุล
   - อายุ
   - เพศ
   - Dx (การวินิจฉัย)
   - Allergies (ยาที่แพ้)
   - Admission Date
   - Status (Active/Discharged/Transferred)
   - Ward (หอผู้ป่วย)
3. คลิก **Save Patient**

### 2. การบันทึกข้อมูล Vital Signs

1. เลือกผู้ป่วยจาก dropdown
2. ไปที่แท็บ **Vital Signs**
3. กรอกข้อมูล:
   - วันที่และเวลา (ระบบตั้งค่าอัตโนมัติ หรือแก้ไขได้)
   - Temp, HR, RR, BP, SpO₂
   - O₂ Support (เลือกจาก dropdown)
   - Pain Score, GCS
   - ชื่อผู้บันทึก
4. คลิก **Save Vital Signs**

### 3. การบันทึก Intake/Output

1. เลือกผู้ป่วย
2. ไปที่แท็บ **I/O**
3. กรอกข้อมูล:
   - วันที่และเวลา
   - Intake (mL)
   - Output (mL) - ระบบคำนวณ Balance อัตโนมัติ
   - Urine, Vomit, Drain
   - Stool Type (เลือกจาก Bristol Stool Chart)
   - Stool Color
4. คลิก **Save I/O**

### 4. การบันทึกยา

**เพิ่มยาใหม่:**
1. เลือกผู้ป่วย
2. ไปที่แท็บ **Medication**
3. กรอกข้อมูล:
   - ชื่อยา
   - Dose
   - Frequency (เลือกจาก dropdown: bid, tid, qid, etc.)
   - Route (เลือกจาก dropdown: IV, PO, IM, etc.)
   - Start Date / End Date
   - Status
   - Indication
4. คลิก **Add Medication**

**บันทึกการให้ยา (MAR):**
1. ไปที่แท็บ **MAR**
2. กรอกข้อมูล:
   - วันที่และเวลาที่ให้ยา
   - ชื่อยา
   - Dose
   - Route
   - ชื่อผู้ให้ยา
   - หมายเหตุ (ถ้ามี)
3. คลิก **Save MAR**

### 5. การบันทึกผลแลป

1. เลือกผู้ป่วย
2. ไปที่แท็บ **Lab**
3. กรอกข้อมูล:
   - วันที่
   - Lab Type (เลือก: CBC, CRP, LFT, Renal/Electrolyte, etc.)
   - Test Name (เช่น WBC, Hb, Creatinine)
   - Result
   - Unit
   - Normal Range
4. คลิก **Save Lab Result**
5. ระบบจะตรวจสอบค่าผิดปกติอัตโนมัติและแจ้งเตือนใน Dashboard

### 6. การดู Dashboard

1. เลือกผู้ป่วย
2. ไปที่แท็บ **Dashboard**
3. ดูข้อมูลสรุป:
   - Daily Summary (วันนี้)
   - Abnormal Lab Results
   - Vital Signs Trend Chart
   - I/O Balance Chart
   - Current Medications

## 🎨 Dropdown Options

### Stool Type (Bristol Stool Chart)
1. ก้อนแข็งเล็ก (ท้องผูก)
2. ก้อนยาวผิวขรุขระ (ท้องผูก)
3. ก้อนยาวคล้ายไส้กรอกมีรอยแตก (ปกติ)
4. ก้อนยาวคล้ายงูผิวเนียม (ปกติ)
5. ก้อนนุ่มขอบชัด (ปกติ)
6. ก้อนฟูขอบยุ่ย (ท้องเสีย)
7. เหลวเป็นน้ำ (ท้องเสียรุนแรง)

### Stool Color
- สีน้ำตาล
- สีเหลือง
- สีเขียว
- สีดำ
- สีแดง
- สีซีด/เทา

### O₂ Support
- NC (Nasal Cannula)
- Simple Mask
- PRM (Partial Rebreather Mask)
- Venturi
- CPAP
- BiPAP
- Ventilator

### Medication Frequency
- bid (2 ครั้ง/วัน)
- tid (3 ครั้ง/วัน)
- qid (4 ครั้ง/วัน)
- o.d. (1 ครั้ง/วัน)
- h.s. (ก่อนนอน)
- p.c. (หลังอาหาร)
- a.c. (ก่อนอาหาร)
- PRN (เมื่อจำเป็น)
- EOD (วันเว้นวัน)

### Route
- IV (ทางหลอดเลือดดำ)
- IM (ทางกล้ามเนื้อ)
- ID (ทางผิวหนัง)
- PO (ทางปาก)
- SC (ใต้ผิวหนัง)

## 🔬 Lab Modules

### CBC (Complete Blood Count)
- WBC, Neutrophil, Lymphocyte
- RBC, Hb, Hct
- Platelet

### CRP
- C-Reactive Protein

### LFT (Liver Function Test)
- Total Protein, Albumin
- AST, ALT, ALP

### Renal/Electrolyte
- BUN, Creatinine, eGFR
- Na⁺, K⁺, Cl⁻, HCO₃⁻

### Sputum C/S
- Culture & Sensitivity results
- เช่น Klebsiella pneumoniae sensitive to Meropenem

### Nutritional
- Albumin, Total Protein, Hb

### Vitamin/Mineral
- Vitamin D, Ca²⁺, Mg²⁺, Phosphate

### Chest Imaging
- CXR (Chest X-ray)
- เปรียบเทียบผลย้อนหลัง

## 🔒 ความปลอดภัย

- ใช้ **LockService** ป้องกันการเขียนข้อมูลซ้ำซ้อน
- ใช้ **Timestamp** อัตโนมัติทุกการบันทึก
- ตรวจสอบ HN ซ้ำก่อนเพิ่มผู้ป่วยใหม่
- รองรับการ Deploy แบบ Private (Anyone with the link / Specific users)

## 📱 Responsive Design

- รองรับการใช้งานบน Desktop, Tablet, และ Mobile
- ใช้ Tailwind CSS สำหรับ responsive layout
- Tab navigation ปรับขนาดตามหน้าจออัตโนมัติ

## 🛠️ เทคโนโลยีที่ใช้

- **Backend**: Google Apps Script (JavaScript)
- **Database**: Google Sheets
- **Frontend**: HTML5
- **CSS Framework**: Tailwind CSS 2.2.19
- **Chart Library**: Chart.js 3.9.1
- **Icons**: Heroicons (inline SVG)

## 📊 ตัวอย่างการใช้งาน

### Scenario 1: บันทึกข้อมูลผู้ป่วยใหม่
1. เพิ่มผู้ป่วย HN: 12345
2. บันทึก Vital Signs เวลา 08:00
3. บันทึก I/O เวลา 12:00
4. เพิ่มยา Paracetamol 500mg PO tid
5. บันทึกผล Lab CBC
6. ดู Dashboard เพื่อติดตามแนวโน้ม

### Scenario 2: ติดตามผู้ป่วยรายวัน
1. เลือกผู้ป่วย
2. ดู Daily Summary
3. ตรวจสอบ Abnormal Labs
4. บันทึก MAR เมื่อให้ยา
5. บันทึก Clinical Note หลังตรวจ

## ⚠️ ข้อควรระวัง

1. **ครั้งแรกที่ใช้** - ต้องคลิก "Initialize Sheets" ก่อน
2. **Performance** - หากมีข้อมูลมากๆ (>10,000 records) อาจโหลดช้า
3. **Concurrent Users** - รองรับผู้ใช้พร้อมกันได้ดี แต่หลีกเลี่ยงการแก้ไขผู้ป่วยคนเดียวกันพร้อมกัน
4. **Backup** - ควร Export Google Sheet เป็น Excel สำรองข้อมูลเป็นระยะ

## 🔄 การอัปเดตระบบ

เมื่อมีการแก้ไขโค้ด:
1. แก้ไขไฟล์ใน Google Apps Script
2. **Deploy** > **Manage deployments**
3. คลิก ⚙️ > **New version**
4. **Deploy**

## 💡 Tips & Best Practices

1. ใช้ชื่อผู้บันทึกที่ชัดเจน เช่น "พยาบาล ก.", "Dr. Smith"
2. บันทึก Timestamp ใกล้เคียงกับเวลาจริงเพื่อความแม่นยำ
3. ระบุ Allergies ให้ครบถ้วน (หรือใส่ "NKDA" หากไม่มี)
4. ตรวจสอบ Lab ผิดปกติใน Dashboard เป็นประจำ
5. บันทึก Clinical Note อย่างน้อยวันละ 1 ครั้ง

## 📞 การขอความช่วยเหลือ

หากพบปัญหาหรือต้องการความช่วยเหลือ:
1. ตรวจสอบ Console Log (F12 > Console)
2. ดู Execution log ใน Google Apps Script
3. ตรวจสอบ Permissions ของ Web App

## 📄 License

ระบบนี้สร้างขึ้นเพื่อการศึกษาและใช้งานภายในองค์กร
สามารถนำไปปรับแต่งและต่อยอดได้ตามต้องการ

## 🎓 เครดิต

พัฒนาโดย: Claude.ai
เวอร์ชัน: 1.0
วันที่สร้าง: 2025-01-23

---

**หมายเหตุ**: ระบบนี้เป็น Demo สำหรับการจัดการข้อมูลผู้ป่วย ไม่ควรใช้กับข้อมูลผู้ป่วยจริงโดยไม่ได้รับการอนุมัติและตรวจสอบความปลอดภัยตามมาตรฐาน HIPAA/PDPA
