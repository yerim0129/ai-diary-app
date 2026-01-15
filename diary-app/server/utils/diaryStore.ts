/**
 * 📚 일기 저장소 (Vercel PostgreSQL)
 *
 * 📌 변경 사항 (SQLite → PostgreSQL):
 * - 이전: better-sqlite3 동기식 쿼리
 * - 현재: @vercel/postgres 비동기 쿼리
 *
 * 📁 환경변수 필요: POSTGRES_URL
 */

import { sql, initDatabase } from './database'

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
  emotion?: string
  emotionScore?: number
  keywords?: string[]
  feedback?: string
  advice?: string
  aiSource?: string
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
  emotion?: string
  emotionScore?: number
  keywords?: string[]
  feedback?: string
  advice?: string
  aiSource?: string
}

/** 일기 수정 요청 타입 (PUT 요청 body) */
export interface UpdateDiaryRequest {
  content?: string
  mood?: string
  date?: string
  images?: string[]
  prompt?: string
  emotion?: string
  emotionScore?: number
  keywords?: string[]
  feedback?: string
  advice?: string
  aiSource?: string
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
// 📌 헬퍼 함수: DB 행 → Diary 객체 변환
// ============================================

interface DiaryRow {
  id: string
  content: string
  mood: string
  date: string
  images: string
  prompt: string | null
  emotion: string | null
  emotion_score: number | null
  keywords: string
  feedback: string | null
  advice: string | null
  ai_source: string | null
  created_at: string
  updated_at: string | null
}

/**
 * DB에서 가져온 행을 Diary 객체로 변환
 * 📌 PostgreSQL snake_case → camelCase 변환
 */
function rowToDiary(row: DiaryRow): Diary {
  return {
    id: row.id,
    content: row.content,
    mood: row.mood,
    date: row.date,
    images: JSON.parse(row.images || '[]'),
    prompt: row.prompt || undefined,
    emotion: row.emotion || undefined,
    emotionScore: row.emotion_score || undefined,
    keywords: JSON.parse(row.keywords || '[]'),
    feedback: row.feedback || undefined,
    advice: row.advice || undefined,
    aiSource: row.ai_source || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined
  }
}

// ============================================
// 📌 DB 초기화 확인
// ============================================

let dbInitialized = false

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initDatabase()
    dbInitialized = true
  }
}

// ============================================
// 저장소 함수들 (CRUD) - PostgreSQL 사용
// ============================================

/**
 * 📋 모든 일기 조회
 * @returns 모든 일기 배열
 */
export async function getAllDiaries(): Promise<Diary[]> {
  console.log('📋 [DiaryStore] 전체 일기 조회 (PostgreSQL)')

  await ensureDbInitialized()

  const result = await sql`SELECT * FROM diaries ORDER BY created_at DESC`
  const rows = result.rows as DiaryRow[]

  console.log(`📋 [DiaryStore] ${rows.length}개의 일기 조회됨`)
  return rows.map(rowToDiary)
}

/**
 * 🔍 특정 일기 조회
 * @param id - 일기 ID
 * @returns 일기 객체 또는 undefined
 */
export async function getDiaryById(id: string): Promise<Diary | undefined> {
  console.log(`🔍 [DiaryStore] 일기 조회: ID=${id}`)

  await ensureDbInitialized()

  const result = await sql`SELECT * FROM diaries WHERE id = ${id}`
  const row = result.rows[0] as DiaryRow | undefined

  if (!row) {
    console.log(`🔍 [DiaryStore] 일기 없음: ID=${id}`)
    return undefined
  }

  console.log(`🔍 [DiaryStore] 일기 찾음: ID=${id}`)
  return rowToDiary(row)
}

/**
 * 💾 새 일기 저장
 * @param diary - 저장할 일기 데이터
 * @returns 저장된 일기 객체
 */
