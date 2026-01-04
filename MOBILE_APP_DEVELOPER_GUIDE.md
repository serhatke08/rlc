# Mobil Uygulama Geliştirici Rehberi - Email Confirmation Deep Link

Bu dokümantasyon, mobil uygulamada email confirmation deep link'lerini nasıl handle edeceğinizi açıklar.

## 📋 İçindekiler

1. [Supabase Dashboard Ayarları](#1-supabase-dashboard-ayarları)
2. [iOS Deep Link Yapılandırması](#2-ios-deep-link-yapılandırması)
3. [Android Deep Link Yapılandırması](#3-android-deep-link-yapılandırması)
4. [Mobil Uygulamada Kod İmplementasyonu](#4-mobil-uygulamada-kod-implementasyonu)
5. [Test Etme](#5-test-etme)

---

## 1. Supabase Dashboard Ayarları

### 1.1 URL Configuration

**Supabase Dashboard → Authentication → URL Configuration** sayfasında:

1. **Site URL**: 
   ```
   https://reloopcycle.co.uk
   ```

2. **Redirect URLs** (her satıra bir tane):
   ```
   https://reloopcycle.co.uk/auth/callback
   reloopcycle://auth/callback
   reloopcycle://auth/callback?*
   ```

   **ÖNEMLİ**: Deep link'ler için wildcard (`*`) kullanabilirsiniz, böylece query parametreleri de çalışır.

### 1.2 Email Templates

**Supabase Dashboard → Authentication → Email Templates → Confirm signup** sayfasında:

Email template'inde `{{ .ConfirmationURL }}` kullanılır. Bu otomatik olarak `emailRedirectTo` parametresindeki URL'i kullanır.

**Örnek email template:**
```
Click the link below to confirm your email:
{{ .ConfirmationURL }}
```

Bu template otomatik olarak:
- Web'den kayıt olanlar için: `https://reloopcycle.co.uk/auth/callback?token=xxx&type=signup`
- Mobil'den kayıt olanlar için: `reloopcycle://auth/callback?token=xxx&type=signup`

---

## 2. iOS Deep Link Yapılandırması

### 2.1 Info.plist Yapılandırması

`ios/YourApp/Info.plist` dosyasına aşağıdaki yapılandırmayı ekleyin:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLName</key>
        <string>com.reloopcycle.app</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>reloopcycle</string>
        </array>
    </dict>
</array>
```

### 2.2 AppDelegate.swift (SwiftUI) veya SceneDelegate.swift

**SwiftUI kullanıyorsanız:**

```swift
import SwiftUI
import Supabase

@main
struct YourApp: App {
    @StateObject private var authManager = AuthManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .onOpenURL { url in
                    handleDeepLink(url: url)
                }
        }
    }
    
    func handleDeepLink(url: URL) {
        // Deep link formatı: reloopcycle://auth/callback?token=xxx&type=signup
        guard url.scheme == "reloopcycle",
              url.host == "auth",
              url.pathComponents.contains("callback") else {
            return
        }
        
        // Query parametrelerini al
        let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        guard let queryItems = components?.queryItems else { return }
        
        let token = queryItems.first(where: { $0.name == "token" })?.value
        let type = queryItems.first(where: { $0.name == "type" })?.value
        
        if let token = token, let type = type {
            authManager.verifyEmail(token: token, type: type)
        }
    }
}
```

**UIKit kullanıyorsanız:**

```swift
// AppDelegate.swift
func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    handleDeepLink(url: url)
    return true
}

func handleDeepLink(url: URL) {
    guard url.scheme == "reloopcycle",
          url.host == "auth",
          url.pathComponents.contains("callback") else {
        return
    }
    
    let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
    guard let queryItems = components?.queryItems else { return }
    
    let token = queryItems.first(where: { $0.name == "token" })?.value
    let type = queryItems.first(where: { $0.name == "type" })?.value
    
    if let token = token, let type = type {
        // Supabase client ile token'ı doğrula
        verifyEmailToken(token: token, type: type)
    }
}
```

---

## 3. Android Deep Link Yapılandırması

### 3.1 AndroidManifest.xml Yapılandırması

`android/app/src/main/AndroidManifest.xml` dosyasına aşağıdaki yapılandırmayı ekleyin:

```xml
<activity
    android:name=".MainActivity"
    android:exported="true"
    android:launchMode="singleTop">
    
    <!-- Mevcut intent-filter'larınız -->
    
    <!-- Deep Link Intent Filter -->
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <!-- Deep link scheme -->
        <data
            android:scheme="reloopcycle"
            android:host="auth"
            android:pathPrefix="/callback" />
    </intent-filter>
</activity>
```

### 3.2 MainActivity.kt veya MainActivity.java

**Kotlin:**

```kotlin
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import io.flutter.embedding.android.FlutterActivity

class MainActivity: FlutterActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleDeepLink(intent)
    }
    
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleDeepLink(intent)
    }
    
    private fun handleDeepLink(intent: Intent?) {
        val data: Uri? = intent?.data
        if (data != null) {
            // Deep link formatı: reloopcycle://auth/callback?token=xxx&type=signup
            if (data.scheme == "reloopcycle" && 
                data.host == "auth" && 
                data.path?.contains("callback") == true) {
                
                val token = data.getQueryParameter("token")
                val type = data.getQueryParameter("type")
                
                if (token != null && type != null) {
                    // Flutter channel veya Supabase client ile token'ı doğrula
                    verifyEmailToken(token, type)
                }
            }
        }
    }
    
    private fun verifyEmailToken(token: String, type: String) {
        // Supabase client ile token doğrulama
        // Flutter kullanıyorsanız MethodChannel ile Flutter tarafına gönderin
    }
}
```

**Java:**

```java
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import io.flutter.embedding.android.FlutterActivity;

