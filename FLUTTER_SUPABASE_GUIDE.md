# Flutter - Supabase Ürün Çekme Rehberi

## 📦 1. SUPABASE CLIENT KURULUMU

### pubspec.yaml
```yaml
dependencies:
  supabase_flutter: ^2.0.0
```

### main.dart - Initialization
```dart
import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Supabase.initialize(
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
  );
  
  runApp(MyApp());
}
```

---

## 🗄️ 2. TABLO YAPISI

### Ana Tablo: `listings`
```dart
// Foreign Keys:
- country_id → countries.id
- region_id → regions.id  
- city_id → cities.id
- category_id → product_categories.id
- subcategory_id → product_subcategories.id
```

### İlişkili Tablolar:
- `countries` (id, name, code, flag_emoji)
- `regions` (id, name, code, country_id)
- `cities` (id, name, is_major, region_id, country_id)
- `product_categories` (id, name, slug, icon)
- `product_subcategories` (id, name, slug, category_id)

---

## 📥 3. TEMEL ÜRÜN ÇEKME (TÜM ÜRÜNLER)

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

Future<List<Map<String, dynamic>>> getListings() async {
  final supabase = Supabase.instance.client;
  
  final response = await supabase
    .from('listings')
    .select('''
      id,
      title,
      description,
      price,
      currency,
      condition,
      listing_type,
      status,
      images,
      thumbnail_url,
      city_name,
      district_name,
      view_count,
      comment_count,
      created_at,
      category_id,
      subcategory_id,
      country_id,
      region_id,
      city_id,
      country:countries(name, code, flag_emoji),
      region:regions(name, code),
      city:cities(name, is_major),
      category:product_categories(id, name, slug),
      subcategory:product_subcategories(id, name, slug)
    ''')
    .eq('status', 'active')  // Sadece aktif ilanlar
    .order('is_featured', ascending: false)  // Önce featured
    .order('created_at', ascending: false)  // Sonra en yeni
    .limit(50);
  
  return List<Map<String, dynamic>>.from(response);
}
```

---

## 🌍 4. ÜLKE FİLTRELEME

### A) Kullanıcının Ülkesine Göre Filtreleme

```dart
// 1. Önce kullanıcının ülkesini çek
Future<String?> getUserCountryId() async {
  final supabase = Supabase.instance.client;
  final userId = supabase.auth.currentUser?.id;
  
  if (userId == null) return null;
  
  final response = await supabase
    .from('profiles')
    .select('country_id')
    .eq('id', userId)
    .single();
  
  return response['country_id'] as String?;
}

