import React from 'react';
import { ShieldCheck, Github, Globe2, Sparkles } from 'lucide-react';

interface NavbarProps {
  lang: 'he' | 'en';
  setLang: (lang: 'he' | 'en') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ lang, setLang }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white">Cross-Browser Migrator</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zero-Trust In-Browser
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {lang === 'he' ? 'מיגרציה פרטית ומאובטחת בין דפדפנים בתוך הדפדפן שלך' : 'Client-side cross-browser migration with zero telemetry'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'he' ? 'en' : 'he')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            title="Toggle Language"
          >
            <Globe2 className="w-3.5 h-3.5" />
            {lang === 'he' ? 'English' : 'עברית'}
          </button>

          <a
            href="https://github.com/mygit55/Web-Application-Cross-Browser-Migration"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub Repository</span>
          </a>
        </div>
      </div>
    </header>
  );
};