public class MainActivity extends FlutterActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleDeepLink(getIntent());
    }
    
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleDeepLink(intent);
    }
    
    private void handleDeepLink(Intent intent) {
        Uri data = intent.getData();
        if (data != null) {
            if ("reloopcycle".equals(data.getScheme()) && 
                "auth".equals(data.getHost()) && 
                data.getPath() != null && 
                data.getPath().contains("callback")) {
                
                String token = data.getQueryParameter("token");
                String type = data.getQueryParameter("type");
                
                if (token != null && type != null) {
                    verifyEmailToken(token, type);
                }
            }
        }
    }
    
    private void verifyEmailToken(String token, String type) {
        // Supabase client ile token doğrulama
    }
}
```

---

## 4. Mobil Uygulamada Kod İmplementasyonu

### 4.1 Supabase Client ile Token Doğrulama

**React Native / Expo:**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

// Deep link handler
export async function handleEmailConfirmation(token: string, type: string) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as 'signup' | 'email',
    });
    
    if (error) {
      console.error('Email confirmation error:', error);
      // Hata mesajını kullanıcıya göster
      return { success: false, error: error.message };
    }
    
    // Başarılı - kullanıcıyı ana sayfaya yönlendir
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
```

**Flutter:**

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

Future<Map<String, dynamic>> handleEmailConfirmation(
  String token,
  String type,
) async {
  try {
    final response = await Supabase.instance.client.auth.verifyOTP(
      token: token,
      type: type == 'signup' ? OtpType.signup : OtpType.email,
    );
    
    if (response.user != null) {
      return {
        'success': true,
        'user': response.user,
      };
    } else {
      return {
        'success': false,
        'error': 'User not found',
      };
    }
  } catch (e) {
    return {
      'success': false,
      'error': e.toString(),
    };
  }
}
```

**Native iOS (Swift):**

```swift
import Supabase

func verifyEmailToken(token: String, type: String) async {
    let supabase = SupabaseClient(
        supabaseURL: URL(string: "YOUR_SUPABASE_URL")!,
        supabaseKey: "YOUR_SUPABASE_ANON_KEY"
    )
    
    do {
        let otpType: OtpType = type == "signup" ? .signup : .email
        let response = try await supabase.auth.verifyOTP(
            token: token,
            type: otpType
        )
        
        // Başarılı - kullanıcıyı ana sayfaya yönlendir
        DispatchQueue.main.async {
            // Navigate to home screen
        }
    } catch {
        print("Email confirmation error: \(error)")
        // Hata mesajını kullanıcıya göster
    }
}
```

**Native Android (Kotlin):**

```kotlin
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.verifyOtp

suspend fun verifyEmailToken(token: String, type: String) {
    val supabase = createSupabaseClient(
        supabaseUrl = "YOUR_SUPABASE_URL",
        supabaseKey = "YOUR_SUPABASE_ANON_KEY"
    )
    
    try {
        val otpType = if (type == "signup") OtpType.SIGNUP else OtpType.EMAIL
        val response = supabase.auth.verifyOtp(
            token = token,
            type = otpType
        )
        
        // Başarılı - kullanıcıyı ana sayfaya yönlendir
        // Navigate to home screen
    } catch (e: Exception) {
        println("Email confirmation error: ${e.message}")
        // Hata mesajını kullanıcıya göster
    }
}
```

### 4.2 Deep Link Handler Entegrasyonu

**React Native / Expo:**

```typescript
import * as Linking from 'expo-linking';
import { useEffect } from 'react';

