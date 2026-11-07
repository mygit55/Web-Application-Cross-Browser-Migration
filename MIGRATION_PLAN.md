# תוכנית הנדסית וביצועית מבוקרת: מערכת מיגרציה מאובטחת בין דפדפנים (Zero-Trust Cross-Browser Migration)

מסמך זה כולל ביקורת ארכיטקטונית מעמיקה על תוכנית המקור וגרסה משודרגת ומוכנה לביצוע (Production-Ready Execution Plan) המותאמת למציאות הטכנית של מבני הנתונים, מנגנוני ההצפנה והרשאות מערכת ההפעלה בדפדפנים מודרניים.

## 1. ממצאי ביקורת הנדסית על התוכנית המקורית

התוכנית המקורית מציגה חלוקה לוגית טובה לשלבי ETL (שליפה, המרה, הזרקה) וגישת אבטחה נכונה (Zero-Trust), אך כוללת כשלים טכניים מהותיים שיגרמו לכישלון הפיתוח ללא התאמה מראש:

| תחום בתוכנית המקורית | הכשל ההנדסי שזוהה | המשמעות בפועל ופתרון נדרש |
| :--- | :--- | :--- |
| **ארכיטקטורה: Web App מול Desktop App** | סתירה בין הדרישה ליצור אפליקציית ווב לבין הגדרת Desktop App הקוראת ישירות ל-macOS Keychain ולתהליכי מערכת. | דפדפן אינטרנט רץ בתוך Sandbox ואינו רשאי לגשת ל-Keychain או לנתיבי מערכת חסומים דרך [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API). יש לבחור בין **אפליקציית Web UI עם Local Companion Daemon (או Tauri/Electron)** לבין **100% Client-Side Web App** המבוססת על [SQLite Wasm](https://developer.chrome.com/blog/sqlite-wasm-in-the-browser-backed-by-the-origin-private-file-system) וקבצי ייצוא ידניים. |
| **מבנה קבצים (Phase 2 & 3)** | הנחה שגויה שכל נתוני הדפדפנים שמורים בטבלאות SQLite (למשל הטענה שסימניות נמצאות ב-SQLite בכל הדפדפנים). | לפי מיפוי [BrowserForensics של ארטיפקטים בדפדפנים](https://www.browserforensics.app/en/blog/where-browsers-store-artifacts), בדפדפני Chromium קובץ ה-`Bookmarks` וקובץ ה-`Preferences` שמורים בפורמט **JSON** (ולא SQLite), ב-Safari הסימניות שמורות כקובץ Binary Property List (`Bookmarks.plist`) כמתואר ב-[ניתוח ארטיפקטים של Safari](https://www.cyberengage.org/post/analyzing-safari-browser-apple-mail-data-and-recents-database-artifacts-on-macos), ורק ב-Firefox הן ב-SQLite (`places.sqlite`). |
| **הצפנת סיסמאות ב-Firefox (Phase 2)** | הנחה שכל הדפדפנים נשענים על ה-macOS Keychain או Windows DPAPI לשמירת מפתחות הצפנה. | לפי תיעוד [מנגנון ההצפנה של Firefox ב-NSS](https://www.browserforensics.app/en/blog/firefox-password-decryption-nss), דפדפן Firefox אינו משתמש ב-Keychain או ב-DPAPI כלל, אלא מנהל מערכת הצפנה עצמאית המפוצלת בין הקובץ `key4.db` (מפתחות NSS) לבין `logins.json` (הסיסמאות המוצפנות ב-3DES-CBC/AES). |
| **הצפנת סיסמאות ועוגיות ב-Windows (Phase 2 & 4)** | הסתמכות על DPAPI בלבד (`v10`) עבור דפדפני Chromium במערכת Windows. | החל מגרסה 127 (ובאופן גורף בגרסאות 140+), גוגל הטמיעה את מנגנון [App-Bound Encryption (`v20`) ב-Windows](https://security.googleblog.com/2024/07/improving-security-of-chrome-cookies-on.html), הקושר את המפתח לשירות מערכת ברמת `SYSTEM` ומונע מתהליך חיצוני ברמת משתמש לפענח או להזריק עוגיות וסיסמאות ישירות ([דיווח באג בייבוא עוגיות `v20` ב-Chromium 140+](https://github.com/stablyai/orca/issues/13192)). |
| **הרשאות גישה ל-Safari ב-macOS (Phase 2)** | היעדר התייחסות למנגנון ההגנה TCC (Transparency, Consent, and Control) של Apple. | ספריית `~/Library/Safari` מוגנת ברמת הקרנל. ללא הענקת הרשאת [Full Disk Access ב-macOS](https://www.huntress.com/blog/ask-the-mac-guy-whats-the-deal-with-full-disk-access) לאפליקציה המריצה, כל קריאה ל-`History.db` או `Bookmarks.plist` תיכשל מיידית עם שגיאת `Operation not permitted (EPERM)`. |
| **הזרקת תוספים והעדפות (Phase 3 & 4)** | ניסיון להזריק תוספים והגדרות ישירות לתוך קובצי הפרופיל של דפדפני Chromium. | קובץ `Secure Preferences` מוגן בחתימת [HMAC-SHA256 עם Seed קנייני של הדפדפן](https://research.chalmers.se/en/publication/521711). כל עריכה חיצונית של רשימת התוספים או מנוע החיפוש תגרום לדפדפן היעד לאפס את הפרופיל בעת ההפעלה ולהתריע על השחתת הגדרות. |
| **מחיקה מאובטחת בכונני SSD (Phase 5)** | דרישה לביצוע Cryptographic Wipe לקובצי SQLite זמניים על הדיסק. | בכונני NVMe/SSD מודרניים עם מערכות קבצים APFS ו-NTFS, מנגנון ה-Wear Leveling מונע דריסה פיזית של אותם בלוקים. הפתרון הנכון הוא עיבוד מסדי הנתונים בזיכרון נדיף בלבד (In-Memory SQLite serialization / RAM Disk) כך שמידע מפוענח לעולם לא ייכתב לדיסק. |
| **מיגרציית Linked Accounts (Project Objective)** | הבטחה להעביר "חשבונות מקושרים" (Google Sync / iCloud / Mozilla Account). | אסימוני סנכרון דפדפן קשורים קריפטוגרפית לזהות הבינארית של הדפדפן ולמפתחות OAuth פנימיים של היצרן — לא ניתן להמיר סשן סנכרון של Chrome לחשבון Firefox Sync. |

## 2. החלטה ארכיטקטונית: כיצד לבנות זאת כ-Web Application?

כדי לעמוד בדרישה לחוויית **Web Application** מודרנית מבלי להיתקל בחסימות ה-Sandbox של הדפדפן, התוכנית המשודרגת מגדירה **ארכיטקטורה היברידית דו-שכבתית**:

1. **מצב א' — Local Hybrid Web App (מומלץ למיגרציה אוטומטית מלאה):**
   ממשק משתמש מבוסס Web (React / Next.js / Vite) הרץ מול שרת לוקאלי קל-משקל (`127.0.0.1` ב-Rust או Python FastAPI) או עטוף ב-**Tauri**. השרת הלוקאלי מבצע את קריאת הנתיבים המוגנים, בדיקת ה-Full Disk Access, והעבודה מול ה-[macOS Keychain Safe Storage](https://nextsupport.getmailbird.com/hc/en-us/articles/35293492777623-Chromium-Safe-Storage-Alert), בעוד ה-Web App מספק אשף אינטראקטיבי למיפוי ובקרה.
2. **מצב ב' — Pure Client-Side Web App (ללא התקנה כלל, מבוסס WebAssembly):**
   אפליקציית ווב טהורה המשתמשת ב-[`window.showOpenFilePicker()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker) וב-[SQLite Wasm](https://developer.chrome.com/blog/sqlite-wasm-in-the-browser-backed-by-the-origin-private-file-system) לצד [פענוח NSS בדפדפן עבור `key4.db` ו-`logins.json`](https://www.browserforensics.app/en/blog/decrypt-firefox-passwords-in-your-browser). במצב זה המשתמש גורר קובצי פרופיל או קובצי ייצוא (CSV לסיסמאות, HTML/JSON לסימניות, SQLite להיסטוריה) והעיבוד מתבצע ב-100% בתוך זיכרון ה-Web Worker ללא שום שרת.

---

## 3. תוכנית ביצוע מפורטת (Phase 1 to Phase 6)

ראו את פירוט השלבים המלא בתוכנית הביצוע לעיל.
