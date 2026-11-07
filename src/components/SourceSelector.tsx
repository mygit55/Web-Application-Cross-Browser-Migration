import React, { useState } from 'react';
import { BrowserType, MigrationDataset } from '../types/migration';
import { FolderOpen, UploadCloud, Info, CheckCircle2, AlertTriangle, PlayCircle } from 'lucide-react';
import { parseChromiumBookmarksJson, parseChromiumPasswordCsv } from '../parsers/chromium';
import { parseNetscapeBookmarkHtml } from '../generators/netscapeHtml';
import { POPULAR_EXTENSIONS_CATALOG } from '../utils/extensionMapper';

interface SourceSelectorProps {
  onDataLoaded: (data: MigrationDataset) => void;
  lang: 'he' | 'en';
}

const BROWSER_OPTIONS: { id: BrowserType; name: string; color: string; icon: string }[] = [
  { id: 'chrome', name: 'Google Chrome', color: 'from-amber-500 to-red-500', icon: '🌐' },
  { id: 'firefox', name: 'Mozilla Firefox', color: 'from-orange-500 to-amber-600', icon: '🦊' },
  { id: 'safari', name: 'Apple Safari', color: 'from-blue-500 to-cyan-500', icon: '🧭' },
  { id: 'edge', name: 'Microsoft Edge', color: 'from-blue-600 to-teal-500', icon: '🌊' },
  { id: 'brave', name: 'Brave Browser', color: 'from-orange-600 to-red-600', icon: '🦁' },
  { id: 'arc', name: 'Arc Browser', color: 'from-purple-500 to-pink-500', icon: '🎨' },
];

const DEFAULT_PATHS: Record<BrowserType, { macos: string; windows: string; linux: string }> = {
  chrome: {
    macos: '~/Library/Application Support/Google/Chrome/Default',
    windows: '%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default',
    linux: '~/.config/google-chrome/Default'
  },
  firefox: {
    macos: '~/Library/Application Support/Firefox/Profiles/<profile_id>',
    windows: '%APPDATA%\\Mozilla\\Firefox\\Profiles\\<profile_id>',
    linux: '~/.mozilla/firefox/<profile_id>'
  },
  safari: {
    macos: '~/Library/Safari (Requires Full Disk Access in macOS Settings)',
    windows: 'Not applicable on Windows',
    linux: 'Not applicable on Linux'
  },
  edge: {
    macos: '~/Library/Application Support/Microsoft Edge/Default',
    windows: '%LOCALAPPDATA%\\Microsoft\\Edge\\User Data\\Default',
    linux: '~/.config/microsoft-edge/Default'
  },
  brave: {
    macos: '~/Library/Application Support/BraveSoftware/Brave-Browser/Default',
    windows: '%LOCALAPPDATA%\\BraveSoftware\\Brave-Browser\\User Data\\Default',
    linux: '~/.config/BraveSoftware/Brave-Browser/Default'
  },
  arc: {
    macos: '~/Library/Application Support/Arc/User Data/Default',
    windows: '%LOCALAPPDATA%\\Arc\\User Data\\Default',
    linux: 'Not applicable on Linux'
  },
  opera: {
    macos: '~/Library/Application Support/com.operasoftware.Opera',
    windows: '%APPDATA%\\Opera Software\\Opera Stable',
    linux: '~/.config/opera'
  }
};

