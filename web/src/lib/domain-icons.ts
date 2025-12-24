/**
 * Domain bazlı icon/favicon yönetimi
 * Her domain için farklı icon dosyası belirleyebilirsiniz
 * 
 * Kullanım:
 * 1. Her domain için icon dosyasını web/public/ klasörüne ekleyin
 *    - icon-domain2.png
 *    - icon-domain3.png
 *    - favicon-domain2.ico
 *    - favicon-domain3.ico
 * 2. Aşağıdaki mapping'e domain'lerinizi ekleyin
 */

export function getDomainIcon(hostname: string): string {
  // Domain bazlı icon mapping - Tüm ReloopCycle domainleri
  const domainIcons: Record<string, string> = {
    'reloopcycle.co.uk': '/icon.png',
    'reloopcycle.com': '/icon.png',
    'reloopcycle.net': '/icon.png',
    'reloopcycle.org': '/icon.png',
    'www.reloopcycle.co.uk': '/icon.png',
    'www.reloopcycle.com': '/icon.png',
    'www.reloopcycle.net': '/icon.png',
    'www.reloopcycle.org': '/icon.png',
  };

  return domainIcons[hostname] || '/icon.png';
}

export function getDomainFavicon(hostname: string): string {
  // Domain bazlı favicon mapping - Tüm ReloopCycle domainleri
  // .ico formatını kullanıyoruz (Google için gerekli)
  // Next.js App Router'da app/favicon.ico otomatik olarak /favicon.ico olarak sunulur
  const domainFavicons: Record<string, string> = {
    'reloopcycle.co.uk': '/favicon.ico',
    'reloopcycle.com': '/favicon.ico',
    'reloopcycle.net': '/favicon.ico',
    'reloopcycle.org': '/favicon.ico',
    'www.reloopcycle.co.uk': '/favicon.ico',
    'www.reloopcycle.com': '/favicon.ico',
    'www.reloopcycle.net': '/favicon.ico',
    'www.reloopcycle.org': '/favicon.ico',
  };

  return domainFavicons[hostname] || '/favicon.ico';
}

/**
 * Site URL'den hostname'i al
 */
export function getHostnameFromSiteUrl(siteUrl: string): string {
  try {
    const url = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
    return new URL(url).hostname;
  } catch {
    return 'reloopcycle.co.uk'; // Default
  }
}