// 2. O ülkeye göre ürünleri çek
Future<List<Map<String, dynamic>>> getListingsByUserCountry() async {
  final supabase = Supabase.instance.client;
  final countryId = await getUserCountryId();
  
  if (countryId == null) {
    return getListings(); // Ülke yoksa tümünü getir
  }
  
  final response = await supabase
    .from('listings')
    .select('''
      *,
      country:countries(name, code, flag_emoji),
      region:regions(name, code),
      city:cities(name, is_major),
      category:product_categories(name),
      subcategory:product_subcategories(name)
    ''')
    .eq('status', 'active')
    .eq('country_id', countryId)  // ⭐ ÜLKE FİLTRESİ
    .order('created_at', ascending: false)
    .limit(50);
  
  return List<Map<String, dynamic>>.from(response);
}
```

### B) Belirli Bir Ülkeye Göre Filtreleme

```dart
Future<List<Map<String, dynamic>>> getListingsByCountry(String countryCode) async {
  final supabase = Supabase.instance.client;
  
  // Önce country_id'yi bul
  final countryResponse = await supabase
    .from('countries')
    .select('id')
    .eq('code', countryCode)  // 'GB' = United Kingdom
    .single();
  
  final countryId = countryResponse['id'] as String;
  
  // O ülkeye göre ürünleri çek
  final response = await supabase
    .from('listings')
    .select('''
      *,
      country:countries(name, code, flag_emoji),
      region:regions(name, code),
      city:cities(name, is_major)
    ''')
    .eq('status', 'active')
    .eq('country_id', countryId)  // ⭐ ÜLKE FİLTRESİ
    .order('created_at', ascending: false)
    .limit(50);
  
  return List<Map<String, dynamic>>.from(response);
}
```

---

## 🗺️ 5. BÖLGE (REGION) FİLTRELEME

```dart
Future<List<Map<String, dynamic>>> getListingsByRegion(String regionId) async {
  final supabase = Supabase.instance.client;
  
  final response = await supabase
    .from('listings')
    .select('''
      *,
      country:countries(name, code, flag_emoji),
      region:regions(name, code),
      city:cities(name, is_major)
    ''')
    .eq('status', 'active')
    .eq('region_id', regionId)  // ⭐ BÖLGE FİLTRESİ
    .order('created_at', ascending: false)
    .limit(50);
  
  return List<Map<String, dynamic>>.from(response);
}
```

---

## 🏙️ 6. ŞEHİR (CITY) FİLTRELEME

```dart
Future<List<Map<String, dynamic>>> getListingsByCity(String cityId) async {
  final supabase = Supabase.instance.client;
  
  final response = await supabase
    .from('listings')
    .select('''
      *,
      country:countries(name, code, flag_emoji),
      region:regions(name, code),
      city:cities(name, is_major)
    ''')
    .eq('status', 'active')
    .eq('city_id', cityId)  // ⭐ ŞEHİR FİLTRESİ
    .order('created_at', ascending: false)
    .limit(50);
  
  return List<Map<String, dynamic>>.from(response);
}
```

---

## 📂 7. KATEGORİ FİLTRELEME

```dart
Future<List<Map<String, dynamic>>> getListingsByCategory(String categoryId) async {
  final supabase = Supabase.instance.client;
  
  final response = await supabase
    .from('listings')
    .select('''
      *,
      country:countries(name, code, flag_emoji),
      region:regions(name, code),
      city:cities(name, is_major),
      category:product_categories(name, slug),
      subcategory:product_subcategories(name, slug)
    ''')
    .eq('status', 'active')
    .eq('category_id', categoryId)  // ⭐ KATEGORİ FİLTRESİ
    .order('created_at', ascending: false)
    .limit(50);
  
  return List<Map<String, dynamic>>.from(response);
}
```

---

## 🏷️ 8. LİSTİNG TYPE FİLTRELEME

```dart
Future<List<Map<String, dynamic>>> getListingsByType(String listingType) async {
  final supabase = Supabase.instance.client;
  
  // listing_type değerleri: 'free', 'exchange', 'sale', 'need', 'ownership'
  final response = await supabase
    .from('listings')
    .select('''
      *,
      country:countries(name, code, flag_emoji),
      region:regions(name, code),
      city:cities(name, is_major)
    ''')
    .eq('status', 'active')
    .eq('listing_type', listingType)  // ⭐ TİP FİLTRESİ
    .order('created_at', ascending: false)
    .limit(50);
  
  return List<Map<String, dynamic>>.from(response);
}

// Örnek kullanım:
// getListingsByType('free')      → Ücretsiz ürünler
// getListingsByType('exchange')  → Takas ürünleri
// getListingsByType('sale')      → Satılık ürünler
// getListingsByType('need')      → İhtiyaç ürünleri
// getListingsByType('ownership') → Sahiplendirme
```

---

## 🔍 9. ÇOKLU FİLTRELEME (KOMBİNE)

```dart
Future<List<Map<String, dynamic>>> getFilteredListings({
  String? countryId,
  String? regionId,
  String? cityId,
  String? categoryId,
  String? listingType,
  int limit = 50,
}) async {
  final supabase = Supabase.instance.client;
  
  var query = supabase
    .from('listings')
    .select('''
      *,
      country:countries(name, code, flag_emoji),
      region:regions(name, code),
      city:cities(name, is_major),
      category:product_categories(name, slug),
      subcategory:product_subcategories(name, slug)
    ''')
    .eq('status', 'active');
  
  // Filtreleri ekle
  if (countryId != null) {
    query = query.eq('country_id', countryId);
  }
  
  if (regionId != null) {
    query = query.eq('region_id', regionId);
  }
  
  if (cityId != null) {
    query = query.eq('city_id', cityId);
  }
  
  if (categoryId != null) {
    query = query.eq('category_id', categoryId);
  }
  
  if (listingType != null) {
    query = query.eq('listing_type', listingType);
  }
  
  final response = await query
    .order('is_featured', ascending: false)
    .order('created_at', ascending: false)
    .limit(limit);
  
  return List<Map<String, dynamic>>.from(response);
}

