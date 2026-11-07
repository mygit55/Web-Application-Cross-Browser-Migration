import React, { useState } from 'react';
import { MigrationDataset } from '../types/migration';
import { Bookmark, History, KeyRound, Blocks, Search, CheckSquare, Square, Eye, EyeOff, Sparkles, ExternalLink } from 'lucide-react';
import { deduplicateBookmarks, deduplicateHistory, deduplicateCredentials } from '../utils/deduplication';
import { formatTimestamp } from '../utils/timestamps';

interface DataPreviewProps {
  data: MigrationDataset;
  onDataUpdated: (data: MigrationDataset) => void;
  lang: 'he' | 'en';
}

export const DataPreview: React.FC<DataPreviewProps> = ({ data, onDataUpdated, lang }) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history' | 'passwords' | 'extensions'>('bookmarks');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const toggleBookmark = (id: string) => {
    const updated = data.bookmarks.map(b => b.id === id ? { ...b, selected: !b.selected } : b);
    onDataUpdated({ ...data, bookmarks: updated });
  };

  const toggleAllBookmarks = (select: boolean) => {
    const updated = data.bookmarks.map(b => ({ ...b, selected: select }));
    onDataUpdated({ ...data, bookmarks: updated });
  };

  const toggleHistory = (id: string) => {
    const updated = data.history.map(h => h.id === id ? { ...h, selected: !h.selected } : h);
    onDataUpdated({ ...data, history: updated });
  };

  const toggleCredential = (id: string) => {
    const updated = data.credentials.map(c => c.id === id ? { ...c, selected: !c.selected } : c);
    onDataUpdated({ ...data, credentials: updated });
  };

  const toggleExtension = (id: string) => {
    const updated = data.extensions.map(e => e.id === id ? { ...e, selected: !e.selected } : e);
    onDataUpdated({ ...data, extensions: updated });
  };

  const handleRunDeduplication = () => {
    const cleanBms = deduplicateBookmarks(data.bookmarks);
    const cleanHist = deduplicateHistory(data.history);
    const cleanCreds = deduplicateCredentials(data.credentials);

    onDataUpdated({
      ...data,
      bookmarks: cleanBms,
      history: cleanHist,
      credentials: cleanCreds
    });
  };

  const filteredBookmarks = data.bookmarks.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.folderPath.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredHistory = data.history.filter(h => 
    h.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCredentials = data.credentials.filter(c => 
    c.originUrl.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExtensions = data.extensions.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {lang === 'he' ? 'שלב 2: סקירה וסינון נתונים' : 'Step 2: Review and Filter Data'}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            {lang === 'he'
              ? 'באפשרותך לבחור אילו פריטים יועברו, לבצע חיפוש, או להפעיל ניקוי כפילויות חכם.'
              : 'Select which items to migrate, filter with search, or run automated deduplication.'}
          </p>
        </div>

        <button
          onClick={handleRunDeduplication}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>{lang === 'he' ? 'הפעל ניקוי כפילויות חכם' : 'Smart Deduplication'}</span>
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'bookmarks'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>{lang === 'he' ? 'סימניות' : 'Bookmarks'} ({data.bookmarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'history'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{lang === 'he' ? 'היסטוריה' : 'History'} ({data.history.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('passwords')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'passwords'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>{lang === 'he' ? 'סיסמאות' : 'Passwords'} ({data.credentials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('extensions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'extensions'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Blocks className="w-4 h-4" />
          <span>{lang === 'he' ? 'תוספים מקבילים' : 'Extensions'} ({data.extensions.length})</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={lang === 'he' ? 'חיפוש מהיר לפי כתובת או כותרת...' : 'Search by title, URL or folder...'}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
        />
      </div>

      {activeTab === 'bookmarks' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {lang === 'he' 
                ? `מוצגות ${filteredBookmarks.length} סימניות (${data.bookmarks.filter(b => b.selected !== false).length} נבחרו למיגרציה)`
                : `Showing ${filteredBookmarks.length} bookmarks (${data.bookmarks.filter(b => b.selected !== false).length} selected)`}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleAllBookmarks(true)}
                className="hover:text-slate-200 underline"
              >
                {lang === 'he' ? 'בחר הכל' : 'Select All'}
              </button>
              <button
                onClick={() => toggleAllBookmarks(false)}
                className="hover:text-slate-200 underline"
              >
                {lang === 'he' ? 'בטל בחירת הכל' : 'Deselect All'}
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/60 divide-y divide-slate-800/60">
            {filteredBookmarks.map(bm => (
              <div
                key={bm.id}
                onClick={() => toggleBookmark(bm.id)}
                className="p-3 flex items-start gap-3 hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <button className="mt-0.5 text-sky-400">
                  {bm.selected !== false ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-200 truncate">{bm.title}</span>
                    {bm.folderPath.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                        {bm.folderPath.join(' / ')}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono truncate block mt-0.5">{bm.url}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            {lang === 'he' 
              ? `מוצגים ${filteredHistory.length} פריטי היסטוריה`
              : `Showing ${filteredHistory.length} history items`}
          </div>

          <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/60 divide-y divide-slate-800/60">
            {filteredHistory.map(h => (
              <div
                key={h.id}
                onClick={() => toggleHistory(h.id)}
                className="p-3 flex items-start gap-3 hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <button className="mt-0.5 text-sky-400">
                  {h.selected !== false ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-200 truncate">{h.title}</span>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {formatTimestamp(h.lastVisitTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-500 font-mono truncate flex-1">{h.url}</span>
                    <span className="text-[10px] px-1.5 rounded bg-slate-800 text-slate-400">
                      {h.visitCount} visits
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'passwords' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{filteredCredentials.length} {lang === 'he' ? 'סיסמאות שמורות' : 'saved credentials'}</span>
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPasswords ? (lang === 'he' ? 'הסתר סיסמאות' : 'Hide') : (lang === 'he' ? 'הצג סיסמאות' : 'Reveal')}</span>
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/60 divide-y divide-slate-800/60">
            {filteredCredentials.map(cred => (
              <div
                key={cred.id}
                onClick={() => toggleCredential(cred.id)}
                className="p-3 flex items-center gap-3 hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <button className="text-sky-400">
                  {cred.selected !== false ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600" />
                  )}
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 text-xs">
                  <span className="font-mono text-slate-300 truncate">{cred.originUrl}</span>
                  <span className="text-slate-400 truncate">{cred.username || '—'}</span>
                  <span className="font-mono text-slate-400">
                    {showPasswords ? cred.password : '••••••••••••'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'extensions' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            {lang === 'he'
              ? 'רשימת התוספים שזוהו ומקביליהם בחנות התוספים של הדפדפן החדש:'
              : 'Detected extensions and their official store counterparts:'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredExtensions.map(ext => (
              <div
                key={ext.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleExtension(ext.id)} className="text-sky-400">
                      {ext.selected !== false ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                    <h4 className="text-xs font-bold text-white">{ext.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{ext.description}</p>
                </div>

                {ext.chromeStoreId && (
                  <a
                    href={`https://chromewebstore.google.com/detail/${ext.chromeStoreId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                    title="Open in Chrome Web Store"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
