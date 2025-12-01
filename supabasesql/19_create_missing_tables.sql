-- ============================================
-- CREATE MISSING TABLES
-- ============================================
-- Bu dosya eksik tabloları oluşturur ve RLS politikalarını ekler

-- ============================================
-- 1. USER_CREDIT_ACCOUNTS
-- ============================================
CREATE TABLE IF NOT EXISTS user_credit_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0 NOT NULL,
  total_earned INTEGER DEFAULT 0 NOT NULL,
  total_spent INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_accounts_user_id ON user_credit_accounts(user_id);

-- RLS
ALTER TABLE user_credit_accounts ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "Users can view their own credit account" ON user_credit_accounts;
DROP POLICY IF EXISTS "Users can update their own credit account" ON user_credit_accounts;
DROP POLICY IF EXISTS "Users can insert their own credit account" ON user_credit_accounts;

CREATE POLICY "Users can view their own credit account" ON user_credit_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit account" ON user_credit_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credit account" ON user_credit_accounts
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 2. CREDIT_TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  source_type TEXT,
  source_id TEXT,
  description TEXT,
  balance_after INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- RLS
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "Users can view their own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "System can insert transactions" ON credit_transactions;

CREATE POLICY "Users can view their own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Authenticated kullanıcılar kendi transaction'larını ekleyebilir
CREATE POLICY "Users can insert their own transactions" ON credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. USER_BADGE_PROGRESS
-- ============================================
CREATE TABLE IF NOT EXISTS user_badge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  target INTEGER DEFAULT 0,
  metadata JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_key)
);

CREATE INDEX IF NOT EXISTS idx_badge_progress_user_id ON user_badge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_badge_progress_badge_key ON user_badge_progress(badge_key);

-- RLS
ALTER TABLE user_badge_progress ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "Users can view their own badge progress" ON user_badge_progress;
DROP POLICY IF EXISTS "Users can upsert their own badge progress" ON user_badge_progress;

CREATE POLICY "Users can view their own badge progress" ON user_badge_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badge progress" ON user_badge_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own badge progress" ON user_badge_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 4. TASKS (Opsiyonel - badge sistemi için)
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL,
  credit_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_repeatable BOOLEAN DEFAULT false,
  cooldown_hours INTEGER DEFAULT 0,
  requirements JSONB,
  icon TEXT,
  color TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_is_active ON tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_tasks_order_index ON tasks(order_index);

-- RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "Everyone can view active tasks" ON tasks;

CREATE POLICY "Everyone can view active tasks" ON tasks
  FOR SELECT USING (is_active = true);

-- ============================================
-- 5. USER_TASK_PROGRESS (Opsiyonel)
-- ============================================
CREATE TABLE IF NOT EXISTS user_task_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

CREATE INDEX IF NOT EXISTS idx_task_progress_user_id ON user_task_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_task_progress_task_id ON user_task_progress(task_id);

-- RLS
ALTER TABLE user_task_progress ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "Users can view their own task progress" ON user_task_progress;
DROP POLICY IF EXISTS "Users can update their own task progress" ON user_task_progress;

CREATE POLICY "Users can view their own task progress" ON user_task_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own task progress" ON user_task_progress
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 6. NOTIFICATIONS (Opsiyonel - basit versiyon)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- Service role will insert

-- ============================================
-- 7. COMMENTS VIEW (listing_comments için alias)
-- ============================================
-- Not: PostgreSQL'de view oluşturabiliriz ama Supabase REST API view'ları desteklemiyor
-- Bu yüzden kodda 'comments' yerine 'listing_comments' kullanılmalı
-- Ama yine de bir view oluşturalım (opsiyonel)

CREATE OR REPLACE VIEW comments AS
SELECT 
  id,
  listing_id,
  user_id,
  content,
  parent_id,
  is_approved,
  created_at,
  updated_at
FROM listing_comments;

-- View için RLS (view'lar RLS desteklemez, ama yine de ekleyelim)
-- Not: View'lar için RLS çalışmaz, bu yüzden kodda direkt 'listing_comments' kullanılmalı

-- ============================================
-- 8. TRIGGERS
-- ============================================

-- user_credit_accounts updated_at trigger
DROP TRIGGER IF EXISTS update_credit_accounts_updated_at ON user_credit_accounts;
CREATE TRIGGER update_credit_accounts_updated_at
  BEFORE UPDATE ON user_credit_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- tasks updated_at trigger
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. FIX LISTING_FAVORITES RLS
-- ============================================
-- listing_favorites için daha geniş SELECT politikası
-- Herkes favorileri görebilir (sadece listing_id ve user_id bilgisi için)

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "Users can view their own favorites" ON listing_favorites;
DROP POLICY IF EXISTS "Everyone can view favorites" ON listing_favorites;
DROP POLICY IF EXISTS "Users can create favorites" ON listing_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON listing_favorites;

-- Herkes favorileri görebilir (public data)
CREATE POLICY "Everyone can view favorites" ON listing_favorites
  FOR SELECT USING (true);

-- Kullanıcılar kendi favorilerini ekleyebilir
CREATE POLICY "Users can create favorites" ON listing_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi favorilerini silebilir
CREATE POLICY "Users can delete their own favorites" ON listing_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SON
-- ============================================
-- Tüm eksik tablolar oluşturuldu:
-- ✅ user_credit_accounts
-- ✅ credit_transactions
-- ✅ user_badge_progress
-- ✅ tasks
-- ✅ user_task_progress
-- ✅ notifications
-- ✅ comments view (listing_comments için alias)
-- ✅ listing_favorites RLS düzeltildi