// Örnek kullanım:
final listings = await getFilteredListings(
  countryId: 'uk-country-id',
  categoryId: 'electronics-category-id',
  listingType: 'free',
  limit: 20,
);
```

---

## 📋 10. ÜLKE, BÖLGE, ŞEHİR LİSTELERİNİ ÇEKME

### Ülkeleri Çek
```dart
Future<List<Map<String, dynamic>>> getCountries() async {
  final supabase = Supabase.instance.client;
  
  final response = await supabase
    .from('countries')
    .select('id, name, code, flag_emoji')
    .order('name');
  
  return List<Map<String, dynamic>>.from(response);
}
```

### Bölgeleri Çek (Belirli Ülkeye Göre)
```dart
Future<List<Map<String, dynamic>>> getRegionsByCountry(String countryId) async {
  final supabase = Supabase.instance.client;
  
  final response = await supabase
    .from('regions')
    .select('id, name, code')
    .eq('country_id', countryId)
    .order('name');
  
  return List<Map<String, dynamic>>.from(response);
}
```

### Şehirleri Çek (Belirli Bölgeye Göre)
```dart
Future<List<Map<String, dynamic>>> getCitiesByRegion(String regionId) async {
  final supabase = Supabase.instance.client;
  
  final response = await supabase
    .from('cities')
    .select('id, name, is_major')
    .eq('region_id', regionId)
    .order('is_major', ascending: false)  // Önce büyük şehirler
    .order('name');
  
  return List<Map<String, dynamic>>.from(response);
}
```

### Kategorileri Çek
```dart
Future<List<Map<String, dynamic>>> getCategories() async {
  final supabase = Supabase.instance.client;
  
  final response = await supabase
    .from('product_categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('order_index')
    .order('name');
  
  return List<Map<String, dynamic>>.from(response);
}
```

### Alt Kategorileri Çek (Belirli Kategoriye Göre)
```dart
Future<List<Map<String, dynamic>>> getSubcategoriesByCategory(String categoryId) async {
  final supabase = Supabase.instance.client;
  
  final response = await supabase
    .from('product_subcategories')
    .select('id, name, slug')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('order_index')
    .order('name');
  
  return List<Map<String, dynamic>>.from(response);
}
```

---

## 🎯 11. ÖRNEK: TAM ÇALIŞAN SERVİS SINIFI

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

class ListingService {
  final _supabase = Supabase.instance.client;
  
  // Kullanıcının ülkesine göre ürünleri çek
  Future<List<Map<String, dynamic>>> getListingsForUser({
    String? regionId,
    String? cityId,
    String? categoryId,
    String? listingType,
  }) async {
    // Kullanıcının ülkesini al
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return [];
    
    final profile = await _supabase
      .from('profiles')
      .select('country_id')
      .eq('id', userId)
      .single();
    
    final countryId = profile['country_id'] as String?;
    if (countryId == null) return [];
    
    // Filtreli sorgu oluştur
    var query = _supabase
      .from('listings')
      .select('''
        id,
        title,
        description,
        price,
        currency,
        condition,
        listing_type,
        status,
        images,
        thumbnail_url,
        city_name,
        view_count,
        comment_count,
        created_at,
        country:countries(name, code, flag_emoji),
        region:regions(name, code),
        city:cities(name, is_major),
        category:product_categories(name, slug),
        subcategory:product_subcategories(name, slug)
      ''')
      .eq('status', 'active')
      .eq('country_id', countryId);  // Kullanıcının ülkesi
    
    // Ek filtreler
    if (regionId != null) {
      query = query.eq('region_id', regionId);
    }
    
    if (cityId != null) {
      query = query.eq('city_id', cityId);
    }
    
    if (categoryId != null) {
      query = query.eq('category_id', categoryId);
    }
    
    if (listingType != null) {
      query = query.eq('listing_type', listingType);
    }
    
    final response = await query
      .order('is_featured', ascending: false)
      .order('created_at', ascending: false)
      .limit(50);
    
    return List<Map<String, dynamic>>.from(response);
  }
  
  // Ülke listesi
  Future<List<Map<String, dynamic>>> getCountries() async {
    final response = await _supabase
      .from('countries')
      .select('id, name, code, flag_emoji')
      .order('name');
    
    return List<Map<String, dynamic>>.from(response);
  }
  
  // Bölge listesi (ülkeye göre)
  Future<List<Map<String, dynamic>>> getRegions(String countryId) async {
    final response = await _supabase
      .from('regions')
      .select('id, name, code')
      .eq('country_id', countryId)
      .order('name');
    
    return List<Map<String, dynamic>>.from(response);
  }
  
  // Şehir listesi (bölgeye göre)
  Future<List<Map<String, dynamic>>> getCities(String regionId) async {
    final response = await _supabase
      .from('cities')
      .select('id, name, is_major')
      .eq('region_id', regionId)
      .order('is_major', ascending: false)
      .order('name');
    
    return List<Map<String, dynamic>>.from(response);
  }
  
  // Kategori listesi
  Future<List<Map<String, dynamic>>> getCategories() async {
    final response = await _supabase
      .from('product_categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('order_index')
      .order('name');
    
    return List<Map<String, dynamic>>.from(response);
  }
}
```

---

## 📱 12. FLUTTER WIDGET ÖRNEĞİ

```dart
class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final _listingService = ListingService();
  List<Map<String, dynamic>> _listings = [];
  bool _loading = true;
  
  String? _selectedRegionId;
  String? _selectedCityId;
  String? _selectedCategoryId;
  String? _selectedListingType;
  
  @override
  void initState() {
    super.initState();
    _loadListings();
  }
  
  Future<void> _loadListings() async {
    setState(() => _loading = true);
    
    try {
      final listings = await _listingService.getListingsForUser(
        regionId: _selectedRegionId,
        cityId: _selectedCityId,
        categoryId: _selectedCategoryId,
        listingType: _selectedListingType,
      );
      
      setState(() {
        _listings = listings;
        _loading = false;
      });
    } catch (e) {
      print('Error loading listings: $e');
      setState(() => _loading = false);
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Listings')),
      body: _loading
        ? Center(child: CircularProgressIndicator())
        : RefreshIndicator(
            onRefresh: _loadListings,
            child: ListView.builder(
              itemCount: _listings.length,
              itemBuilder: (context, index) {
                final listing = _listings[index];
                return ListTile(
                  leading: listing['thumbnail_url'] != null
                    ? Image.network(listing['thumbnail_url'])
                    : Icon(Icons.image),
                  title: Text(listing['title']),
                  subtitle: Text(
                    '${listing['city']?['name'] ?? listing['city_name']} • '
                    '${listing['category']?['name'] ?? 'General'}'
                  ),
                  trailing: Text(
                    listing['listing_type'] == 'free' 
                      ? 'Free' 
                      : '£${listing['price']}'
                  ),
                );
              },
            ),
          ),
    );
  }
}
```

---

## 🔑 ÖNEMLİ NOTLAR

### 1. **Foreign Key İlişkileri**
- `listings.country_id` → `countries.id`
- `listings.region_id` → `regions.id`
- `listings.city_id` → `cities.id`
- `listings.category_id` → `product_categories.id`
- `listings.subcategory_id` → `product_subcategories.id`

### 2. **JOIN Sözdizimi (Supabase)**
```dart
.select('''
  *,
  country:countries(name, code, flag_emoji),
  region:regions(name, code),
  city:cities(name, is_major)
''')
```
- `country:countries(...)` → `country` alias'ı ile `countries` tablosunu JOIN et

### 3. **Filtreleme Sırası**
1. Önce `country_id` ile filtrele (en geniş)
2. Sonra `region_id` ile filtrele
3. Sonra `city_id` ile filtrele (en dar)
4. `category_id` ve `listing_type` her zaman eklenebilir

### 4. **Performance İpuçları**
- `limit()` kullan (pagination için)
- `order()` sıralamasını doğru yap
- `status = 'active'` filtresini her zaman ekle
- Index'lenmiş kolonları kullan (`country_id`, `region_id`, `city_id`)

---

## 🚀 HAZIR KOD ÖRNEKLERİ

### Senaryo 1: Kullanıcının Ülkesindeki Tüm Ürünler
```dart
final listings = await getListingsByUserCountry();
```

### Senaryo 2: UK'deki Free Ürünler
```dart
final ukCountry = await supabase
  .from('countries')
  .select('id')
  .eq('code', 'GB')
  .single();

final freeListings = await getFilteredListings(
  countryId: ukCountry['id'],
  listingType: 'free',
);
```

### Senaryo 3: London'daki Electronics
```dart
final london = await supabase
  .from('cities')
  .select('id')
  .eq('name', 'London')
  .single();

final electronics = await supabase
  .from('product_categories')
  .select('id')
  .eq('slug', 'electronics')
  .single();

final listings = await getFilteredListings(
  cityId: london['id'],
  categoryId: electronics['id'],
);
```

---

Bu rehber Flutter uygulaman için yeterli olmalı! 🎉

