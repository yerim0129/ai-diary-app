/**
 * 📚 일기 저장소 (메모리 기반)
 *
 * 현재는 메모리에 저장하지만, 나중에 데이터베이스로 쉽게 변경 가능하도록 구조화
 * - 서버 재시작 시 데이터 초기화됨
 * - TODO: 추후 SQLite, MongoDB, PostgreSQL 등으로 마이그레이션 가능
 */

// ============================================
// 타입 정의
// ============================================

/** 일기 데이터 타입 */
export interface Diary {
  id: string
  content: string
  mood: string
  date: string
  images?: string[]
  prompt?: string
  createdAt: string
  updatedAt?: string
}

/** 일기 생성 요청 타입 (POST 요청 body) */
export interface CreateDiaryRequest {
  content: string
  mood: string
  date: string
  images?: string[]
  prompt?: string
}

/** 일기 수정 요청 타입 (PUT 요청 body) */
export interface UpdateDiaryRequest {
  content?: string
  mood?: string
  date?: string
  images?: string[]
  prompt?: string
}

/** API 응답 기본 타입 */
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  diary?: Diary
  diaries?: Diary[]
  count?: number
  error?: string
}

// ============================================
// 메모리 저장소 (싱글톤 패턴)
// ============================================

/** 메모리에 일기 데이터 저장 */
const diaryStore: Map<string, Diary> = new Map()

// 테스트용 샘플 데이터 추가
const sampleDiaries: Diary[] = [
  {
    id: '1',
    content: '오늘 날씨가 정말 좋았다. 산책을 하며 많은 생각을 했다.',
    mood: 'happy',
    date: '2024-01-15',
    createdAt: new Date('2024-01-15T10:00:00').toISOString()
  },
  {
    id: '2',
    content: '프로젝트가 잘 진행되고 있어서 뿌듯하다.',
    mood: 'excited',
    date: '2024-01-16',
    createdAt: new Date('2024-01-16T20:00:00').toISOString()
  },
  {
    id: '3',
    content: '조금 피곤한 하루였지만 보람찼다.',
    mood: 'tired',
    date: '2024-01-17',
    createdAt: new Date('2024-01-17T22:00:00').toISOString()
  }
]

// 샘플 데이터 초기화
sampleDiaries.forEach(diary => diaryStore.set(diary.id, diary))

// ============================================
// 저장소 함수들 (CRUD)
// ============================================

/**
 * 모든 일기 조회
 * @returns 모든 일기 배열
 */
export function getAllDiaries(): Diary[] {
  console.log(`[DiaryStore] 전체 일기 조회: ${diaryStore.size}개`)
  return Array.from(diaryStore.values())
}

/**
 * 특정 일기 조회
 * @param id - 일기 ID
 * @returns 일기 객체 또는 undefined
 */
export function getDiaryById(id: string): Diary | undefined {
  console.log(`[DiaryStore] 일기 조회: ID=${id}`)
  return diaryStore.get(id)
}

/**
 * 새 일기 저장
 * @param diary - 저장할 일기 데이터
 * @returns 저장된 일기 객체
 */
export function saveDiary(diary: Diary): Diary {
  console.log(`[DiaryStore] 일기 저장: ID=${diary.id}, 내용 길이=${diary.content.length}`)
  diaryStore.set(diary.id, diary)
  return diary
}

/**
 * 일기 수정
 * @param id - 수정할 일기 ID
 * @param updates - 수정할 데이터
 * @returns 수정된 일기 객체 또는 undefined
 */
export function updateDiary(id: string, updates: UpdateDiaryRequest): Diary | undefined {
  const existing = diaryStore.get(id)
  if (!existing) {
    console.log(`[DiaryStore] 수정 실패: ID=${id} 존재하지 않음`)
    return undefined
  }

  const updated: Diary = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  }

  console.log(`[DiaryStore] 일기 수정: ID=${id}`)
  diaryStore.set(id, updated)
  return updated
}

/**
 * 일기 삭제
 * @param id - 삭제할 일기 ID
 * @returns 삭제 성공 여부
 */
export function deleteDiary(id: string): boolean {
  const exists = diaryStore.has(id)
  if (exists) {
    diaryStore.delete(id)
    console.log(`[DiaryStore] 일기 삭제: ID=${id}`)
  } else {
    console.log(`[DiaryStore] 삭제 실패: ID=${id} 존재하지 않음`)
  }
  return exists
}

/**
 * 저장소 상태 출력 (디버깅용)
 */
export function getStoreStatus(): { count: number; ids: string[] } {
  return {
    count: diaryStore.size,
    ids: Array.from(diaryStore.keys())
  }
}
