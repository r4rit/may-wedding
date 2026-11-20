-- =============================================================================
-- May Wedding Guestbook Schema, RLS Policies, and Security Definer RPCs
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- =============================================================================

-- 1. pgcrypto 확장 활성화 (Supabase extensions 스키마)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. guestbook 테이블 생성
CREATE TABLE IF NOT EXISTS public.guestbook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL CHECK (char_length(trim(author_name)) BETWEEN 1 AND 20),
  message TEXT NOT NULL CHECK (char_length(trim(message)) BETWEEN 1 AND 300),
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 최신순 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_guestbook_created_at_desc
  ON public.guestbook (created_at DESC);

-- 3. RLS 활성화 및 최소 권한 원칙 적용
ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.guestbook FROM anon, authenticated;

-- pin_hash를 제외한 공개 컬럼만 SELECT 허용
GRANT SELECT (id, author_name, message, created_at)
  ON public.guestbook TO anon, authenticated;

-- 공개 읽기 정책 (INSERT/UPDATE/DELETE 정책은 의도적으로 미생성하여 직접 변경 차단)
CREATE POLICY "guestbook_public_read"
  ON public.guestbook
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 4. 방명록 등록 RPC (4자리 숫자 PIN 검증 + bcrypt 해싱)
CREATE OR REPLACE FUNCTION public.add_guestbook_entry(
  p_author_name TEXT,
  p_message TEXT,
  p_pin TEXT
)
RETURNS TABLE (
  id UUID,
  author_name TEXT,
  message TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_name TEXT := trim(p_author_name);
  v_msg  TEXT := trim(p_message);
BEGIN
  IF v_name IS NULL OR char_length(v_name) < 1 OR char_length(v_name) > 20 THEN
    RAISE EXCEPTION '작성자 이름은 1~20자 이내로 입력해 주세요.';
  END IF;

  IF v_msg IS NULL OR char_length(v_msg) < 1 OR char_length(v_msg) > 300 THEN
    RAISE EXCEPTION '축하 메시지는 1~300자 이내로 입력해 주세요.';
  END IF;

  IF p_pin IS NULL OR p_pin !~ '^[0-9]{4}$' THEN
    RAISE EXCEPTION '비밀번호는 숫자 4자리로 입력해 주세요.';
  END IF;

  RETURN QUERY
  INSERT INTO public.guestbook (author_name, message, pin_hash)
  VALUES (v_name, v_msg, crypt(p_pin, gen_salt('bf')))
  RETURNING
    public.guestbook.id,
    public.guestbook.author_name,
    public.guestbook.message,
    public.guestbook.created_at;
END;
$$;

-- 5. 방명록 삭제 RPC (4자리 PIN 일치 시 삭제)
CREATE OR REPLACE FUNCTION public.delete_guestbook_entry(
  p_id UUID,
  p_pin TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  IF p_pin IS NULL OR p_pin !~ '^[0-9]{4}$' THEN
    RETURN FALSE;
  END IF;

  DELETE FROM public.guestbook
  WHERE public.guestbook.id = p_id
    AND public.guestbook.pin_hash = crypt(p_pin, public.guestbook.pin_hash);

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count > 0;
END;
$$;

-- 6. RPC 실행 권한 부여
REVOKE ALL ON FUNCTION public.add_guestbook_entry(TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_guestbook_entry(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_guestbook_entry(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_guestbook_entry(UUID, TEXT) TO anon, authenticated;
