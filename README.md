# 🎀 "Mimi" Gacha Cost Tracker Web Dashboard

เว็บแดชบอร์ดสรุปค่าใช้จ่ายในการเติมเกมกาชาแสนน่ารักในธีมน้อง **"เมม" (Memosprite จาก Honkai: Star Rail)** พัฒนาด้วย Next.js (App Router) เชื่อมต่อฐานข้อมูลโดยตรงกับ Google Sheets API และขับเคลื่อนด้วยระบบสแกนสลิปอัจฉริยะ Google Cloud Vision OCR 

---

## ✨ ฟีเจอร์หลัก (Key Features)

*   **📊 Interactive Dashboard & Charts:**
    *   การ์ดสรุปสถิติด่วนอย่างชัดเจน เช่น ยอดเปย์สะสมทั้งหมด, ยอดเงินเดือนปัจจุบัน, ยอดเฉลี่ยต่อสลิป และเกมที่เติมเยอะที่สุด
    *   แผนภูมิ Recharts (Pie Chart) แสดงสัดส่วนรายจ่ายแยกตามเกม และ Area Chart แสดงแนวโน้มรายจ่ายรายเดือน
*   **📝 OCR Slip Scanner (สแกนสลิปโอนเงินอัจฉริยะ):**
    *   รองรับการอัปโหลดหรือลากวางสลิปโอนเงิน พร้อมเครื่องมือช่วยหมุนรูปภาพ (Rotate 90°) และซูมรูปภาพ (Zoom In/Out)
    *   ระบบประมวลผลข้อความบนสลิปแบบเรียลไทม์ด้วย Google Cloud Vision API และกรอกยอดเงิน/วันที่ลงในแบบฟอร์มให้อัตโนมัติ
*   **📑 Transaction Management:**
    *   ตารางแสดงประวัติธุรกรรมแบบละเอียด สามารถค้นหา (Search), กรองตามเกม (Filter), และเรียงลำดับคอลัมน์ (Sort) ได้
    *   สามารถสั่งลบรายการธุรกรรมออกจาก Google Sheets ได้โดยตรงจากบนหน้าเว็บ
*   **🎀 Dual Theme (2 บรรยากาศ):**
    *   **Cosmic Dream Theme (Dark Mode):** ธีมอวกาศโทนครามเข้ม เรืองแสงสีชมพู/ม่วง พร้อมลูกเล่นเม็ดเกรนระยิบระยับ
    *   **Teyvat Dawn Theme (Light Mode):** ธีมสว่างสไตล์รุ่งอรุณสวรรค์ (ฟ้านวล, ชมพูพีช, ทองครีม) พร้อมอนิเมชันปุยเมฆลอยผ่าน
*   **🔒 Secure Discord OAuth2 Login (NextAuth.js):**
    *   ระบบจำกัดการเข้าใช้งานเฉพาะเจ้าของเครื่องเท่านั้น โดยกรองสิทธิ์ผ่าน `ALLOWED_USER_ID` บัญชีคนอื่นที่พยายามล็อกอินจะถูกปฏิเสธโดยคำพูดน่ารัก ๆ สไตล์น้องเมม

---

## 🛠️ Stack & Architecture (โครงสร้างระบบ)

*   **Frontend & Backend:** Next.js 16 (App Router, React 19)
*   **Styling:** Tailwind CSS v4 & Custom CSS Variables (ควบคุมระบบธีมสี)
*   **Charts:** Recharts
*   **Database:** Google Sheets API (ติดต่อผ่านแพ็กเกจ `google-spreadsheet` ด้วย Service Account JWT)
*   **OCR System:** Google Cloud Vision API (`@google-cloud/vision`)
*   **Authentication:** NextAuth.js (Discord OAuth2 Provider)

---

## 🚀 เริ่มต้นใช้งานในเครื่องโลคอล (Local Development)

### 1. ติดตั้ง Dependencies
เปิด Terminal ในโฟลเดอร์โปรเจกต์แล้วรันคำสั่ง:
```bash
npm install
```

