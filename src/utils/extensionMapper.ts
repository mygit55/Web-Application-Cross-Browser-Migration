import { UnifiedExtension, BrowserType } from '../types/migration';

export interface ExtensionCatalogItem {
  name: string;
  category: string;
  chromeId?: string;
  firefoxSlug?: string;
  edgeId?: string;
  description: string;
}

export const POPULAR_EXTENSIONS_CATALOG: ExtensionCatalogItem[] = [
  {
    name: 'uBlock Origin',
    category: 'Privacy & Security',
    chromeId: 'cjpalhdlnbpafiamejdnhcphjbkeiagm',
    firefoxSlug: 'ublock-origin',
    edgeId: 'odfafepnkmbhccpbejgmiehpchacaeak',
    description: 'An efficient wide-spectrum content blocker that is easy on memory and CPU.'
  },
  {
    name: 'Bitwarden Password Manager',
    category: 'Security',
    chromeId: 'nngceckbapebfimnlniiiahkandclblb',
    firefoxSlug: 'bitwarden-password-manager',
    edgeId: 'jbkfoedolllekgbhcbcoahefnbanhhlh',
    description: 'A secure, free password manager for all of your devices.'
  },
  {
    name: '1Password',
    category: 'Security',
    chromeId: 'aeblfdkhhhdcdjpifhhbdiojplfjncoa',
    firefoxSlug: '1password-x-password-manager',
    edgeId: 'dppgmdbiimibapkepcbapmkaabgioikl',
    description: 'Password manager and secure digital wallet.'
  },
  {
    name: 'Dark Reader',
    category: 'Accessibility',
    chromeId: 'eimadpbcbfnmbkopoojfekhnkhdbieeh',
    firefoxSlug: 'darkreader',
    edgeId: 'ifoakfbiohcjnaannngifbpalgpndpem',
    description: 'Dark mode for every website. Invert brightness and contrast.'
  },
  {
    name: 'Privacy Badger',
    category: 'Privacy & Security',
    chromeId: 'pkehgijcmpdhfbdbbnkijodmdjhbjlgp',
    firefoxSlug: 'privacy-badger17',
    edgeId: 'mkejgcgkdlddbggfdjjdipbipfoaejip',
    description: 'Automatically learns to block invisible trackers by EFF.'
  },
  {
    name: 'Tampermonkey',
    category: 'Productivity',
    chromeId: 'dhdgffkkebhmkfjojejmpbldmpobfkfo',
    firefoxSlug: 'tampermonkey',
    edgeId: 'iikmkjmpaadaobahmlepeloendndfphd',
    description: 'The world\'s most popular userscript manager.'
  },
  {
    name: 'React Developer Tools',
    category: 'Developer Tools',
    chromeId: 'fmkadmapgofadopljbjfkapdkoienihi',
    firefoxSlug: 'react-devtools',
    edgeId: 'gpphkfbcpidddadnkolkpfckpihlkkil',
    description: 'Inspect React component hierarchies, props, and state in DevTools.'
  },
  {
    name: 'Vimium',
    category: 'Productivity',
    chromeId: 'dbepggeogbaibhgnhhndojpepiihcmeb',
    firefoxSlug: 'vimium-ff',
    edgeId: 'ambfnakkhdoughfogbhbhnnfdpecfljd',
    description: 'The Hacker\'s Browser. Keyboard-based navigation inspired by Vim.'
  },
  {
    name: 'Return YouTube Dislike',
    category: 'Multimedia',
    chromeId: 'gebbhagfogifgggkldgodflihgfeippi',
    firefoxSlug: 'return-youtube-dislikes',
    edgeId: 'khncfooichgheidiknnflgmfddegndgg',
    description: 'Restores the ability to see dislikes on YouTube.'
  },
  {
    name: 'SponsorBlock for YouTube',
    category: 'Multimedia',
    chromeId: 'mnjggcdmjocbbbhaepdhchncahnbgone',
    firefoxSlug: 'sponsorblock',
    edgeId: 'mbmgnlahfepoooiglhifahkcfnkigbpm',
    description: 'Skip sponsorship segments, intros, outros, and subscribe reminders on YouTube.'
  }
];

export function resolveExtensionStoreUrl(item: ExtensionCatalogItem | UnifiedExtension, targetBrowser: BrowserType): string | undefined {
  if (targetBrowser === 'chrome' || targetBrowser === 'brave' || targetBrowser === 'arc' || targetBrowser === 'opera') {
    const chromeId = 'chromeStoreId' in item ? item.chromeStoreId : item.chromeId;
    if (chromeId) return `https://chromewebstore.google.com/detail/${chromeId}`;
  } else if (targetBrowser === 'firefox') {
    const slug = 'firefoxAmoSlug' in item ? item.firefoxAmoSlug : item.firefoxSlug;
    if (slug) return `https://addons.mozilla.org/en-US/firefox/addon/${slug}/`;
  } else if (targetBrowser === 'edge') {
    const edgeId = 'edgeStoreId' in item ? item.edgeStoreId : item.edgeId;
    if (edgeId) return `https://microsoftedge.microsoft.com/addons/detail/${edgeId}`;
  }
  return undefined;
}
