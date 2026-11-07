import { UnifiedBookmark, UnifiedHistoryItem, UnifiedCredential } from '../types/migration';
import { firefoxPrTimeToUnixMs } from '../utils/timestamps';

export function parseFirefoxBookmarksRows(rows: Array<{
  id: number | string;
  title?: string;
  url: string;
  dateAdded?: number | string;
  folderName?: string;
}>): UnifiedBookmark[] {
  return rows.map(r => ({
    id: `ff-bm-${r.id}`,
    title: r.title || r.url,
    url: r.url,
    dateAdded: r.dateAdded ? firefoxPrTimeToUnixMs(r.dateAdded) : Date.now(),
    folderPath: r.folderName ? [r.folderName] : ['Bookmarks Menu'],
    selected: true
  }));
}

export function parseFirefoxHistoryRows(rows: Array<{
  id: number | string;
  url: string;
  title?: string;
  visit_count?: number;
  last_visit_date?: number | string;
}>): UnifiedHistoryItem[] {
  return rows.map(r => ({
    id: `ff-hist-${r.id}`,
    url: r.url,
    title: r.title || r.url,
    visitCount: Number(r.visit_count) || 1,
    lastVisitTime: r.last_visit_date ? firefoxPrTimeToUnixMs(r.last_visit_date) : Date.now(),
    selected: true
  }));
}

export function parseFirefoxLoginsJson(jsonStr: string): {
  decryptedCredentials: UnifiedCredential[];
  encryptedLoginsCount: number;
} {
  const data = JSON.parse(jsonStr);
  const logins = Array.isArray(data.logins) ? data.logins : [];
  const credentials: UnifiedCredential[] = [];
  let encryptedCount = 0;

  for (let i = 0; i < logins.length; i++) {
    const item = logins[i];
    if (item.username && item.password) {
      credentials.push({
        id: `ff-cred-${item.id || i}`,
        originUrl: item.hostname || item.formSubmitURL || '',
        username: item.username,
        password: item.password,
        dateCreated: item.timeCreated ? firefoxPrTimeToUnixMs(item.timeCreated) : Date.now(),
        selected: true
      });
    } else if (item.encryptedUsername || item.encryptedPassword) {
      encryptedCount++;
    }
  }

  return {
    decryptedCredentials: credentials,
    encryptedLoginsCount: encryptedCount
  };
}
