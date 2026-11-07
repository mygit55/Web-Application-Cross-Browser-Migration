import { UnifiedBookmark } from '../types/migration';
import { unixMsToChromiumTime } from '../utils/timestamps';

interface ChromiumNodeOut {
  date_added: string;
  date_last_used?: string;
  date_modified?: string;
  id: string;
  name: string;
  type: 'url' | 'folder';
  url?: string;
  children?: ChromiumNodeOut[];
}

export function generateChromiumBookmarksJson(bookmarks: UnifiedBookmark[]): string {
  let nextId = 1;
  const nowUs = unixMsToChromiumTime(Date.now());

  interface FolderMapNode {
    id: string;
    name: string;
    date_added: string;
    date_modified: string;
    subfolders: Map<string, FolderMapNode>;
    bookmarks: UnifiedBookmark[];
  }

  const bookmarkBar: FolderMapNode = {
    id: String(nextId++),
    name: 'Bookmarks bar',
    date_added: nowUs,
    date_modified: nowUs,
    subfolders: new Map(),
    bookmarks: []
  };

  const otherBookmarks: FolderMapNode = {
    id: String(nextId++),
    name: 'Other bookmarks',
    date_added: nowUs,
    date_modified: nowUs,
    subfolders: new Map(),
    bookmarks: []
  };

  for (const bm of bookmarks) {
    if (bm.selected === false) continue;

    const path = bm.folderPath || [];
    const isOther = path[0]?.toLowerCase().includes('other');
    let targetRoot = isOther ? otherBookmarks : bookmarkBar;
    
    const subPath = (path.length > 0 && (path[0].toLowerCase().includes('bar') || path[0].toLowerCase().includes('favorite') || path[0].toLowerCase().includes('other')))
      ? path.slice(1)
      : path;

    let curr = targetRoot;
    for (const folder of subPath) {
      if (!curr.subfolders.has(folder)) {
        curr.subfolders.set(folder, {
          id: String(nextId++),
          name: folder,
          date_added: nowUs,
          date_modified: nowUs,
          subfolders: new Map(),
          bookmarks: []
        });
      }
      curr = curr.subfolders.get(folder)!;
    }
    curr.bookmarks.push(bm);
  }

  function serializeFolder(f: FolderMapNode): ChromiumNodeOut {
    const children: ChromiumNodeOut[] = [];

    for (const sub of f.subfolders.values()) {
      children.push(serializeFolder(sub));
    }

    for (const bm of f.bookmarks) {
      children.push({
        date_added: unixMsToChromiumTime(bm.dateAdded || Date.now()),
        date_last_used: '0',
        id: String(nextId++),
        name: bm.title || bm.url,
        type: 'url',
        url: bm.url
      });
    }

    return {
      date_added: f.date_added,
      date_modified: f.date_modified,
      id: f.id,
      name: f.name,
      type: 'folder',
      children
    };
  }

  const rootStructure = {
    checksum: '',
    roots: {
      bookmark_bar: serializeFolder(bookmarkBar),
      other: serializeFolder(otherBookmarks),
      synced: {
        children: [],
        date_added: nowUs,
        date_modified: nowUs,
        id: String(nextId++),
        name: 'Mobile bookmarks',
        type: 'folder'
      }
    },
    version: 1
  };

  return JSON.stringify(rootStructure, null, 2);
}