### 2. ตั้งค่า Environment Variables (`.env`)
สร้างไฟล์ `.env` ไว้ที่รูทของโปรเจกต์ และใส่ตัวแปรสภาพแวดล้อมดังนี้:
```env
# Discord Bot Credentials (ถ้าใช้รันควบคู่กับบอท)
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_bot_client_id

# Google Sheets Config
GOOGLE_SHEET_ID=your_google_sheet_id_here

# NextAuth Config
NEXTAUTH_SECRET=your_random_secret_string
NEXTAUTH_URL=http://localhost:3000

# Discord OAuth2 (สำหรับระบบ Login หน้าเว็บ)
DISCORD_CLIENT_ID=your_discord_client_id_from_developer_portal
DISCORD_CLIENT_SECRET=your_discord_client_secret
ALLOWED_USER_ID=your_personal_discord_user_id
```

### 3. ตั้งค่ากุญแจยืนยันตัวตน Google Cloud (Credentials)
1. ไปที่ Google Cloud Console และสร้าง Service Account พร้อมเปิดใช้งาน **Google Sheets API** และ **Cloud Vision API**
2. ดาวน์โหลดคีย์ Service Account ในรูปแบบไฟล์ JSON
3. นำไฟล์ JSON ดังกล่าวมาวางไว้ที่รูทของโปรเจกต์และเปลี่ยนชื่อไฟล์เป็น **`google-credentials.json`** *(ไฟล์นี้ถูกแอดใน `.gitignore` เรียบร้อยแล้ว จะไม่หลุดขึ้น Git)*

### 4. รันโปรเจกต์แบบ Local
รันเซิร์ฟเวอร์สำหรับทดสอบในเครื่อง:
```bash
npm run dev
```
เปิดบราวเซอร์ไปที่ [http://localhost:3000](http://localhost:3000) เพื่อเริ่มใช้งานมิว~

---

## 🌐 การนำขึ้น Live Production (Vercel Deployment)

เนื่องจากโปรเจกต์นี้ทำงานกับกุญแจสำคัญและตัวแปรสภาพแวดล้อม เพื่อความปลอดภัยบนระบบคลาวด์เราจะไม่นำไฟล์ `google-credentials.json` อัปโหลดขึ้น Git แต่จะใช้วิธีเก็บในสภาพแวดล้อม (Environment Variables) ของ Vercel แทน:

1.  คัดลอกข้อความทั้งหมดภายในไฟล์ `google-credentials.json` (ที่เป็นกุญแจ JSON ทั้งหมด)
2.  ไปที่ Vercel Dashboard -> Project Settings -> **Environment Variables**
3.  เพิ่มตัวแปรใหม่ชื่อ **`GOOGLE_CREDENTIALS_JSON`** และวางค่า JSON ที่ก๊อปปี้มาลงไปในช่อง Value
4.  เพิ่มตัวแปรอื่น ๆ จากไฟล์ `.env` ขึ้นไปบน Vercel (ปรับแก้ตัวแปร `NEXTAUTH_URL` ให้ตรงกับ URL หน้าเว็บจริงของคุณบน Vercel เช่น `https://mimi-gacha.vercel.app`)
5.  สั่ง Deploy โปรเจกต์ได้ทันที

---

## 📂 โครงสร้างโฟลเดอร์ที่สำคัญ (Folder Structure)

*   `src/app/` - หน้าจอการทำงานหลักและ API Routes (Next.js App Router)
    *   `src/app/page.js` - หน้าแดชบอร์ด ตาราง และ OCR
    *   `src/app/login/page.js` - หน้าล็อกอินเข้าระบบผ่าน Discord
    *   `src/app/api/sheets/route.js` - API แลกเปลี่ยนข้อมูลกับ Google Sheets
    *   `src/app/api/scan-slip/route.js` - API ประมวลผลสลิปด้วย Cloud Vision
    *   `src/app/api/auth/` - ระบบตรวจสอบสิทธิ์ความปลอดภัย NextAuth.js
*   `src/utils/` - ไฟล์เครื่องมือส่วนกลาง
    *   `src/utils/googleSheets.js` - ฟังก์ชันสำหรับ อ่าน/เขียน/ลบ แถวใน Google Sheets
*   `assets/` - โฟลเดอร์รวมศูนย์ Assets รูปภาพ (เช่น ไอคอนเกม, รูปน้องเมม) ทำการ Symlink ไปแสดงผลผ่าน `public/assets/`
