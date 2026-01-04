# Supabase Email Redirect Yapılandırması

Bu dokümantasyon, Supabase Dashboard'da yapılması gereken email confirmation redirect ayarlarını açıklar.

## 📋 Adım Adım Yapılandırma

### 1. Supabase Dashboard'a Giriş

1. [Supabase Dashboard](https://app.supabase.com) → Projenizi seçin
2. Sol menüden **Authentication** → **URL Configuration** seçin

### 2. Site URL Ayarları

**Site URL** alanına:
```
https://reloopcycle.co.uk
```

### 3. Redirect URLs Ayarları

**Redirect URLs** alanına (her satıra bir tane ekleyin):

```
https://reloopcycle.co.uk/auth/callback
reloopcycle://auth/callback
reloopcycle://auth/callback?*
```

**ÖNEMLİ NOTLAR:**
- Deep link'ler için wildcard (`*`) kullanarak query parametrelerini de kabul edebilirsiniz
- Her URL'i ayrı satıra yazın
- **Save** butonuna tıklayın

### 4. Email Template Kontrolü

1. **Authentication** → **Email Templates** → **Confirm signup** seçin

2. Email template'inizde `{{ .ConfirmationURL }}` kullanıldığından emin olun:

**Örnek Template:**
```
Hi there,

Thanks for signing up! Please confirm your email address by clicking the link below:

{{ .ConfirmationURL }}

If you didn't sign up, you can safely ignore this email.

Thanks,
ReloopCycle Team
```

**ÖNEMLİ:** `{{ .ConfirmationURL }}` otomatik olarak:
- Web'den kayıt olanlar için: `https://reloopcycle.co.uk/auth/callback?token=xxx&type=signup`
- Mobil'den kayıt olanlar için: `reloopcycle://auth/callback?token=xxx&type=signup`

şeklinde oluşturulur.

### 5. Email Template Özelleştirme (Opsiyonel)

Email template'inizi özelleştirebilirsiniz:

**Kullanılabilir Değişkenler:**
- `{{ .ConfirmationURL }}` - Confirmation link URL'i
- `{{ .Email }}` - Kullanıcının email adresi
- `{{ .SiteURL }}` - Site URL'i
- `{{ .Token }}` - Confirmation token (genellikle kullanılmaz, URL'de zaten var)

**Örnek Özelleştirilmiş Template:**
```
Welcome to ReloopCycle!

Hi {{ .Email }},

Thank you for joining our circular economy community! 

Please confirm your email address by clicking the button below:

[Confirm Email]({{ .ConfirmationURL }})

Or copy and paste this link into your browser:
{{ .ConfirmationURL }}

If you didn't create an account, you can safely ignore this email.

Best regards,
The ReloopCycle Team
```

### 6. Test Email Gönderimi

1. **Authentication** → **Email Templates** → **Confirm signup** sayfasında
2. **Send test email** butonuna tıklayın
3. Test email adresinizi girin
4. Email'i kontrol edin - link doğru formatta olmalı

## 🔍 Kontrol Listesi

Yapılandırmayı tamamladıktan sonra kontrol edin:

- [ ] Site URL doğru mu? (`https://reloopcycle.co.uk`)
- [ ] Web redirect URL eklendi mi? (`https://reloopcycle.co.uk/auth/callback`)
- [ ] Mobil deep link eklendi mi? (`reloopcycle://auth/callback`)
- [ ] Wildcard eklendi mi? (`reloopcycle://auth/callback?*`)
- [ ] Email template'de `{{ .ConfirmationURL }}` var mı?
- [ ] Test email gönderildi ve link çalışıyor mu?

## ⚠️ Önemli Notlar

1. **Redirect URL'ler güvenlik için önemlidir**
   - Sadece güvendiğiniz domain'leri ekleyin
   - Deep link scheme'lerini doğru yazın

2. **Email template değişiklikleri**
   - Template'i değiştirdikten sonra **Save** butonuna tıklayın
   - Değişiklikler hemen aktif olur

3. **Token süresi**
   - Email confirmation token'ları genellikle 1 saat geçerlidir
   - Süresi dolmuş token'lar için kullanıcıya yeni email göndermesi söylenebilir

4. **Multiple domains**
   - Eğer birden fazla domain kullanıyorsanız (reloopcycle.co.uk, reloopcycle.com, vb.)
   - Her domain için ayrı redirect URL ekleyin:
     ```
     https://reloopcycle.co.uk/auth/callback
     https://reloopcycle.com/auth/callback
     https://reloopcycle.net/auth/callback
     https://reloopcycle.org/auth/callback
     ```

## 🐛 Sorun Giderme

### Email'deki link çalışmıyor

1. **Redirect URL kontrolü:**
   - Supabase Dashboard'da Redirect URLs listesinde var mı?
   - URL formatı doğru mu? (https:// veya reloopcycle://)

2. **Token kontrolü:**
   - Token süresi dolmuş olabilir (1 saat)
   - Token zaten kullanılmış olabilir

3. **Email template kontrolü:**
   - `{{ .ConfirmationURL }}` kullanılıyor mu?
   - Template kaydedildi mi?

### Deep link mobil uygulamada açılmıyor

1. **Supabase Dashboard:**
   - `reloopcycle://auth/callback` redirect URL listesinde var mı?

2. **Mobil uygulama:**
   - Deep link yapılandırması doğru mu? (iOS Info.plist, Android AndroidManifest.xml)
   - Deep link handler implementasyonu var mı?

## 📞 Destek

Sorun yaşarsanız:
1. Supabase Dashboard → Logs → Auth logs kontrol edin
2. Email template'i test edin
3. Redirect URL'leri tekrar kontrol edin

