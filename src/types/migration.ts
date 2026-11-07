export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'brave' | 'arc' | 'opera';

export interface UnifiedBookmark {
  id: string;
  title: string;
  url: string;
  dateAdded: number; // Unix timestamp in milliseconds
  folderPath: string[]; // e.g. ['Bookmarks Bar', 'Tech', 'AI']
  iconUri?: string;
  selected?: boolean;
}

export interface UnifiedVisit {
  visitTime: number; // Unix timestamp in milliseconds
  visitType?: number;
}

export interface UnifiedHistoryItem {
  id: string;
  url: string;
  title: string;
  lastVisitTime: number; // Unix timestamp in milliseconds
  visitCount: number;
  visits?: UnifiedVisit[];
  selected?: boolean;
}

export interface UnifiedCredential {
  id: string;
  originUrl: string;
  username: string;
  password: string;
  dateCreated?: number; // Unix timestamp in milliseconds
  realm?: string;
  selected?: boolean;
}

export interface UnifiedExtension {
  id: string;
  name: string;
  version?: string;
  description?: string;
  chromeStoreId?: string;
  firefoxAmoSlug?: string;
  edgeStoreId?: string;
  resolvedStoreUrl?: string;
  selected?: boolean;
}

export interface MigrationDataset {
  sourceBrowser: BrowserType;
  extractedAt: number; // Unix timestamp
  bookmarks: UnifiedBookmark[];
  history: UnifiedHistoryItem[];
  credentials: UnifiedCredential[];
  extensions: UnifiedExtension[];
}

export interface BrowserProfilePath {
  browser: BrowserType;
  name: string;
  os: 'macos' | 'windows' | 'linux';
  paths: {
    bookmarks?: string;
    history?: string;
    loginData?: string;
    keychainService?: string;
  };
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}
