# 🌐 Cross-Browser Migration Utility (Zero-Trust In-Browser Web App)

> **Private, local-first, client-side web application for seamlessly migrating bookmarks, browsing history, saved passwords, and extensions between modern web browsers.**

[![Zero Telemetry](https://img.shields.io/badge/Privacy-100%25%20Zero--Trust-emerald)](https://github.com/mygit55/Web-Application-Cross-Browser-Migration)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple)](https://vitejs.dev/)

---

## 📖 תיאור הפרויקט (Overview)

אפליקציית ווב מתקדמת הרצה ב-100% בתוך הדפדפן (Client-Side Only), המאפשרת מעבר קל, מאובטח ואינטואיטיבי בין כל דפדפני האינטרנט הפופולריים:
**Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge, Brave, Arc, ו-Opera.**

האפליקציה פועלת במודל **Zero-Trust**: שום סיסמה, היסטוריית גלישה או סימניה אינם נשלחים לשרת חיצוני כלשהו. כל פעולות הפענוח, ניתוח המבנים (JSON, HTML, Plist, SQLite), המרת חותמות הזמן וסינון הכפילויות מתבצעים ישירות בתוך ה-Sandbox של הדפדפן באמצעות תקני Web מודרניים ([File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) ו-[SQLite Wasm](https://developer.chrome.com/blog/sqlite-wasm-in-the-browser-backed-by-the-origin-private-file-system)).

---

## ✨ תכונות עיקריות (Key Features)

- **🔒 100% פרטיות ואפס טלמטריה (Zero-Trust Privacy):** כל המידע מעובד בזיכרון המקומי בלבד (In-Memory). שום מידע אישי אינו יוצא מהמחשב שלך.
- **📁 מגוון שיטות קריאה (Flexible Ingestion):**
  - בחירת תיקיית הפרופיל ישירות באמצעות ה-**File System Access API** (`showDirectoryPicker`).
  - גרירה והעלאה של קובצי פרופיל (Chromium `Bookmarks` JSON, Safari `Bookmarks.plist`, Firefox `places.sqlite`, `logins.json`, או ייצוא סיסמאות ב-CSV).
  - מצב Sandbox Demo מובנה לבדיקת המערכת באופן מיידי.
- **⏱️ מנוע המרת חותמות זמן מדויק (Precision Epoch Normalizer):**
  - **Chromium / WebKit Epoch:** מיקרו-שניות מ-01/01/1601 UTC.
  - **Apple Cocoa / Safari Absolute Time:** שניות (float) מ-01/01/2001 UTC.
  - **Mozilla Firefox PRTime:** מיקרו-שניות מ-01/01/1970 UTC (Unix Epoch).
  - **ISO 8601 / Unix Milliseconds** סטנדרטי.
- **🧹 ניקוי כפילויות חכם (Smart Deduplication):**
  - נירמול כתובות URL והסרת פרמטרי מעקב אוטומטית (`utm_*`, `fbclid`, `gclid`).
  - מיזוג סימניות זהות לפי היררכיית תיקיות.
  - איחוד היסטוריית גלישה וסכימת מוני כניסות (`visit_count`).
- **🧩 מיפוי תוספים בין דפדפנים (Cross-Browser Extension Matcher):**
  - קטלוג מובנה של התוספים המובילים בעולם (uBlock Origin, Bitwarden, 1Password, Dark Reader ועוד).
  - הפקת קישורי התקנה בלחיצה אחת לחנות המתאימה לדפדפן היעד (Chrome Web Store, Firefox AMO, Edge Add-ons).
- **📦 ייצוא והזרקה מותאמים אישית (Tailored Export Formats):**
  - **Universal Netscape Bookmark HTML:** תקן אוניברסלי הנתמך ב-100% מכל הדפדפנים בעולם עם שמירה מלאה על עץ התיקיות.
  - **Native Chromium Bookmarks JSON:** קובץ מוכן להשמה ישירה בפרופיל דפדפני Chromium עם חישוב מחדש של Checksum.
  - **Firefox Bookmarks Backup JSON:** קובץ שחזור ייעודי עבור ספריית הסימניות של פיירפוקס.
  - **Universal Passwords CSV:** קובץ סיסמאות סטנדרטי התואם ל-Chrome, Firefox, Safari Passwords, ו-Bitwarden.
  - **Master Migration Backup (JSON):** גיבוי כולל של כל הנתונים שחולצו.

---

## 🏗️ ארכיטקטורה ומבנה הפרויקט (Architecture)

```text
├── src/
│   ├── types/
│   │   └── migration.ts         # מודלי נתונים אחידים (Bookmark, History, Credential, Extension)
│   ├── utils/
│   │   ├── timestamps.ts        # המרות מדויקות בין Chromium, Cocoa, Firefox ו-Unix
│   │   ├── deduplication.ts     # אלגוריתמי ניקוי והסרת כפילויות
│   │   └── extensionMapper.ts   # קטלוג ומאתר תוספים בין חנויות הדפדפנים
│   ├── parsers/
│   │   ├── chromium.ts          # פענוח Bookmarks JSON, SQLite History ו-CSV סיסמאות
│   │   ├── firefox.ts           # פענוח places.sqlite ו-logins.json
│   │   └── safari.ts            # פענוח Bookmarks.plist ו-History.db
│   ├── generators/
│   │   ├── netscapeHtml.ts      # יצירה ופענוח של תקן Netscape Bookmark HTML
│   │   ├── chromium.ts          # הפקת מבנה תיקיות Bookmarks עבור Chromium
│   │   ├── firefox.ts           # הפקת קובץ שחזור JSON עבור Firefox
│   │   └── passwordCsv.ts       # הפקת קובץ Passwords CSV אוניברסלי
│   ├── components/
│   │   ├── Navbar.tsx           # כותרת עם תג Zero-Trust ובורר שפה (עברית/אנגלית)
│   │   ├── SourceSelector.tsx   # בחירת דפדפן, נתיבי מערכת, והעלאת קבצים
│   │   ├── DataPreview.tsx      # טאבים אינטראקטיביים לסינון סימניות, היסטוריה וסיסמאות
│   │   └── TargetExporter.tsx   # בחירת דפדפן היעד, הורדת קבצים ומדריכי ייבוא
│   ├── App.tsx                  # רכיב האשף הראשי (Wizard Orchestrator)
│   ├── main.tsx                 # נקודת כניסה של React
│   └── index.css                # עיצוב מודרני מבוסס Tailwind CSS ותמיכה ב-RTL
├── tests/
│   └── migration.test.js        # בדיקות יחידה אוטומטיות לחותמות זמן ונירמול נתונים
├── MIGRATION_PLAN.md            # תוכנית הביצוע והביקורת ההנדסית המלאה
├── package.json                 # תלויות ופקודות פיתוח
└── vite.config.ts               # הגדרות Vite
```

---

## 🚀 התקנה והרצה מקומית (Quick Start)

### דרישות קדם
- Node.js גרסה 18 ומעלה
- npm, pnpm או yarn

### הורדה והרצה:
```bash
# שיבוט המאגר
git clone https://github.com/mygit55/Web-Application-Cross-Browser-Migration.git
cd Web-Application-Cross-Browser-Migration

# התקנת תלויות
npm install

# הרצת שרת הפיתוח המקומי
npm run dev
```

פתח את הדפדפן בכתובת המקומית: **`http://localhost:5173`**.

### הרצת בדיקות (Unit Tests):
```bash
npm run test
```

---

## 🛡️ הערות אבטחה והרשאות מערכת (OS Security Notes)

1. **macOS Safari:**
   קובצי Safari שמורים בנתיב `~/Library/Safari/`. כדי לגשת אליהם ישירות דרך כלי מערכת יש להעניק הרשאת **Full Disk Access** ב-`System Settings -> Privacy & Security`. לחילופין, ניתן להשתמש בייצוא הסימניות המובנה של Safari (`File -> Export -> Bookmarks`).
2. **Windows Chrome App-Bound Encryption (`v20`):**
   החל מגרסאות Chrome 127+, סיסמאות מקומיות ב-Windows מוצפנות באמצעות שירות מערכת קנייני. האפליקציה תומכת באופן מלא בייבוא וייצוא דרך מנגנון ה-CSV המאובטח (`chrome://password-manager/settings`).
3. **Firefox Master Password:**
   קובץ `logins.json` מוצפן באמצעות מפתחות NSS השמורים ב-`key4.db`. מומלץ לייצא סיסמאות דרך `about:logins` במידה ומוגדרת סיסמת מאסטר.

---

## 📄 רישיון (License)

פרויקט זה מופץ תחת רישיון **MIT**. פרטים נוספים בקובץ `LICENSE`.
