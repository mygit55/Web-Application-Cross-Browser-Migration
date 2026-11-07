import { UnifiedBookmark, UnifiedHistoryItem, UnifiedCredential } from '../types/migration';

export function normalizeUrl(rawUrl: string, stripTrackingParams = true): string {
  if (!rawUrl) return '';
  try {
    const parsed = new URL(rawUrl.trim());
    parsed.hostname = parsed.hostname.toLowerCase();
    
    if ((parsed.protocol === 'http:' && parsed.port === '80') ||
        (parsed.protocol === 'https:' && parsed.port === '443')) {
      parsed.port = '';
    }

    if (stripTrackingParams && parsed.search) {
      const trackingKeys = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'fbclid', 'gclid', 'msclkid', 'mc_eid', '_hsenc', '_hsmi', 'ref'
      ];
      trackingKeys.forEach(key => parsed.searchParams.delete(key));
    }

    let finalUrl = parsed.toString();
    if (finalUrl.endsWith('/') && parsed.pathname.length > 1) {
      finalUrl = finalUrl.slice(0, -1);
    }
    return finalUrl;
  } catch {
    return rawUrl.trim();
  }
}

export function deduplicateBookmarks(bookmarks: UnifiedBookmark[]): UnifiedBookmark[] {
  const seen = new Set<string>();
  const result: UnifiedBookmark[] = [];

  for (const b of bookmarks) {
    const normUrl = normalizeUrl(b.url);
    const key = `${b.folderPath.join('/')}|${normUrl}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({
        ...b,
        url: normUrl || b.url
      });
    }
  }

  return result;
}

export function deduplicateHistory(items: UnifiedHistoryItem[]): UnifiedHistoryItem[] {
  const map = new Map<string, UnifiedHistoryItem>();

  for (const item of items) {
    const normUrl = normalizeUrl(item.url);
    if (!normUrl) continue;

    if (map.has(normUrl)) {
      const existing = map.get(normUrl)!;
      existing.visitCount += item.visitCount || 1;
      if (item.lastVisitTime > existing.lastVisitTime) {
        existing.lastVisitTime = item.lastVisitTime;
        if (item.title && (!existing.title || item.title.length > existing.title.length)) {
          existing.title = item.title;
        }
      }
      if (item.visits && item.visits.length > 0) {
        existing.visits = [...(existing.visits || []), ...item.visits];
      }
    } else {
      map.set(normUrl, {
        ...item,
        url: normUrl,
        visitCount: Math.max(1, item.visitCount || 1)
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.lastVisitTime - a.lastVisitTime);
}

export function deduplicateCredentials(creds: UnifiedCredential[]): UnifiedCredential[] {
  const map = new Map<string, UnifiedCredential>();

  for (const cred of creds) {
    const normOrigin = normalizeUrl(cred.originUrl);
    const user = cred.username.trim().toLowerCase();
    const key = `${normOrigin}|${user}`;

    if (!map.has(key)) {
      map.set(key, cred);
    } else {
      const existing = map.get(key)!;
      if ((cred.dateCreated || 0) > (existing.dateCreated || 0)) {
        map.set(key, cred);
      }
    }
  }

  return Array.from(map.values());
}
