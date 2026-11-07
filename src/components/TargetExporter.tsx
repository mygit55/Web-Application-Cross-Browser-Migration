import React, { useState } from 'react';
import { BrowserType, MigrationDataset } from '../types/migration';
import { Download, FileText, CheckCircle2, BookOpen } from 'lucide-react';
import { generateNetscapeBookmarkHtml } from '../generators/netscapeHtml';
import { generateChromiumBookmarksJson } from '../generators/chromium';
import { generateFirefoxBookmarksBackupJson } from '../generators/firefox';
import { generatePasswordCsv } from '../generators/passwordCsv';

interface TargetExporterProps {
  data: MigrationDataset;
  lang: 'he' | 'en';
}

const TARGET_BROWSERS: { id: BrowserType; name: string; icon: string }[] = [
  { id: 'chrome', name: 'Google Chrome', icon: '🌐' },
  { id: 'firefox', name: 'Mozilla Firefox', icon: '🦊' },
  { id: 'safari', name: 'Apple Safari', icon: '🧭' },
  { id: 'edge', name: 'Microsoft Edge', icon: '🌊' },
  { id: 'brave', name: 'Brave Browser', icon: '🦁' },
  { id: 'arc', name: 'Arc Browser', icon: '🎨' },
];

export const TargetExporter: React.FC<TargetExporterProps> = ({ data, lang }) => {
  const [targetBrowser, setTargetBrowser] = useState<BrowserType>('firefox');

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadNetscapeHtml = () => {
    const html = generateNetscapeBookmarkHtml(data.bookmarks, `Migrated Bookmarks to ${targetBrowser}`);
    downloadFile(html, 'bookmarks.html', 'text/html;charset=utf-8');
  };

  const handleDownloadChromiumJson = () => {
    const json = generateChromiumBookmarksJson(data.bookmarks);
    downloadFile(json, 'Bookmarks', 'application/json;charset=utf-8');
  };

  const handleDownloadFirefoxJson = () => {
    const json = generateFirefoxBookmarksBackupJson(data.bookmarks);
    downloadFile(json, `bookmarks-${new Date().toISOString().slice(0, 10)}.json`, 'application/json;charset=utf-8');
  };

  const handleDownloadPasswordCsv = () => {
    const csv = generatePasswordCsv(data.credentials);
    downloadFile(csv, 'passwords.csv', 'text/csv;charset=utf-8');
  };

  const handleDownloadMasterArchive = () => {
    const archive = JSON.stringify(data, null, 2);
    downloadFile(archive, `browser-migration-backup-${Date.now()}.json`, 'application/json;charset=utf-8');
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl font-bold text-white">
          {lang === 'he' ? 'שלב 3: ייצוא והזרקה לדפדפן היעד' : 'Step 3: Export & Target Browser Injection'}
        </h2>
        <p className="text-slate-400 text-xs">
          {lang === 'he'
            ? 'בחר את דפדפן היעד שלך והורד את קובצי המיגרציה המותאמים אישית עם הוראות ייבוא ברורות.'
            : 'Select your target browser and download tailored migration packages with exact import instructions.'}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {TARGET_BROWSERS.map(b => (
          <button
            key={b.id}
            onClick={() => setTargetBrowser(b.id)}
            className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
              targetBrowser === b.id
                ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/30'
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
            }`}
          >
            <span className="text-2xl">{b.icon}</span>
            <span className="text-xs font-semibold text-slate-200">{b.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {lang === 'he' ? 'קובץ סימניות אוניברסלי (HTML)' : 'Universal Netscape HTML'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'he'
                ? 'נתמך בכל דפדפן (Safari, Chrome, Firefox, Edge). שומר על היררכיית התיקיות המלאה.'
                : 'Universal standard supported by Safari, Chrome, Firefox, and Edge with full folder trees.'}
            </p>
          </div>
          <button
            onClick={handleDownloadNetscapeHtml}
            className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-sky-600/20"
          >
            <Download className="w-4 h-4" />
            <span>bookmarks.html</span>
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {targetBrowser === 'firefox' 
                ? (lang === 'he' ? 'גיבוי שחזור Firefox (JSON)' : 'Firefox JSON Backup')
                : (lang === 'he' ? 'קובץ פרופיל Chromium Bookmarks' : 'Chromium Bookmarks File')}
            </h3>
            <p className="text-xs text-slate-400">
              {targetBrowser === 'firefox'
                ? (lang === 'he' ? 'פורמט שחזור ישיר עבור מנהל הסימניות של Firefox.' : 'Direct restore format for Firefox Bookmark Manager.')
                : (lang === 'he' ? 'קובץ Bookmarks להשמה ישירה בתיקיית הפרופיל.' : 'Direct Bookmarks file for Chromium profile folder.')}
            </p>
          </div>
          <button
            onClick={targetBrowser === 'firefox' ? handleDownloadFirefoxJson : handleDownloadChromiumJson}
            className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Download className="w-4 h-4" />
            <span>{targetBrowser === 'firefox' ? 'bookmarks-backup.json' : 'Bookmarks (JSON)'}</span>
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {lang === 'he' ? 'ייצוא סיסמאות סטנדרטי (CSV)' : 'Standard Passwords CSV'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'he'
                ? 'מתאים לייבוא ב-Chrome, Firefox (about:logins), Safari Passwords, ו-Bitwarden.'
                : 'Formatted for Chrome, Firefox, Safari Passwords, Edge, and Bitwarden.'}
            </p>
          </div>
          <button
            onClick={handleDownloadPasswordCsv}
            disabled={data.credentials.length === 0}
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>passwords.csv ({data.credentials.length})</span>
          </button>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <BookOpen className="w-4 h-4 text-sky-400" />
          <span>
            {lang === 'he' 
              ? `מדריך ייבוא מהיר עבור ${TARGET_BROWSERS.find(b => b.id === targetBrowser)?.name}:` 
              : `Import Guide for ${TARGET_BROWSERS.find(b => b.id === targetBrowser)?.name}:`}
          </span>
        </div>

        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          {targetBrowser === 'firefox' && (
            <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
              <li>{lang === 'he' ? 'פתח את Firefox והקש Ctrl+Shift+O (או Cmd+Shift+O ב-Mac) לפתיחת ספריית הסימניות.' : 'Open Firefox and press Ctrl+Shift+O (Cmd+Shift+O on macOS) to open Library.'}</li>
              <li>{lang === 'he' ? 'לחץ על "Import and Backup" ובחר "Import Bookmarks from HTML..." (בחר בקובץ bookmarks.html שהורדת).' : 'Click "Import and Backup" -> "Import Bookmarks from HTML..." (select downloaded bookmarks.html).'}</li>
              <li>{lang === 'he' ? 'עבור סיסמאות: פתח את about:logins, לחץ על שלוש הנקודות (...) ובחר "Import from a File...".' : 'For Passwords: navigate to about:logins, click (...) menu and choose "Import from a File...".'}</li>
            </ol>
          )}

          {targetBrowser === 'safari' && (
            <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
              <li>{lang === 'he' ? 'פתח את Safari, לחץ על File בתפריט העליון ובחר Import From -> Bookmarks HTML File...' : 'Open Safari, choose File -> Import From -> Bookmarks HTML File...'}</li>
              <li>{lang === 'he' ? 'בחר בקובץ bookmarks.html שהורדת.' : 'Select the downloaded bookmarks.html.'}</li>
              <li>{lang === 'he' ? 'עבור סיסמאות: פתח את הגדרות מערכת ב-Mac -> סיסמאות -> שלוש נקודות (...) -> ייבוא סיסמאות (בחר passwords.csv).' : 'For Passwords: open macOS System Settings -> Passwords -> (...) -> Import Passwords (select passwords.csv).'}</li>
            </ol>
          )}

          {(targetBrowser === 'chrome' || targetBrowser === 'edge' || targetBrowser === 'brave' || targetBrowser === 'arc') && (
            <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
              <li>{lang === 'he' ? 'הקש Ctrl+Shift+O לפתיחת מנהל הסימניות, לחץ על תפריט שלוש הנקודות (...) ובחר "Import Bookmarks".' : 'Press Ctrl+Shift+O to open Bookmark Manager, click (...) menu, choose "Import Bookmarks".'}</li>
              <li>{lang === 'he' ? 'בחר בקובץ bookmarks.html שהורדת.' : 'Select the downloaded bookmarks.html.'}</li>
              <li>{lang === 'he' ? 'עבור סיסמאות: היכנס ל-chrome://password-manager/settings ולחץ על "Import passwords".' : 'For Passwords: go to chrome://password-manager/settings and click "Import passwords".'}</li>
            </ol>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/50">
        <div>
          <h4 className="text-xs font-bold text-white">
            {lang === 'he' ? 'גיבוי מלא לכל הנתונים (JSON Archive)' : 'Full Master Backup (JSON)'}
          </h4>
          <p className="text-[11px] text-slate-500">
            {lang === 'he' ? 'קובץ גיבוי מקיף המכיל את כל הסימניות, ההיסטוריה וההגדרות שחולצו.' : 'Complete backup containing all normalized items.'}
          </p>
        </div>
        <button
          onClick={handleDownloadMasterArchive}
          className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors"
        >
          {lang === 'he' ? 'הורד גיבוי מלא' : 'Download Backup JSON'}
        </button>
      </div>
    </div>
  );
};
