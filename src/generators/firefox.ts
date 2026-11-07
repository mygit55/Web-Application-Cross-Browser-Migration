import { UnifiedBookmark } from '../types/migration';
import { unixMsToFirefoxPrTime } from '../utils/timestamps';

interface FirefoxBookmarkJsonNode {
  guid: string;
  title: string;
  index: number;
  dateAdded: number;
  lastModified: number;
  id: number;
  typeCode: number;
  type: string;
  uri?: string;
  root?: string;
  children?: FirefoxBookmarkJsonNode[];
}

function generateFirefoxGuid(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateFirefoxBookmarksBackupJson(bookmarks: UnifiedBookmark[]): string {
  let nextId = 100;
  const nowPrTime = unixMsToFirefoxPrTime(Date.now());

  interface FolderMap {
    title: string;
    subfolders: Map<string, FolderMap>;
    bookmarks: UnifiedBookmark[];
  }

  const toolbarFolder: FolderMap = {
    title: 'Bookmarks Toolbar',
    subfolders: new Map(),
    bookmarks: []
  };

  const menuFolder: FolderMap = {
    title: 'Bookmarks Menu',
    subfolders: new Map(),
    bookmarks: []
  };

  for (const bm of bookmarks) {
    if (bm.selected === false) continue;
    const path = bm.folderPath || [];
    const isMenu = path[0]?.toLowerCase().includes('menu') || path[0]?.toLowerCase().includes('other');
    const target = isMenu ? menuFolder : toolbarFolder;

    const subPath = path.length > 0 && (path[0].toLowerCase().includes('bar') || path[0].toLowerCase().includes('favorite') || path[0].toLowerCase().includes('toolbar') || path[0].toLowerCase().includes('menu'))
      ? path.slice(1)
      : path;

    let curr = target;
    for (const folder of subPath) {
      if (!curr.subfolders.has(folder)) {
        curr.subfolders.set(folder, {
          title: folder,
          subfolders: new Map(),
          bookmarks: []
        });
      }
      curr = curr.subfolders.get(folder)!;
    }
    curr.bookmarks.push(bm);
  }

  function serializeFolder(f: FolderMap, index: number, rootKey?: string): FirefoxBookmarkJsonNode {
    const children: FirefoxBookmarkJsonNode[] = [];
    let childIndex = 0;

    for (const sub of f.subfolders.values()) {
      children.push(serializeFolder(sub, childIndex++));
    }

    for (const bm of f.bookmarks) {
      const added = unixMsToFirefoxPrTime(bm.dateAdded || Date.now());
      children.push({
        guid: generateFirefoxGuid(),
        title: bm.title || bm.url,
        index: childIndex++,
        dateAdded: added,
        lastModified: added,
        id: nextId++,
        typeCode: 1,
        type: 'text/x-moz-place',
        uri: bm.url
      });
    }

    const node: FirefoxBookmarkJsonNode = {
      guid: generateFirefoxGuid(),
      title: f.title,
      index,
      dateAdded: nowPrTime,
      lastModified: nowPrTime,
      id: nextId++,
      typeCode: 2,
      type: 'text/x-moz-place-container',
      children
    };

    if (rootKey) node.root = rootKey;
    return node;
  }

  const rootNode: FirefoxBookmarkJsonNode = {
    guid: 'root________',
    title: '',
    index: 0,
    dateAdded: nowPrTime,
    lastModified: nowPrTime,
    id: 1,
    typeCode: 2,
    type: 'text/x-moz-place-container',
    root: 'placesRoot',
    children: [
      serializeFolder(menuFolder, 0, 'bookmarksMenuFolder'),
      serializeFolder(toolbarFolder, 1, 'toolbarFolder')
    ]
  };

  return JSON.stringify(rootNode, null, 2);
}
