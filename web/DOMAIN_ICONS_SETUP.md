# Domain Bazlı Icon/Favicon Kurulumu

Bu proje, farklı domainler için farklı icon ve favicon'lar gösterebilir.

## Kurulum Adımları

### 1. Icon Dosyalarını Hazırlayın

Her domain için icon dosyalarınızı hazırlayın:
- **32x32 px** - Küçük icon (favicon)
- **192x192 px** - Orta boy icon
- **180x180 px** - Apple touch icon

### 2. Dosyaları Public Klasörüne Ekleyin

Icon dosyalarınızı `web/public/` klasörüne ekleyin:

```
web/public/
  ├── icon.png                    # Ana domain (reloopcycle.co.uk)
  ├── favicon.ico                 # Ana domain favicon
  ├── icon-domain2.png            # İkinci domain icon
  ├── favicon-domain2.ico         # İkinci domain favicon
  ├── icon-domain3.png            # Üçüncü domain icon
  └── favicon-domain3.ico         # Üçüncü domain favicon
```

### 3. Domain Mapping'i Güncelleyin

`web/src/lib/domain-icons.ts` dosyasını açın ve domain'lerinizi ekleyin:

```typescript
export function getDomainIcon(hostname: string): string {
  const domainIcons: Record<string, string> = {
    'reloopcycle.co.uk': '/icon.png',        // Ana domain
    'domain2.com': '/icon-domain2.png',     // İkinci domain
    'domain3.com': '/icon-domain3.png',     // Üçüncü domain
  };

  return domainIcons[hostname] || '/icon.png';
}

export function getDomainFavicon(hostname: string): string {
  const domainFavicons: Record<string, string> = {
    'reloopcycle.co.uk': '/favicon.ico',        // Ana domain
    'domain2.com': '/favicon-domain2.ico',      // İkinci domain
    'domain3.com': '/favicon-domain3.ico',      // Üçüncü domain
  };

  return domainFavicons[hostname] || '/favicon.ico';
}
```

### 4. Environment Variables

Her domain için Vercel'de environment variable ayarlayın:

- **Domain 1**: `NEXT_PUBLIC_SITE_URL=https://reloopcycle.co.uk`
- **Domain 2**: `NEXT_PUBLIC_SITE_URL=https://domain2.com`
- **Domain 3**: `NEXT_PUBLIC_SITE_URL=https://domain3.com`

Veya Vercel otomatik olarak domain'i algılar.

## Test Etme

1. Her domain'i ziyaret edin
2. Browser tab'ında icon'un doğru göründüğünü kontrol edin
3. F12 > Network > favicon.ico veya icon.png isteklerini kontrol edin

## Notlar

- Icon dosyaları `web/public/` klasöründe olmalı
- Dosya isimleri mapping'deki path'lerle eşleşmeli
- Her domain için ayrı deployment yapıyorsanız, her deployment'da doğru `NEXT_PUBLIC_SITE_URL` ayarlanmalı
- Icon'lar otomatik olarak cache'lenir, değişikliklerin görünmesi için hard refresh (Ctrl+Shift+R) gerekebilir

