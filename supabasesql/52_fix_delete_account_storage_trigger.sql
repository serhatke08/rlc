-- Supabase now rejects DELETE FROM storage.objects.
-- The old delete_user_account() RPC and profiles BEFORE DELETE trigger
-- both used that path, so every account deletion failed with 42501.
-- Storage files are removed via the Storage API in the web app instead.

CREATE OR REPLACE FUNCTION public.delete_user_storage_on_profile_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Kullanıcı giriş yapmamış';
  END IF;

  UPDATE public.listing_reports
  SET reviewed_by = NULL
  WHERE reviewed_by = current_user_id;

  DELETE FROM public.profiles WHERE id = current_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
