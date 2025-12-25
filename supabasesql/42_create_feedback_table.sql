-- ============================================
-- FEEDBACK / GERİ BİLDİRİM TABLOSU
-- ============================================
-- Kullanıcıların geri bildirim, sorun bildirme ve önerilerini kaydetmek için

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('feedback', 'bug_report', 'feature_request', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON public.feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- Updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_feedback_updated_at
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();

-- RLS Politikaları
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Herkes feedback gönderebilir (anon)
DROP POLICY IF EXISTS "feedback_insert_anon" ON public.feedback;
CREATE POLICY "feedback_insert_anon"
  ON public.feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Kullanıcılar sadece kendi feedback'lerini görebilir
DROP POLICY IF EXISTS "feedback_select_own" ON public.feedback;
CREATE POLICY "feedback_select_own"
  ON public.feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin'ler tüm feedback'leri görebilir (service_role kullanılacak)
-- Bu policy'yi manuel olarak admin rolü için ayarlayabilirsiniz

-- Comments
COMMENT ON TABLE public.feedback IS 'Kullanıcı geri bildirimleri, sorun bildirimleri ve önerileri';
COMMENT ON COLUMN public.feedback.type IS 'feedback, bug_report, feature_request, other';
COMMENT ON COLUMN public.feedback.status IS 'pending, reviewed, resolved, closed';

