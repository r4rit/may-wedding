import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface GuestbookEntry {
  id: string;
  author_name: string;
  message: string;
  created_at: string;
}

export interface FetchGuestbookResult {
  entries: GuestbookEntry[];
  totalCount: number;
  hasMore: boolean;
  isDemoMode: boolean;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

export const isSupabaseConfigured =
  /^https?:\/\//i.test(supabaseUrl) &&
  !supabaseUrl.includes('your-project-id') &&
  supabaseAnonKey.length > 0 &&
  !supabaseAnonKey.includes('your-supabase-anon-key');

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

const PIN_PATTERN = /^[0-9]{4}$/;

// 환경변수 미설정 시 앱 크래시를 방지하고 UI/삭제 흐름을 미리 확인할 수 있는 로컬 인메모리 폴백 저장소
let demoEntries: GuestbookEntry[] = [
  {
    id: 'demo-2',
    author_name: '지우',
    message:
      '따뜻한 오월의 햇살처럼 두 분의 앞날에도 늘 행복이 가득하기를 진심으로 축하드립니다.',
    created_at: '2026-11-19T15:20:00+09:00',
  },
  {
    id: 'demo-1',
    author_name: '현우',
    message:
      '오랜 시간 서로의 곁을 지켜온 두 사람의 새로운 시작을 축복합니다. 결혼 축하해요!',
    created_at: '2026-11-18T10:30:00+09:00',
  },
];

const demoPins = new Map<string, string>([
  ['demo-2', '1234'],
  ['demo-1', '1234'],
]);

function validateGuestbookInput(
  authorName: string,
  message: string,
  pin: string,
): { name: string; msg: string; pin: string } {
  const name = authorName.trim();
  const msg = message.trim();

  if (name.length < 1 || name.length > 20) {
    throw new Error('작성자 이름은 1~20자 이내로 입력해 주세요.');
  }

  if (msg.length < 1 || msg.length > 300) {
    throw new Error('축하 메시지는 1~300자 이내로 입력해 주세요.');
  }

  if (!PIN_PATTERN.test(pin)) {
    throw new Error('비밀번호는 숫자 4자리로 입력해 주세요.');
  }

  return { name, msg, pin };
}

export async function fetchGuestbookEntries(
  offset = 0,
  limit = 6,
): Promise<FetchGuestbookResult> {
  if (!supabase) {
    const sliced = demoEntries.slice(offset, offset + limit);
    return {
      entries: sliced,
      totalCount: demoEntries.length,
      hasMore: offset + sliced.length < demoEntries.length,
      isDemoMode: true,
    };
  }

  // 컬럼 단위 SELECT 권한 적용에 따라 pin_hash를 제외한 공개 컬럼만 명시적으로 조회
  const { data, error, count } = await supabase
    .from('guestbook')
    .select('id, author_name, message, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error('방명록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }

  const entries = (data ?? []) as GuestbookEntry[];
  const totalCount = count ?? offset + entries.length;

  return {
    entries,
    totalCount,
    hasMore: offset + entries.length < totalCount,
    isDemoMode: false,
  };
}

export async function addGuestbookEntry(
  authorName: string,
  message: string,
  pin: string,
): Promise<GuestbookEntry> {
  const { name, msg } = validateGuestbookInput(authorName, message, pin);

  if (!supabase) {
    const newEntry: GuestbookEntry = {
      id: `demo-${Date.now()}`,
      author_name: name,
      message: msg,
      created_at: new Date().toISOString(),
    };
    demoEntries = [newEntry, ...demoEntries];
    demoPins.set(newEntry.id, pin);
    return newEntry;
  }

  const { data, error } = await supabase.rpc('add_guestbook_entry', {
    p_author_name: name,
    p_message: msg,
    p_pin: pin,
  });

  if (error) {
    throw new Error(error.message || '방명록 등록에 실패했습니다.');
  }

  const inserted = Array.isArray(data) ? data[0] : data;
  if (!inserted) {
    throw new Error('방명록 등록 결과를 확인할 수 없습니다.');
  }

  return inserted as GuestbookEntry;
}

export async function deleteGuestbookEntry(
  id: string,
  pin: string,
): Promise<boolean> {
  if (!PIN_PATTERN.test(pin)) {
    return false;
  }

  if (!supabase) {
    const expectedPin = demoPins.get(id);
    if (!expectedPin || expectedPin !== pin) {
      return false;
    }
    demoEntries = demoEntries.filter((entry) => entry.id !== id);
    demoPins.delete(id);
    return true;
  }

  const { data, error } = await supabase.rpc('delete_guestbook_entry', {
    p_id: id,
    p_pin: pin,
  });

  if (error) {
    throw new Error('방명록 삭제 중 오류가 발생했습니다.');
  }

  return Boolean(data);
}
