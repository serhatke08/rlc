# Multi-Domain SEO Yapılandırması

Bu proje 4 domain için optimize edilmiştir:
- **reloopcycle.co.uk** (Ana domain)
- **reloopcycle.com**
- **reloopcycle.net**
- **reloopcycle.org**

## Nasıl Çalışıyor?

### 1. Sitemap (sitemap.xml)

Her domain için otomatik olarak doğru URL'lerle sitemap oluşturulur:

- `https://reloopcycle.co.uk/sitemap.xml` → reloopcycle.co.uk için sitemap
- `https://reloopcycle.com/sitemap.xml` → reloopcycle.com için sitemap
- `https://reloopcycle.net/sitemap.xml` → reloopcycle.net için sitemap
- `https://reloopcycle.org/sitemap.xml` → reloopcycle.org için sitemap

**Özellikler:**
- Request header'larından domain otomatik algılanır
- Her domain için doğru base URL kullanılır
- Tüm aktif listing'ler sitemap'e dahil edilir
- Static sayfalar (about, contact, vb.) dahil edilir

### 2. Robots.txt

Her domain için otomatik olarak doğru sitemap URL'i ile robots.txt oluşturulur:

- `https://reloopcycle.co.uk/robots.txt` → reloopcycle.co.uk için robots.txt
- `https://reloopcycle.com/robots.txt` → reloopcycle.com için robots.txt
- `https://reloopcycle.net/robots.txt` → reloopcycle.net için robots.txt
- `https://reloopcycle.org/robots.txt` → reloopcycle.org için robots.txt

**İçerik:**
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /auth/
Disallow: /account
Disallow: /messages
Disallow: /admin/

Sitemap: https://[domain]/sitemap.xml
```

### 3. Favicon

Her domain için aynı favicon gösterilir (tüm domainler aynı brand'i kullanıyor):
- `/favicon.png` - Ana favicon
- `/icon.png` - Icon dosyası

## Vercel Deployment

### Her Domain İçin Ayrı Deployment (Önerilen)

1. **Vercel'de 4 ayrı project oluşturun:**
   - Project 1: reloopcycle.co.uk
   - Project 2: reloopcycle.com
   - Project 3: reloopcycle.net
   - Project 4: reloopcycle.org

2. **Her project için domain ekleyin:**
   - Vercel Dashboard > Project Settings > Domains
   - İlgili domain'i ekleyin

3. **Environment Variables:**
   Her project için `NEXT_PUBLIC_SITE_URL` ayarlayın (opsiyonel):
   - Project 1: `NEXT_PUBLIC_SITE_URL=https://reloopcycle.co.uk`
   - Project 2: `NEXT_PUBLIC_SITE_URL=https://reloopcycle.com`
   - Project 3: `NEXT_PUBLIC_SITE_URL=https://reloopcycle.net`
   - Project 4: `NEXT_PUBLIC_SITE_URL=https://reloopcycle.org`

### Tek Deployment'ta Tüm Domainler (Alternatif)

Eğer tüm domainleri tek bir Vercel project'inde kullanıyorsanız:
- Vercel otomatik olarak request header'larından domain'i algılar
- Her domain için doğru sitemap ve robots.txt otomatik oluşturulur
- Ekstra yapılandırma gerekmez

## Google Search Console Kurulumu

Her domain için ayrı ayrı Google Search Console'a ekleyin:

1. **reloopcycle.co.uk için:**
   - Google Search Console'a ekleyin
   - Sitemap gönderin: `https://reloopcycle.co.uk/sitemap.xml`
   - Robots.txt'yi kontrol edin: `https://reloopcycle.co.uk/robots.txt`

2. **reloopcycle.com için:**
   - Google Search Console'a ekleyin
   - Sitemap gönderin: `https://reloopcycle.com/sitemap.xml`
   - Robots.txt'yi kontrol edin: `https://reloopcycle.com/robots.txt`

3. **reloopcycle.net için:**
   - Google Search Console'a ekleyin
   - Sitemap gönderin: `https://reloopcycle.net/sitemap.xml`
   - Robots.txt'yi kontrol edin: `https://reloopcycle.net/robots.txt`

4. **reloopcycle.org için:**
   - Google Search Console'a ekleyin
   - Sitemap gönderin: `https://reloopcycle.org/sitemap.xml`
   - Robots.txt'yi kontrol edin: `https://reloopcycle.org/robots.txt`

## Test Etme

### Sitemap Testi

Her domain için sitemap'i test edin:

```bash
# reloopcycle.co.uk
curl https://reloopcycle.co.uk/sitemap.xml

# reloopcycle.com
curl https://reloopcycle.com/sitemap.xml

# reloopcycle.net
curl https://reloopcycle.net/sitemap.xml

# reloopcycle.org
curl https://reloopcycle.org/sitemap.xml
```

Her sitemap'te URL'lerin doğru domain'i kullandığını kontrol edin.

### Robots.txt Testi

Her domain için robots.txt'yi test edin:

```bash
# reloopcycle.co.uk
curl https://reloopcycle.co.uk/robots.txt

# reloopcycle.com
curl https://reloopcycle.com/robots.txt

# reloopcycle.net
curl https://reloopcycle.net/robots.txt

# reloopcycle.org
curl https://reloopcycle.org/robots.txt
```

Her robots.txt'de sitemap URL'inin doğru domain'i gösterdiğini kontrol edin.

## Teknik Detaylar

### Domain Algılama

Domain algılama şu sırayla yapılır:

1. **Request Header'ları** (`host` veya `x-forwarded-host`)
   - Vercel otomatik olarak doğru domain'i sağlar
   - Production'da her zaman çalışır

2. **Environment Variable** (`NEXT_PUBLIC_SITE_URL`)
   - Manuel olarak ayarlanabilir
   - Preview deployment'lar için kullanılabilir

3. **Vercel URL** (`VERCEL_URL`)
   - Preview deployment'lar için
   - Custom domain yoksa vercel.app URL'i

4. **Fallback**
   - Development: `http://localhost:3000`
   - Production: `https://reloopcycle.co.uk`

### Dynamic Rendering

Sitemap ve robots.txt `force-dynamic` olarak işaretlenmiştir:
- Her request'te yeniden oluşturulur
- Request header'larından domain algılanır
- Her domain için doğru URL'ler kullanılır

## Sorun Giderme

### Sitemap yanlış domain gösteriyor

1. Vercel deployment log'larını kontrol edin
2. `NEXT_PUBLIC_SITE_URL` environment variable'ını kontrol edin
3. Request header'larını kontrol edin (Vercel otomatik sağlar)

### Robots.txt yanlış sitemap URL'i gösteriyor

1. Sitemap'in doğru domain'de çalıştığını kontrol edin
2. Robots.txt'nin aynı domain'den servis edildiğini kontrol edin
3. Cache'i temizleyin (Vercel otomatik cache yönetir)

### Google sitemap'i bulamıyor

1. Sitemap URL'ini doğrudan tarayıcıda test edin
2. Google Search Console'da sitemap'i manuel olarak gönderin
3. Sitemap'in XML formatında olduğunu kontrol edin
4. Robots.txt'de sitemap URL'inin doğru olduğunu kontrol edin

