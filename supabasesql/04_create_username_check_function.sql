-- ============================================
-- KULLANICI ADI KONTROL FONKSİYONU
-- ============================================
-- Bu fonksiyon kullanıcı adının müsait olup olmadığını kontrol eder
-- AuthModal ve AuthContext tarafından kullanılır

CREATE OR REPLACE FUNCTION public.is_username_available(p_username TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE LOWER(username) = LOWER(p_username)
  );
$$;

-- Fonksiyon izinleri
REVOKE ALL ON FUNCTION public.is_username_available(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_username_available(TEXT) TO anon, authenticated;

-- ============================================
-- SON
-- ============================================
-- Bu fonksiyon kayıt sırasında kullanıcı adı kontrolü için gereklidir
-- Eğer bu fonksiyon yoksa "Kullanıcı adı kontrol edilirken bir hata oluştu" hatası alırsınız

