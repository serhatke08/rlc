-- ============================================
-- NOTIFICATIONS SİSTEMİ
-- ============================================
-- Kullanıcı bildirimleri için tablo

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('feedback_reply', 'message', 'listing_update', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- ============================================
-- FEEDBACK REPLIES TABLOSU
-- ============================================
-- Admin'lerin feedback'lere verdiği cevaplar

CREATE TABLE IF NOT EXISTS public.feedback_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES public.feedback(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reply_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_feedback_replies_feedback_id ON public.feedback_replies(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_replies_admin_id ON public.feedback_replies(admin_id);
CREATE INDEX IF NOT EXISTS idx_feedback_replies_created_at ON public.feedback_replies(created_at DESC);

-- ============================================
-- TRIGGER: FEEDBACK REPLY OLUNCA BİLDİRİM OLUŞTUR
-- ============================================

CREATE OR REPLACE FUNCTION create_feedback_reply_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  feedback_user_id UUID;
  feedback_subject TEXT;
BEGIN
  -- Feedback'in user_id'sini al
  SELECT user_id INTO feedback_user_id
  FROM public.feedback
  WHERE id = NEW.feedback_id;
  
  -- Feedback'in subject'ini al
  SELECT subject INTO feedback_subject
  FROM public.feedback
  WHERE id = NEW.feedback_id;
  
  -- Eğer feedback'in sahibi varsa bildirim oluştur
  IF feedback_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      link
    ) VALUES (
      feedback_user_id,
      'feedback_reply',
      'Geri Bildiriminize Cevap',
      'Geri bildiriminize (' || feedback_subject || ') cevap verildi.',
      '/account/feedback'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_create_feedback_reply_notification
  AFTER INSERT ON public.feedback_replies
  FOR EACH ROW
  EXECUTE FUNCTION create_feedback_reply_notification();

-- ============================================
-- TRIGGER: FEEDBACK OLUŞUNCA ADMIN'E BİLDİRİM
-- ============================================
-- Not: Admin kullanıcıları için özel bir role veya flag gerekebilir
-- Şimdilik bu trigger'ı yorum satırına alıyoruz, admin kontrolü uygulama tarafında yapılacak

-- ============================================
-- RLS POLİTİKALARI
-- ============================================

-- Notifications RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi bildirimlerini görebilir
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Kullanıcılar kendi bildirimlerini güncelleyebilir (okundu işaretleme)
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Feedback Replies RLS
ALTER TABLE public.feedback_replies ENABLE ROW LEVEL SECURITY;

-- Herkes feedback reply'leri görebilir (admin kontrolü uygulama tarafında)
DROP POLICY IF EXISTS "feedback_replies_select" ON public.feedback_replies;
CREATE POLICY "feedback_replies_select"
  ON public.feedback_replies
  FOR SELECT
  TO authenticated
  USING (true);

-- Sadece authenticated kullanıcılar reply ekleyebilir (admin kontrolü uygulama tarafında)
DROP POLICY IF EXISTS "feedback_replies_insert" ON public.feedback_replies;
CREATE POLICY "feedback_replies_insert"
  ON public.feedback_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE public.notifications IS 'Kullanıcı bildirimleri';
COMMENT ON TABLE public.feedback_replies IS 'Admin feedback cevapları';
COMMENT ON COLUMN public.notifications.type IS 'feedback_reply, message, listing_update, system';