export const SourceSelector: React.FC<SourceSelectorProps> = ({ onDataLoaded, lang }) => {
  const [selectedBrowser, setSelectedBrowser] = useState<BrowserType>('chrome');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'info' | 'error' | 'success' } | null>(null);

  const handlePickDirectory = async () => {
    setStatusMsg(null);
    setLoading(true);

    try {
      if (!('showDirectoryPicker' in window)) {
        throw new Error(lang === 'he' 
          ? 'דפדפן זה אינו תומך ב-Directory Picker API ישירות. אנא השתמש באפשרות העלאת הקבצים למטה.'
          : 'Your browser does not support the Directory Picker API. Please use file upload below.');
      }

      // @ts-expect-error File System Access API
      const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
      const dataset: MigrationDataset = {
        sourceBrowser: selectedBrowser,
        extractedAt: Date.now(),
        bookmarks: [],
        history: [],
        credentials: [],
        extensions: []
      };

      try {
        const bookmarksFileHandle = await dirHandle.getFileHandle('Bookmarks');
        const file = await bookmarksFileHandle.getFile();
        const text = await file.text();
        dataset.bookmarks = parseChromiumBookmarksJson(text);
      } catch {
        // file not found
      }

      if (dataset.bookmarks.length === 0) {
        setStatusMsg({
          text: lang === 'he'
            ? 'לא נמצא קובץ Bookmarks בתיקייה שנבחרה. וודא שבחרת את תיקיית הפרופיל (Default).'
            : 'No Bookmarks file found in selected directory. Ensure you selected the Default profile directory.',
          type: 'error'
        });
      } else {
        setStatusMsg({
          text: lang === 'he' 
            ? `נטענו בהצלחה ${dataset.bookmarks.length} סימניות!` 
            : `Successfully loaded ${dataset.bookmarks.length} bookmarks!`,
          type: 'success'
        });
        onDataLoaded(dataset);
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        setStatusMsg({ text: (err as Error).message, type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setStatusMsg(null);

    const dataset: MigrationDataset = {
      sourceBrowser: selectedBrowser,
      extractedAt: Date.now(),
      bookmarks: [],
      history: [],
      credentials: [],
      extensions: []
    };

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const text = await file.text();

        if (file.name.toLowerCase() === 'bookmarks' || file.name.endsWith('.json')) {
          try {
            const parsed = parseChromiumBookmarksJson(text);
            dataset.bookmarks = [...dataset.bookmarks, ...parsed];
          } catch {
            // Ignored
          }
        }

        if (file.name.endsWith('.html') || file.name.endsWith('.htm') || text.includes('NETSCAPE-Bookmark-file-1')) {
          try {
            const parsed = parseNetscapeBookmarkHtml(text);
            dataset.bookmarks = [...dataset.bookmarks, ...parsed];
          } catch {
            // Ignored
          }
        }

        if (file.name.endsWith('.csv')) {
          try {
            const creds = parseChromiumPasswordCsv(text);
            dataset.credentials = [...dataset.credentials, ...creds];
          } catch {
            // Ignored
          }
        }
      }

      if (dataset.bookmarks.length === 0 && dataset.credentials.length === 0) {
        throw new Error(lang === 'he' 
          ? 'לא זוהו סימניות או סיסמאות בקבצים שהועלו. אנא וודא שהעלית קובץ Bookmarks (JSON/HTML) או CSV סיסמאות.'
          : 'No valid bookmarks or passwords detected. Please upload Bookmarks (JSON/HTML) or a Passwords CSV.');
      }

      setStatusMsg({
        text: lang === 'he'
          ? `נטענו ${dataset.bookmarks.length} סימניות ו-${dataset.credentials.length} סיסמאות!`
          : `Loaded ${dataset.bookmarks.length} bookmarks and ${dataset.credentials.length} credentials!`,
        type: 'success'
      });
      onDataLoaded(dataset);
    } catch (err: unknown) {
      setStatusMsg({ text: (err as Error).message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSampleData = () => {
    const sampleData: MigrationDataset = {
      sourceBrowser: selectedBrowser,
      extractedAt: Date.now(),
      bookmarks: [
        { id: 'bm-1', title: 'GitHub: Web-Application-Cross-Browser-Migration', url: 'https://github.com/mygit55/Web-Application-Cross-Browser-Migration', dateAdded: Date.now() - 3600000, folderPath: ['Bookmarks Bar', 'Projects'], selected: true },
        { id: 'bm-2', title: 'MDN Web Docs: File System Access API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/File_System_API', dateAdded: Date.now() - 7200000, folderPath: ['Bookmarks Bar', 'Tech'], selected: true },
        { id: 'bm-3', title: 'SQLite Wasm in Browser', url: 'https://developer.chrome.com/blog/sqlite-wasm-in-the-browser-backed-by-the-origin-private-file-system', dateAdded: Date.now() - 86400000, folderPath: ['Bookmarks Bar', 'Tech', 'SQLite'], selected: true },
        { id: 'bm-4', title: 'Hacker News', url: 'https://news.ycombinator.com', dateAdded: Date.now() - 172800000, folderPath: ['Bookmarks Bar', 'Daily'], selected: true },
        { id: 'bm-5', title: 'Tailwind CSS Documentation', url: 'https://tailwindcss.com/docs', dateAdded: Date.now() - 259200000, folderPath: ['Other Bookmarks', 'Design'], selected: true }
      ],
      history: [
        { id: 'h-1', title: 'GitHub - mygit55/Web-Application-Cross-Browser-Migration', url: 'https://github.com/mygit55/Web-Application-Cross-Browser-Migration', visitCount: 24, lastVisitTime: Date.now() - 100000, selected: true },
        { id: 'h-2', title: 'MDN: Window.showDirectoryPicker()', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker', visitCount: 8, lastVisitTime: Date.now() - 500000, selected: true },
        { id: 'h-3', title: 'Vite Next Generation Frontend Tooling', url: 'https://vitejs.dev', visitCount: 15, lastVisitTime: Date.now() - 1200000, selected: true },
        { id: 'h-4', title: 'Chrome App-Bound Encryption Overview', url: 'https://security.googleblog.com/2024/07/improving-security-of-chrome-cookies-on.html', visitCount: 4, lastVisitTime: Date.now() - 4000000, selected: true }
      ],
      credentials: [
        { id: 'c-1', originUrl: 'https://github.com', username: 'mygit55', password: '••••••••••••', dateCreated: Date.now() - 5000000, selected: true },
        { id: 'c-2', originUrl: 'https://developer.mozilla.org', username: 'dev@example.com', password: '••••••••••••', dateCreated: Date.now() - 10000000, selected: true }
      ],
      extensions: POPULAR_EXTENSIONS_CATALOG.slice(0, 5).map(ext => ({
        id: ext.chromeId || ext.name,
        name: ext.name,
        description: ext.description,
        chromeStoreId: ext.chromeId,
        firefoxAmoSlug: ext.firefoxSlug,
        edgeStoreId: ext.edgeId,
        selected: true
      }))
    };

    setStatusMsg({
      text: lang === 'he' ? 'נטען פרופיל דוגמה עשיר לצורך בדיקה!' : 'Loaded sample browser profile successfully!',
      type: 'success'
    });
    onDataLoaded(sampleData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl font-bold text-white">
          {lang === 'he' ? 'שלב 1: בחר את דפדפן המקור' : 'Step 1: Select Source Browser'}
        </h2>
        <p className="text-slate-400 text-sm">
          {lang === 'he' 
            ? 'בחר את הדפדפן ממנו תרצה להעביר מידע. כל העיבוד מתבצע ב-100% מקומית בדפדפן שלך.'
            : 'Choose the browser you want to migrate from. All processing happens 100% locally in your browser.'}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {BROWSER_OPTIONS.map(b => (
          <button
            key={b.id}
            onClick={() => setSelectedBrowser(b.id)}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              selectedBrowser === b.id
                ? 'border-sky-500 bg-sky-500/10 shadow-lg shadow-sky-500/10 ring-2 ring-sky-500/30'
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/40'
            }`}
          >
            <span className="text-3xl">{b.icon}</span>
            <span className="text-xs font-semibold text-slate-200">{b.name}</span>
          </button>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Info className="w-4 h-4 text-sky-400" />
          <span>{lang === 'he' ? 'נתיבי ברירת מחדל לפרופיל הדפדפן הנבחר:' : 'Default profile locations for selected browser:'}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono text-slate-400">
          <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-500 font-sans block mb-1">macOS:</span>
            <span className="break-all">{DEFAULT_PATHS[selectedBrowser].macos}</span>
          </div>
          <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-500 font-sans block mb-1">Windows:</span>
            <span className="break-all">{DEFAULT_PATHS[selectedBrowser].windows}</span>
          </div>
          <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-500 font-sans block mb-1">Linux:</span>
            <span className="break-all">{DEFAULT_PATHS[selectedBrowser].linux}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <FolderOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {lang === 'he' ? 'בחירת תיקיית הפרופיל ישירות' : 'Pick Profile Directory'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'he'
                ? 'שימוש ב-File System Access API לבחירת תיקיית הפרופיל של הדפדפן שלך לקריאה ישירה של קובצי Bookmarks/History.'
                : 'Uses modern File System Access API to select your browser profile directory directly.'}
            </p>
          </div>
          <button
            onClick={handlePickDirectory}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 disabled:opacity-50"
          >
            <FolderOpen className="w-4 h-4" />
            {lang === 'he' ? 'בחר תיקיית פרופיל' : 'Choose Profile Folder'}
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {lang === 'he' ? 'העלאת קובצי Bookmarks / Passwords CSV' : 'Upload Profile or Export Files'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'he'
                ? 'גרור או בחר קובץ Bookmarks (JSON), קובץ סימניות HTML, או קובץ סיסמאות CSV.'
                : 'Upload Bookmarks (JSON/HTML), SQLite databases, or Passwords CSV export directly.'}
            </p>
          </div>
          <label className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
            <UploadCloud className="w-4 h-4 text-indigo-400" />
            <span>{lang === 'he' ? 'בחר קבצים להעלאה' : 'Choose Files to Upload'}</span>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".json,.html,.htm,.csv,.sqlite,.db"
            />
          </label>
        </div>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={handleLoadSampleData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700 transition-colors"
        >
          <PlayCircle className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'he' ? 'טען נתוני דוגמה מיידית (לבדיקת האפליקציה)' : 'Load Synthetic Sample Profile (Instant Demo)'}</span>
        </button>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
          statusMsg.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            : statusMsg.type === 'error'
              ? 'bg-red-500/10 border-red-500/20 text-red-300'
              : 'bg-sky-500/10 border-sky-500/20 text-sky-300'
        }`}>
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}
    </div>
  );
};
