import React, { useState } from 'react';
import { MigrationDataset } from './types/migration';
import { Navbar } from './components/Navbar';
import { SourceSelector } from './components/SourceSelector';
import { DataPreview } from './components/DataPreview';
import { TargetExporter } from './components/TargetExporter';
import { ShieldCheck, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [lang, setLang] = useState<'he' | 'en'>('he');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [dataset, setDataset] = useState<MigrationDataset | null>(null);

  const handleDataLoaded = (data: MigrationDataset) => {
    setDataset(data);
    setStep(2);
  };

  const handleReset = () => {
    setDataset(null);
    setStep(1);
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans ${lang === 'he' ? 'dir-rtl' : 'dir-ltr'}`}>
      <Navbar lang={lang} setLang={setLang} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                step === 1 ? 'bg-sky-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <span>1</span>
              <span>{lang === 'he' ? 'בחירת מקור' : 'Source'}</span>
            </button>

            <span className="text-slate-600">→</span>

            <button
              onClick={() => dataset && setStep(2)}
              disabled={!dataset}
              className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                step === 2 ? 'bg-sky-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white disabled:opacity-40'
              }`}
            >
              <span>2</span>
              <span>{lang === 'he' ? 'סקירה וסינון' : 'Review'}</span>
            </button>

            <span className="text-slate-600">→</span>

            <button
              onClick={() => dataset && setStep(3)}
              disabled={!dataset}
              className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                step === 3 ? 'bg-sky-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white disabled:opacity-40'
              }`}
            >
              <span>3</span>
              <span>{lang === 'he' ? 'ייצוא ליעד' : 'Export'}</span>
            </button>
          </div>

          {dataset && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{lang === 'he' ? 'התחל מחדש' : 'Reset'}</span>
            </button>
          )}
        </div>

        {step === 1 && (
          <SourceSelector onDataLoaded={handleDataLoaded} lang={lang} />
        )}

        {step === 2 && dataset && (
          <div className="space-y-6">
            <DataPreview data={dataset} onDataUpdated={setDataset} lang={lang} />
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/20 transition-all"
              >
                <span>{lang === 'he' ? 'המשך לייצוא לדפדפן היעד' : 'Proceed to Export'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && dataset && (
          <div className="space-y-6">
            <TargetExporter data={dataset} lang={lang} />
            <div className="flex justify-start pt-4 border-t border-slate-800">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{lang === 'he' ? 'חזור לסינון' : 'Back to Review'}</span>
              </button>
            </div>
          </div>
        )}

        <section className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 space-y-1">
            <h4 className="font-semibold text-emerald-300">
              {lang === 'he' ? 'אבטחת Zero-Trust ופרטיות מוחלטת' : 'Zero-Trust Client-Side Privacy Guarantee'}
            </h4>
            <p>
              {lang === 'he'
                ? 'כל קריאת הקבצים, ניתוח המבנים (JSON/HTML/CSV), המרת חותמות הזמן וסינון הכפילויות מבוצעים ב-100% במעבד ובזיכרון הדפדפן שלך. שום מידע אישי אינו נשלח לשרת כלשהו.'
                : 'All parsing, timestamp normalizations, and deduplication run 100% inside your browser sandbox. No personal data, passwords, or history are transmitted to any remote server.'}
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        Cross-Browser Migration Utility &bull; Zero-Trust Local Web Application &bull; 
        <a href="https://github.com/mygit55/Web-Application-Cross-Browser-Migration" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline ml-1">
          GitHub Repo
        </a>
      </footer>
    </div>
  );
};
