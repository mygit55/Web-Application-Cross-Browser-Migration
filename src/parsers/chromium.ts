import { UnifiedBookmark, UnifiedHistoryItem, UnifiedCredential } from '../types/migration';
import { chromiumTimeToUnixMs } from '../utils/timestamps';

interface ChromiumBookmarkNode {
  id: string;
  name: string;
  type: 'url' | 'folder';
  url?: string;
  date_added?: string;
  children?: ChromiumBookmarkNode[];
}

interface ChromiumBookmarksJson {
  checksum?: string;
  roots: {
    bookmark_bar?: ChromiumBookmarkNode;
    other?: ChromiumBookmarkNode;
    synced?: ChromiumBookmarkNode;
    [key: string]: ChromiumBookmarkNode | string | undefined;
  };
  version?: number;
}

export function parseChromiumBookmarksJson(jsonStr: string): UnifiedBookmark[] {
  const data: ChromiumBookmarksJson = JSON.parse(jsonStr);
  const results: UnifiedBookmark[] = [];

  function traverse(node: ChromiumBookmarkNode, currentPath: string[]) {
    if (node.type === 'url' && node.url) {
      results.push({
        id: node.id || Math.random().toString(36).substring(2, 9),
        title: node.name || 'Untitled',
        url: node.url,
        dateAdded: node.date_added ? chromiumTimeToUnixMs(node.date_added) : Date.now(),
        folderPath: [...currentPath],
        selected: true
      });
    } else if (node.type === 'folder' && node.children) {
      const nextPath = node.name ? [...currentPath, node.name] : currentPath;
      for (const child of node.children) {
        traverse(child, nextPath);
      }
    }
  }

  if (data.roots) {
    if (data.roots.bookmark_bar) traverse(data.roots.bookmark_bar, ['Bookmarks Bar']);
    if (data.roots.other) traverse(data.roots.other, ['Other Bookmarks']);
    if (data.roots.synced) traverse(data.roots.synced, ['Mobile Bookmarks']);
  }

  return results;
}

export function parseChromiumHistoryRows(rows: Array<{
  id?: number | string;
  url: string;
  title?: string;
  visit_count?: number;
  last_visit_time?: number | string;
}>): UnifiedHistoryItem[] {
  return rows.map(r => ({
    id: String(r.id || Math.random().toString(36).substring(2, 9)),
    url: r.url,
    title: r.title || r.url,
    visitCount: Number(r.visit_count) || 1,
    lastVisitTime: r.last_visit_time ? chromiumTimeToUnixMs(r.last_visit_time) : Date.now(),
    selected: true
  }));
}

export function parseChromiumPasswordCsv(csvContent: string): UnifiedCredential[] {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
  const urlIdx = headers.findIndex(h => h === 'url' || h === 'origin_url' || h === 'hostname');
  const userIdx = headers.findIndex(h => h === 'username' || h === 'user' || h === 'login');
  const passIdx = headers.findIndex(h => h === 'password' || h === 'pass');

  if (urlIdx === -1 || passIdx === -1) {
    throw new Error('CSV missing required "url" or "password" header columns.');
  }

  const results: UnifiedCredential[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
    const cleanCells = row.map(c => c.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

    const originUrl = cleanCells[urlIdx];
    const password = cleanCells[passIdx];
    const username = userIdx !== -1 ? cleanCells[userIdx] || '' : '';

    if (originUrl && password) {
      results.push({
        id: `cred-${i}-${Math.random().toString(36).substring(2, 7)}`,
        originUrl,
        username,
        password,
        dateCreated: Date.now(),
        selected: true
      });
    }
  }

  return results;
}
