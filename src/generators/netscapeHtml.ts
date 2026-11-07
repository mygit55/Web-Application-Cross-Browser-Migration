import { UnifiedBookmark } from '../types/migration';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateNetscapeBookmarkHtml(bookmarks: UnifiedBookmark[], title = 'Bookmarks'): string {
  interface FolderTreeNode {
    name: string;
    subfolders: Map<string, FolderTreeNode>;
    bookmarks: UnifiedBookmark[];
  }

  const root: FolderTreeNode = {
    name: 'root',
    subfolders: new Map(),
    bookmarks: []
  };

  for (const bm of bookmarks) {
    if (bm.selected === false) continue;

    let curr = root;
    for (const folder of bm.folderPath) {
      if (!curr.subfolders.has(folder)) {
        curr.subfolders.set(folder, {
          name: folder,
          subfolders: new Map(),
          bookmarks: []
        });
      }
      curr = curr.subfolders.get(folder)!;
    }
    curr.bookmarks.push(bm);
  }

  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>${escapeHtml(title)}</TITLE>
<H1>${escapeHtml(title)}</H1>
<DL><p>
`;

  function renderTree(node: FolderTreeNode, indentLevel = 1): string {
    const indent = '    '.repeat(indentLevel);
    let out = '';

    for (const bm of node.bookmarks) {
      const addDate = Math.floor((bm.dateAdded || Date.now()) / 1000);
      out += `${indent}<DT><A HREF="${escapeHtml(bm.url)}" ADD_DATE="${addDate}">${escapeHtml(bm.title || bm.url)}</A>\n`;
    }

    for (const [subName, subNode] of node.subfolders.entries()) {
      const nowSec = Math.floor(Date.now() / 1000);
      out += `${indent}<DT><H3 ADD_DATE="${nowSec}" LAST_MODIFIED="${nowSec}">${escapeHtml(subName)}</H3>\n`;
      out += `${indent}<DL><p>\n`;
      out += renderTree(subNode, indentLevel + 1);
      out += `${indent}</DL><p>\n`;
    }

    return out;
  }

  html += renderTree(root, 1);
  html += `</DL><p>\n`;

  return html;
}

export function parseNetscapeBookmarkHtml(htmlContent: string): UnifiedBookmark[] {
  const results: UnifiedBookmark[] = [];
  const lines = htmlContent.split(/\r?\n/);
  const folderStack: string[] = [];

  for (let line of lines) {
    line = line.trim();

    const h3Match = line.match(/<H3[^>]*>(.*?)<\/H3>/i);
    if (h3Match) {
      const folderName = h3Match[1].replace(/<[^>]+>/g, '').trim();
      folderStack.push(folderName);
      continue;
    }

    if (line.includes('</DL>')) {
      if (folderStack.length > 0) folderStack.pop();
      continue;
    }

    const aMatch = line.match(/<A\s+([^>]*HREF=["']([^"']+)["'][^>]*)>(.*?)<\/A>/i);
    if (aMatch) {
      const fullAttrs = aMatch[1];
      const url = aMatch[2];
      const rawTitle = aMatch[3].replace(/<[^>]+>/g, '').trim();

      let addDate = Date.now();
      const dateMatch = fullAttrs.match(/ADD_DATE=["'](\d+)["']/i);
      if (dateMatch) {
        addDate = parseInt(dateMatch[1], 10) * 1000;
      }

      results.push({
        id: `imported-bm-${Math.random().toString(36).substring(2, 9)}`,
        title: rawTitle || url,
        url,
        dateAdded: addDate,
        folderPath: [...folderStack],
        selected: true
      });
    }
  }

  return results;
}
