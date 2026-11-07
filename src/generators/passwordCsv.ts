import { UnifiedCredential } from '../types/migration';

function escapeCsvCell(cell: string): string {
  if (cell == null) return '';
  const str = String(cell);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generatePasswordCsv(credentials: UnifiedCredential[]): string {
  const headers = ['name', 'url', 'username', 'password', 'note'];
  const rows: string[] = [headers.join(',')];

  for (const cred of credentials) {
    if (cred.selected === false) continue;

    let domainName = cred.originUrl;
    try {
      const u = new URL(cred.originUrl);
      domainName = u.hostname;
    } catch {
      // Ignored
    }

    const row = [
      escapeCsvCell(domainName),
      escapeCsvCell(cred.originUrl),
      escapeCsvCell(cred.username),
      escapeCsvCell(cred.password),
      escapeCsvCell(cred.realm ? `Realm: ${cred.realm}` : '')
    ];
    rows.push(row.join(','));
  }

  return rows.join('\r\n');
}
