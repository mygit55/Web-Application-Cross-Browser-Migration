import { UnifiedBookmark, UnifiedHistoryItem } from '../types/migration';
import { cocoaTimeToUnixMs } from '../utils/timestamps';

interface SafariRawBookmarkNode {
  WebBookmarkType?: string;
  Title?: string;
  URLString?: string;
  URIDictionary?: {
    title?: string;
  };
  Children?: SafariRawBookmarkNode[];
}

export function parseSafariBookmarksTree(root: SafariRawBookmarkNode): UnifiedBookmark[] {
  const results: UnifiedBookmark[] = [];

  function walk(node: SafariRawBookmarkNode, path: string[]) {
    if (node.WebBookmarkType === 'WebBookmarkTypeLeaf' && node.URLString) {
      const title = node.URIDictionary?.title || node.Title || 'Untitled';
      results.push({
        id: `safari-bm-${Math.random().toString(36).substring(2, 9)}`,
        title,
        url: node.URLString,
        dateAdded: Date.now(),
        folderPath: [...path],
        selected: true
      });
    } else if (node.WebBookmarkType === 'WebBookmarkTypeList' && node.Children) {
      const folderName = node.Title;
      const nextPath = folderName && folderName !== 'BookmarksBar' && folderName !== 'BookmarksMenu'
        ? [...path, folderName]
        : folderName === 'BookmarksBar'
          ? ['Favorites']
          : path;

      for (const child of node.Children) {
        walk(child, nextPath);
      }
    }
  }

  walk(root, []);
  return results;
}

export function parseSafariHistoryRows(rows: Array<{
  id: number | string;
  url: string;
  title?: string;
  visit_time: number;
  visit_count?: number;
}>): UnifiedHistoryItem[] {
  return rows.map(r => ({
    id: `safari-hist-${r.id}`,
    url: r.url,
    title: r.title || r.url,
    visitCount: Number(r.visit_count) || 1,
    lastVisitTime: cocoaTimeToUnixMs(Number(r.visit_time)),
    selected: true
  }));
}