export async function saveDiary(diary: Diary): Promise<Diary> {
  console.log(`💾 [DiaryStore] 일기 저장: ID=${diary.id}`)
  console.log(`💾 [DiaryStore] 내용 길이: ${diary.content.length}자`)
  console.log(`💾 [DiaryStore] AI 분석: emotion=${diary.emotion}, aiSource=${diary.aiSource}`)

  await ensureDbInitialized()

  const imagesJson = JSON.stringify(diary.images || [])
  const keywordsJson = JSON.stringify(diary.keywords || [])

  await sql`
    INSERT INTO diaries (
      id, content, mood, date, images, prompt, emotion, emotion_score,
      keywords, feedback, advice, ai_source, created_at, updated_at
    )
    VALUES (
      ${diary.id},
      ${diary.content},
      ${diary.mood},
      ${diary.date},
      ${imagesJson},
      ${diary.prompt || null},
      ${diary.emotion || null},
      ${diary.emotionScore || null},
      ${keywordsJson},
      ${diary.feedback || null},
      ${diary.advice || null},
      ${diary.aiSource || null},
      ${diary.createdAt},
      ${diary.updatedAt || null}
    )
  `

  console.log(`✅ [DiaryStore] 일기 저장 완료! (PostgreSQL에 영구 저장됨)`)
  return diary
}

/**
 * ✏️ 일기 수정
 * @param id - 수정할 일기 ID
 * @param updates - 수정할 데이터
 * @returns 수정된 일기 객체 또는 undefined
 */
export async function updateDiary(id: string, updates: UpdateDiaryRequest): Promise<Diary | undefined> {
  console.log(`✏️ [DiaryStore] 일기 수정: ID=${id}`)

  await ensureDbInitialized()

  // 기존 일기 조회
  const existing = await getDiaryById(id)
  if (!existing) {
    console.log(`✏️ [DiaryStore] 수정 실패: ID=${id} 존재하지 않음`)
    return undefined
  }

  // 수정된 데이터 병합
  const updated: Diary = {
    ...existing,
    content: updates.content !== undefined ? updates.content : existing.content,
    mood: updates.mood !== undefined ? updates.mood : existing.mood,
    date: updates.date !== undefined ? updates.date : existing.date,
    images: updates.images !== undefined ? updates.images : existing.images,
    prompt: updates.prompt !== undefined ? updates.prompt : existing.prompt,
    emotion: updates.emotion !== undefined ? updates.emotion : existing.emotion,
    emotionScore: updates.emotionScore !== undefined ? updates.emotionScore : existing.emotionScore,
    keywords: updates.keywords !== undefined ? updates.keywords : existing.keywords,
    feedback: updates.feedback !== undefined ? updates.feedback : existing.feedback,
    advice: updates.advice !== undefined ? updates.advice : existing.advice,
    aiSource: updates.aiSource !== undefined ? updates.aiSource : existing.aiSource,
    updatedAt: new Date().toISOString()
  }

  const imagesJson = JSON.stringify(updated.images || [])
  const keywordsJson = JSON.stringify(updated.keywords || [])

  await sql`
    UPDATE diaries
    SET
      content = ${updated.content},
      mood = ${updated.mood},
      date = ${updated.date},
      images = ${imagesJson},
      prompt = ${updated.prompt || null},
      emotion = ${updated.emotion || null},
      emotion_score = ${updated.emotionScore || null},
      keywords = ${keywordsJson},
      feedback = ${updated.feedback || null},
      advice = ${updated.advice || null},
      ai_source = ${updated.aiSource || null},
      updated_at = ${updated.updatedAt}
    WHERE id = ${id}
  `

  console.log(`✅ [DiaryStore] 일기 수정 완료!`)
  return updated
}

/**
 * 🗑️ 일기 삭제
 * @param id - 삭제할 일기 ID
 * @returns 삭제 성공 여부
 */
export async function deleteDiary(id: string): Promise<boolean> {
  console.log(`🗑️ [DiaryStore] 일기 삭제: ID=${id}`)

  await ensureDbInitialized()

  // 일기 존재 확인
  const existing = await getDiaryById(id)
  if (!existing) {
    console.log(`🗑️ [DiaryStore] 삭제 실패: ID=${id} 존재하지 않음`)
    return false
  }

  await sql`DELETE FROM diaries WHERE id = ${id}`

  console.log(`✅ [DiaryStore] 일기 삭제 완료!`)
  return true
}

/**
 * 📊 저장소 상태 출력 (디버깅용)
 */
export async function getStoreStatus(): Promise<{ count: number; ids: string[] }> {
  await ensureDbInitialized()

  const countResult = await sql`SELECT COUNT(*) as count FROM diaries`
  const idsResult = await sql`SELECT id FROM diaries`

  return {
    count: Number(countResult.rows[0]?.count) || 0,
    ids: idsResult.rows.map((row: any) => row.id)
  }
}
