# 📋 CHANGELOG

All notable changes to the "Mem" Gacha Cost Tracker Discord Bot will be documented in this file.

> Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
> This project uses the features defined in [gaming_topup_bot_prd_v2.md](./gaming_topup_bot_prd_v2.md) as reference.

---

## [3.0.1] - 2026-06-06

### Added
- **Environment Variable Credentials Support (Vercel Ready):** ปรับปรุงระบบยืนยันตัวตนของ Google Sheets API และ Google Cloud Vision API ให้รองรับการอ่านค่า Credentials จากตัวแปรสภาพแวดล้อม (Environment Variable) `GOOGLE_CREDENTIALS_JSON` ช่วยให้สามารถ Deploy ขึ้น Live Production เช่น Vercel ได้อย่างปลอดภัยโดยไม่ต้องอัปโหลดไฟล์ `google-credentials.json` ขึ้นระบบ Git ควบคู่ไปกับการทำระบบ Fallback สำหรับการพัฒนารันบนเครื่องเครื่องโลคอลเหมือนเดิมมิว~

### Changed
- **Google Credentials Load Logic:** ปรับการทำงานของไฟล์ [googleSheets.js](file:///Users/rinlily/Documents/codingdump/mimi-gacha-cost-tracker-web/src/utils/googleSheets.js) และ [route.js](file:///Users/rinlily/Documents/codingdump/mimi-gacha-cost-tracker-web/src/app/api/scan-slip/route.js) ของ Cloud Vision API ให้พิจารณาดึงค่าจาก Environment Variable เป็นสิทธิ์หลัก ก่อนที่จะไปเรียกอ่านไฟล์โลคอลในเครื่อง

## [3.0.0] - 2026-06-06

### Added

#### Web Application Dashboard (ภายใต้โฟลเดอร์ `/web`)
- **Next.js 14+ / App Router Web App:** พัฒนาเว็บแอปพลิเคชันตัวใหม่แบบ Fullstack ด้วย Next.js แยกการทำงานไว้ในโฟลเดอร์ `/web` ทำให้รันควบคู่ไปกับบอท Discord ตัวเดิมได้
- **Discord OAuth2 Login (NextAuth):** ระบบล็อกอินเข้าใช้งานผ่านบัญชี Discord
- **สิทธิ์การเข้าถึงแบบ Single-user:** มีด่านคัดกรองความปลอดภัยระดับ API โดยอนุญาตให้เฉพาะเจ้าของเครื่องที่มีไอดีตรงกับ `ALLOWED_USER_ID` ในไฟล์ `.env` เข้าถึงข้อมูลได้เท่านั้น คนอื่นจะเห็นข้อความเตือนปฏิเสธสไตล์เมม
- **หน้าจอดิจิทัลแดชบอร์ด (Stats Dashboard):**
  - **การ์ดสถิติด่วน:** แสดงยอดเปย์สะสมทั้งหมด, ยอดเงินเดือนปัจจุบัน, ยอดเฉลี่ยต่อสลิป และเกมที่เปย์สูงที่สุด
  - **Interactive Charts (Recharts):** กราฟ Pie Chart แสดงสัดส่วนรายรับเกม และ Area Chart แสดงแนวโน้มเทรนด์ค่าใช้จ่ายรายเดือน
  - **ตารางประวัติธุรกรรมแบบละเอียด:** ตารางที่สามารถค้นหาคำสำคัญ (Search), กรองแยกตามเกม (Filter), เรียงลำดับ (Sort) และคลิกถังขยะสีแดงเพื่อลบรายการนั้นออกจาก Google Sheet โดยตรง
- **Side-by-Side OCR Slip Scanner (สแกนสลิปอัจฉริยะ):**
  - **ฝั่งซ้าย (Slip Preview):** รองรับการลากวางรูปสลิปแสดงพรีวิว พร้อมปุ่มซูม (Zoom In/Out) และหมุนรูปภาพ (Rotate) 90 องศาเพื่อจัดระเบียบสลิปที่กลับหัว พร้อมเอฟเฟกต์เลเซอร์สีมิ้นท์วิ่งกวาดตรวจ (Scanning laser animation)
  - **ฝั่งขวา (Verification Form):** ดึงค่าจาก Google Cloud Vision API มากรอกจำนวนเงินและวันที่ลงฟอร์มอัตโนมัติ พร้อม Autocomplete ค้นหาชื่อเกมจากประวัติในชีท
- **ระบบสลับธีม 2 บรรยากาศ (Dynamic Theme Switcher):**
  * **Cosmic Dream Theme (Dark Mode):** ธีมอวกาศครามเข้ม เรืองแสงสีชมพู/ม่วง ผสมเอฟเฟกต์เกรน Noise ละเอียด 3%
  * **Teyvat Dawn Theme (Light Mode):** ธีมรุ่งอรุณประตูสวรรค์ Genshin Impact (ฟ้าพาสเทล, ครีมทอง, ชมพูอมพีช) มีแอนิเมชันปุยเมฆลอยผ่าน และตัวหนังสือสีน้ำเงินเข้มคอสโมช่วยให้อ่านตารางและกราฟได้สบายตาสุดๆ โดยสีปุ่มและไอคอนต่างๆ จะเปลี่ยนโทนตามธีมเพื่อความสวยงาม
- **อวตาร์จริงของน้องเมม (Profile_Picture_Mem.webp):** นำภาพอวาตาร์ของน้องเมมจริงมาใช้เป็นไอคอนบนหน้าล็อกอิน และบนปุ่ม Widget ลอยตัวโต้ตอบ (Floating Widget) ด้านขวาล่าง
- **แอนิเมชันและLoading State:** หน้า Loading Screen แสนน่ารักระหว่างดึงข้อมูลสดๆ จาก Google Sheet พร้อม Dialogue Bubble ทักทายโต้ตอบจากน้องเมม
- **การแสดงผลรูปโปรไฟล์ของ Discord User:** อัปเดตส่วนหัวของหน้าแดชบอร์ด (Header Icon) จากเดิมที่เป็นรูปโบว์ 🎀 ให้ดึงรูปภาพประจำตัว (Avatar) จากบัญชี Discord ของผู้บุกเบิกที่เข้าใช้งานอยู่มาแสดงผลแทนแบบไดนามิก พร้อมขอบเอฟเฟกต์สีชมพูเรืองแสงสวยงาม และมีระบบ Fallback กลับเป็นรูปโบว์ดั้งเดิมหากดึงรูปโปรไฟล์ไม่สำเร็จมิว~
- **ระบบไอคอนเกมน่ารักแบบไดนามิก (Dynamic Game-Specific Icons):**
  - คัดลอกรูปภาพไอคอนเกมจริงจากโฟลเดอร์ `readme images` (ได้แก่ `Genshin_Impact.webp` และ `Honkai_Impact.webp`) มาจัดเก็บใน `web/public/`
  - พัฒนาระบบแมปปิ้ง `getGameIcon` ให้ส่งกลับรูปภาพของเกมจริงเป็นสิทธิ์หลักในการแสดงผล และมีระบบสำรอง (Fallback) เป็นสัญลักษณ์อีโมจิและธีมสีเฉพาะของแต่ละเกม (เช่น HSR -> 🚂, ZZZ -> 👾, WuWa -> 🌊 ฯลฯ) เมื่อไม่มีไฟล์รูปภาพ
  - **การ์ดเกมดูดเงินสูงสุด (Top Spender Card):** แสดงรูปตราสัญลักษณ์ของเกมจริงขนาดใหญ่ (Genshin / Honkai) ในกล่อง Badge หรูหราแบบลอยตัวขยับได้ (Floating Animation)
  - **สัญลักษณ์อธิบายแผนภูมิ (Pie Chart Legend):** แสดงสัญลักษณ์ด้วยกล่องขอบมนโปร่งแสงสีประจำกราฟ สอดแทรกรูปประจำเกมจริงหรือสัญลักษณ์อีโมจิ ช่วยให้การวิเคราะห์ข้อมูลดูหรูหราขึ้นมิว~
  - **ตารางประวัติธุรกรรม & Autocomplete:** แสดงภาพประจำเกมขนาดจิ๋วหรือสัญลักษณ์อีโมจินำหน้าตัวหนังสือในแถบตาราง, หน้าจอมือถือ และช่องค้นหาอัตโนมัติ

### Changed
- **Google Sheets Utility (ES Modules):** พอร์ตตัวจัดการชีทมาเป็นแบบ ESM (`web/src/utils/googleSheets.js`) และแก้ไขจากการใช้ `require()` ของ JSON credentials มาเป็น `fs.readFileSync` เพื่อให้รองรับ Next.js Turbopack compiler
- **การจัดเก็บและรวมศูนย์คลังรูปภาพ (Centralized Assets Directory):** ย้ายไฟล์ภาพไอคอนและองค์ประกอบกราฟิกทั้งหมดจาก `readme images` ไปรวมศูนย์ไว้ที่โฟลเดอร์ `/assets` บริเวณรูทของโปรเจกต์ และลบไฟล์ซ้ำซ้อนใน `web/public` โดยเปลี่ยนมาสร้าง Symbolic Link จากรูท `assets` เข้ามาที่ `web/public/assets` แทน เพื่อความเป็นระเบียบและให้เว็บบอร์ดเรียกใช้งานพาธ `/assets/...` ได้โดยตรงมิว~

### Fixed
- **Game Autocomplete Dropdown Theme/Contrast:** ปรับปรุงสไตล์ของรายการแนะนำชื่อเกม (Autocomplete Dropdown) ในหน้าต่างฟอร์มให้แสดงผลด้วยตัวแปรกราฟิกตามธีมที่เลือก (`--dropdown-*`) ป้องกันปัญหากล่องรายการแสดงพื้นหลังมืดแต่ตัวหนังสือสีน้ำเงินเข้มทำให้อ่านยากในธีม Teyvat Dawn (Light Mode) ให้แสดงพื้นหลังสีขาวนวลตัวอักษรเข้มมีคอนทราสต์คมชัดสวยงามมิว~
- **Dynamic Theme Descendant Selector:** แก้ไขการใช้ตัวระบุคลาสแบบเดิม `[data-theme='dawn']` ใน JSX Tailwind classes ที่ทำงานไม่เสถียรบนอิลิเมนต์ลูก โดยการเปลี่ยนมาควบคุมการแสดงสไตล์และสีสันผ่าน React state `theme === 'dawn'` โดยตรงในปุ่มสลับธีม, ส่วนหัว Header, แถบควบคุมรูปภาพพรีวิว และขอบเขตพื้นที่ลากวางรูปภาพ OCR

---

## [2.1.1] - 2026-05-28

### Fixed

- **Modal Caching & Duplicate Input Bug:** แก้ไขบั๊กข้อมูลการเติมเงินครั้งก่อนค้างอยู่ในหน้าต่างฟอร์ม Modal โดยการต่อท้าย `customId` ของ Modal ด้วย ID ของการเรียกใช้งานคำสั่ง (`interaction.id`) ทำให้ Modal แต่ละหน้าต่างเป็นแบบไดนามิกและไม่ใช้แคชข้อมูลเดิมร่วมกัน
- **Trigger Button Reuse Bug:** ป้องกันผู้ใช้คลิกปุ่ม "กรอกรายละเอียดต่อ" ซ้ำหลังจากที่ส่งฟอร์ม Modal และบันทึกข้อมูลเรียบร้อยแล้ว โดยบอทจะอัปเดตสถานะของปุ่มในข้อความเดิมให้ถูกปิดใช้งาน (Disabled) และเปลี่ยนข้อความเป็น "บันทึกเรียบร้อยแล้วมิว! ✅" เพื่อป้องกันการกดปุ่มและบันทึกซ้ำ
- **Topup Date Locale & Mismatch Bug:** แก้ไขปัญหาการเก็บข้อมูลวันที่ใน Google Sheets ที่แสดงไม่ตรง/คลาดเคลื่อนเนื่องจากความแตกต่างของ Locale ของชีท โดยการเปลี่ยนมาบันทึกวันที่ด้วยรูปแบบมาตรฐาน ISO `YYYY-MM-DD` แทน พร้อมเพิ่มฟังก์ชัน `formatSheetDate` ในระบบดึงข้อมูล โดยใช้ Regex แบบเข้มงวด `/^\d{2}\/\d{2}\/\d{4}$/` ร่วมกับ Date parser ในการแปลงกลับเป็นรูปแบบ `DD/MM/YYYY` เพื่อช่วยรองรับการกรอกวันที่ของชีทที่เป็น US format หรือหลักเดียว (เช่น `5/28/2026` หรือ `4/8/2026`) ให้แสดงผลถูกต้องเสมอโดยไม่สลับหลัก วัน/เดือน
- **Modal Label Update:** ปรับข้อความของกล่องกรอกวันที่ใน Modal ฟอร์ม ทั้งในคำสั่งปกติและสลิป จากเดิม "วันที่ (D/M/YY หรือ DD/MM/YYYY)" เป็น "วันที่ทำการเติม" เพื่อความชัดเจนและสอดคล้องกับพฤติกรรมผู้ใช้

---

## [2.1.0] - 2026-05-10

### Added

#### `/undo` Command — ยกเลิกรายการล่าสุด
> **PRD Ref:** Section 4 — Planned Features (`/undo` หรือ `/delete`)

- ใช้คำสั่ง `/undo` เพื่อลบ transaction ล่าสุดของผู้ใช้
- แสดง Embed ยืนยันพร้อมรายละเอียด (เกม, จำนวนเงิน, วันที่, รายละเอียด) ก่อนลบจริง
- มีปุ่ม **ยืนยัน** (Danger) และ **ยกเลิก** (Secondary) เพื่อป้องกันการลบโดยไม่ตั้งใจ
- ลบข้อมูลจาก Google Sheets ผ่าน UUID matching

#### `/delete` Command — ลบรายการที่เลือก
> **PRD Ref:** Section 4 — Planned Features (`/undo` หรือ `/delete`)

- ใช้คำสั่ง `/delete` เพื่อเลือกและลบ transaction ที่ต้องการ
- แสดง **String Select Menu (Dropdown)** ของ 25 รายการล่าสุด ให้ผู้ใช้เลือก
- หลังเลือกรายการ จะแสดง Embed ยืนยันพร้อมปุ่ม ก่อนลบจริง
- ลบข้อมูลจาก Google Sheets ผ่าน UUID matching

#### `/summary` Update — ปรับการเรียงข้อมูล
> **PRD Ref:** Section 3.2 — Summary Dashboard

- เปลี่ยนแปลงให้ `/summary` นำรายการล่าสุด 5 รายการมาเรียงจาก **วันที่ล่าสุดขึ้นก่อน (Descending Order)** เพื่อให้ง่ายต่อการอ่าน

#### Google Sheets Utility Functions
- `getLatestRecord(userId)` — ดึง transaction ล่าสุดของผู้ใช้
- `getRecentRecords(userId, limit)` — ดึง N transactions ล่าสุดของผู้ใช้
- `deleteRecord(recordId)` — ลบ row จาก Google Sheets ด้วย UUID

#### Interaction Handler Expansion
- เพิ่ม **Button interaction routing** สำหรับ `/undo` และ `/delete` confirmations
- เพิ่ม **String Select Menu routing** สำหรับ `/delete` record selection

#### Help Command Update
- เพิ่มคำอธิบาย `/undo` และ `/delete` ใน `/help` embed ด้วยโทนภาษาเมม

### Changed

#### Flexible Date Format (Bugfix)
> **PRD Ref:** Section 3.1 — Record Transaction, AC-4 (Form Validation)

- **ก่อนหน้า:** Date validation บังคับ format `DD/MM/YYYY` เท่านั้น (เช่น `05/09/2026`)
- **ตอนนี้:** รองรับ format ยืดหยุ่น: `D/M/YY`, `DD/MM/YY`, `D/M/YYYY`, `DD/MM/YYYY`
- ปี 2 หลัก (เช่น `26`) จะถูก normalize เป็น 4 หลัก (เช่น `2026`) อัตโนมัติ
- ข้อมูลที่บันทึกลง Google Sheets จะถูก normalize เป็น `DD/MM/YYYY` เสมอ
- Regex ถูก tighten เพื่อไม่ให้ปีที่ 3 หลักหลุดเข้ามา: `(\d{2}|\d{4})`
- อัปเดต label และ placeholder ของ date input ใน Modal ให้สื่อสาร format ใหม่

---

## [2.0.0] - 2026-05-09

> Initial release ตาม PRD v2.0.0

### Core Features (PRD Section 3)
- `/topup` — บันทึกการเติมเงินพร้อม Modal form, Autocomplete, และ Validation
- `/summary` — ดูสรุปยอดรวมและ 5 รายการล่าสุด (รวมทุกเกม หรือเฉพาะเกม)
- `/help` — แสดงคู่มือการใช้งานในโทนภาษาเมม
- Google Sheets Integration — บันทึกข้อมูล real-time ผ่าน Service Account
- Mem Persona — ทุกข้อความใช้คาร์แรคเตอร์เมม (ลงท้าย "มิว!", สรรพนาม "ผู้บุกเบิก")

### Files
| File | Purpose |
|------|---------|
| `src/commands/topup.js` | Record transaction command |
| `src/commands/summary.js` | Summary dashboard command |
| `src/commands/help.js` | Help & guide command |
| `src/commands/undo.js` | Undo latest transaction *(added v2.1.0)* |
| `src/commands/delete.js` | Delete specific transaction *(added v2.1.0)* |
| `src/utils/googleSheets.js` | Google Sheets data access layer |
| `src/events/interactionCreate.js` | Interaction routing (commands, modals, buttons, select menus) |
| `src/deploy-commands.js` | Discord slash command registration (global) |
| `src/index.js` | Bot entry point |