export function useDeepLinking() {
  useEffect(() => {
    // Uygulama açıkken gelen deep link'leri handle et
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    // Uygulama kapalıyken açılan deep link'i kontrol et
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, []);
}

function handleDeepLink({ url }: { url: string }) {
  const parsedUrl = new URL(url);
  
  if (parsedUrl.protocol === 'reloopcycle:' && 
      parsedUrl.hostname === 'auth' && 
      parsedUrl.pathname.includes('callback')) {
    
    const token = parsedUrl.searchParams.get('token');
    const type = parsedUrl.searchParams.get('type');
    
    if (token && type) {
      handleEmailConfirmation(token, type);
    }
  }
}
```

**Flutter:**

```dart
import 'package:uni_links/uni_links.dart';
import 'dart:async';

class DeepLinkService {
  StreamSubscription? _linkSubscription;
  
  void initDeepLinks() {
    // Uygulama açıkken gelen deep link'leri handle et
    _linkSubscription = linkStream.listen(
      (String? link) {
        if (link != null) {
          handleDeepLink(link);
        }
      },
      onError: (err) {
        print('Deep link error: $err');
      },
    );
    
    // Uygulama kapalıyken açılan deep link'i kontrol et
    getInitialLink().then((String? link) {
      if (link != null) {
        handleDeepLink(link);
      }
    });
  }
  
  void handleDeepLink(String url) {
    final uri = Uri.parse(url);
    
    if (uri.scheme == 'reloopcycle' && 
        uri.host == 'auth' && 
        uri.path.contains('callback')) {
      
      final token = uri.queryParameters['token'];
      final type = uri.queryParameters['type'];
      
      if (token != null && type != null) {
        handleEmailConfirmation(token, type);
      }
    }
  }
  
  void dispose() {
    _linkSubscription?.cancel();
  }
}
```

---

## 5. Test Etme

### 5.1 Web'den Test

1. Web sitesinden kayıt ol: `https://reloopcycle.co.uk/auth/register`
2. Email'deki confirmation link'ine tıkla
3. `/auth/callback` sayfası açılmalı ve `/account` sayfasına yönlendirmeli

### 5.2 Mobil'den Test

#### iOS Simulator/Device:

1. **Terminal'de test:**
   ```bash
   xcrun simctl openurl booted "reloopcycle://auth/callback?token=TEST_TOKEN&type=signup"
   ```

2. **Safari'den test:**
   - Safari'de `reloopcycle://auth/callback?token=TEST_TOKEN&type=signup` yaz
   - Uygulama açılmalı

#### Android Emulator/Device:

1. **ADB ile test:**
   ```bash
   adb shell am start -a android.intent.action.VIEW -d "reloopcycle://auth/callback?token=TEST_TOKEN&type=signup"
   ```

2. **Chrome'dan test:**
   - Chrome'da `reloopcycle://auth/callback?token=TEST_TOKEN&type=signup` yaz
   - Uygulama açılmalı

### 5.3 Gerçek Email Test

1. Mobil uygulamadan kayıt ol (veya `?source=app` parametresi ile web'den)
2. Email'deki confirmation link'ine tıkla
3. Mobil uygulama açılmalı ve email doğrulanmalı

---

## 🔧 Sorun Giderme

### Deep link çalışmıyor

1. **Supabase Dashboard'da Redirect URL kontrolü:**
   - `reloopcycle://auth/callback` ekli mi?
   - Wildcard (`*`) kullanıldı mı?

2. **Platform yapılandırması:**
   - iOS: `Info.plist` doğru mu?
   - Android: `AndroidManifest.xml` doğru mu?

3. **Token doğrulama:**
   - Token geçerli mi?
   - Token süresi dolmuş mu? (genellikle 1 saat)

### Email'deki link web sayfası açıyor

- `emailRedirectTo` parametresi doğru mu?
- Mobil uygulamadan kayıt olurken `?source=app` parametresi var mı?

---

## 📝 Özet Checklist

- [ ] Supabase Dashboard'da Redirect URL'ler eklendi
- [ ] iOS `Info.plist` yapılandırıldı
- [ ] Android `AndroidManifest.xml` yapılandırıldı
- [ ] Deep link handler implementasyonu yapıldı
- [ ] Supabase client ile token doğrulama yapıldı
- [ ] Test edildi (simulator/emulator)
- [ ] Test edildi (gerçek cihaz)
- [ ] Test edildi (gerçek email)

---

## 📞 Destek

Sorun yaşarsanız:
1. Supabase Dashboard loglarını kontrol edin
2. Mobil uygulama loglarını kontrol edin
3. Deep link URL formatını kontrol edin
4. Token'ın geçerliliğini kontrol edin

