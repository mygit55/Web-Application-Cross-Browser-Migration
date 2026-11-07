import test from 'node:test';
import assert from 'node:assert';

const CHROMIUM_EPOCH_OFFSET_US = 11644473600000000n;
const COCOA_EPOCH_OFFSET_SEC = 978307200;

function chromiumTimeToUnixMs(chromiumUs) {
  const usBig = BigInt(chromiumUs);
  if (usBig <= 0n) return 0;
  return Number((usBig - CHROMIUM_EPOCH_OFFSET_US) / 1000n);
}

function unixMsToChromiumTime(unixMs) {
  return (BigInt(Math.floor(unixMs)) * 1000n + CHROMIUM_EPOCH_OFFSET_US).toString();
}

function cocoaTimeToUnixMs(cocoaSec) {
  return Math.round((cocoaSec + COCOA_EPOCH_OFFSET_SEC) * 1000);
}

function unixMsToCocoaTime(unixMs) {
  return (unixMs / 1000) - COCOA_EPOCH_OFFSET_SEC;
}

test('Chromium timestamp round-trip conversion', () => {
  const nowMs = Date.now();
  const chromeTimeStr = unixMsToChromiumTime(nowMs);
  const backToMs = chromiumTimeToUnixMs(chromeTimeStr);
  assert.strictEqual(Math.abs(backToMs - nowMs) < 2, true);
});

test('Safari Cocoa timestamp round-trip conversion', () => {
  const nowMs = 1700000000000;
  const cocoaSec = unixMsToCocoaTime(nowMs);
  const backToMs = cocoaTimeToUnixMs(cocoaSec);
  assert.strictEqual(backToMs, nowMs);
});

test('Netscape HTML Bookmark format structure', () => {
  const sampleBookmarks = [
    { title: 'Google', url: 'https://google.com', folderPath: ['Search Engines'], dateAdded: 1600000000000 },
    { title: 'GitHub', url: 'https://github.com', folderPath: ['Dev', 'Git'], dateAdded: 1600000000000 }
  ];

  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<TITLE>Bookmarks</TITLE>\n<H1>Bookmarks</H1>\n<DL><p>\n`;
  for (const b of sampleBookmarks) {
    html += `<DT><A HREF="${b.url}">${b.title}</A>\n`;
  }
  html += `</DL><p>\n`;

  assert.strictEqual(html.includes('<!DOCTYPE NETSCAPE-Bookmark-file-1>'), true);
  assert.strictEqual(html.includes('https://google.com'), true);
  assert.strictEqual(html.includes('https://github.com'), true);
});

test('URL normalization & tracking parameter removal', () => {
  const raw = 'https://example.com/page/?utm_source=twitter&utm_medium=social&valid_param=123';
  const parsed = new URL(raw);
  parsed.searchParams.delete('utm_source');
  parsed.searchParams.delete('utm_medium');
  assert.strictEqual(parsed.toString(), 'https://example.com/page/?valid_param=123');
});
