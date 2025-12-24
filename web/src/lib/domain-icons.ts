/**
 * Domain-based icon/favicon management
 * You can specify different icon files for each domain
 * 
 * Usage:
 * 1. Add icon files for each domain to web/public/ folder
 *    - icon-domain2.png
 *    - icon-domain3.png
 *    - favicon-domain2.ico
 *    - favicon-domain3.ico
 * 2. Add your domains to the mapping below
 */

export function getDomainIcon(hostname: string): string {
  // Domain-based icon mapping - All ReloopCycle domains
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
  // Domain-based favicon mapping - All ReloopCycle domains
  // We use .ico format (required for Google)
  // In Next.js App Router, app/favicon.ico is automatically served as /favicon.ico
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
 * Extract hostname from site URL
 */
export function getHostnameFromSiteUrl(siteUrl: string): string {
  try {
    const url = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
    return new URL(url).hostname;
  } catch {
    return 'reloopcycle.co.uk'; // Default
  }
}

