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
  // PNG formatını kullanıyoruz (modern tarayıcılar destekliyor)
  // Google aramalarında da görünecek
  const domainFavicons: Record<string, string> = {
    'reloopcycle.co.uk': '/favicon.png',
    'reloopcycle.com': '/favicon.png',
    'reloopcycle.net': '/favicon.png',
    'reloopcycle.org': '/favicon.png',
    'www.reloopcycle.co.uk': '/favicon.png',
    'www.reloopcycle.com': '/favicon.png',
    'www.reloopcycle.net': '/favicon.png',
    'www.reloopcycle.org': '/favicon.png',
  };

  return domainFavicons[hostname] || '/favicon.png';
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

