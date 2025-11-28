/**
 * 📚 일기 저장소 (SQLite 데이터베이스)
 *
 * 📌 변경 사항 (메모리 → SQLite):
 * - 이전: Map 객체에 임시 저장 (서버 재시작 시 초기화)
 * - 현재: SQLite DB에 영구 저장 (서버 재시작해도 유지!)
 *
 * 📁 DB 파일 위치: diary-app/data/diary.db
 */

import { db } from './database'

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
  emotionScore: number | null
  keywords: string
  feedback: string | null
  createdAt: string
  updatedAt: string | null
}

/**
 * DB에서 가져온 행을 Diary 객체로 변환
 * 📌 JSON 문자열 → 배열로 파싱
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
    emotionScore: row.emotionScore || undefined,
    keywords: JSON.parse(row.keywords || '[]'),
    feedback: row.feedback || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt || undefined
  }
}

// ============================================
// 저장소 함수들 (CRUD) - SQLite 사용
// ============================================

/**
 * 📋 모든 일기 조회
 * @returns 모든 일기 배열
 */
export function getAllDiaries(): Diary[] {
  console.log('📋 [DiaryStore] 전체 일기 조회 (SQLite)')

  const stmt = db.prepare('SELECT * FROM diaries ORDER BY createdAt DESC')
  const rows = stmt.all() as DiaryRow[]

  console.log(`📋 [DiaryStore] ${rows.length}개의 일기 조회됨`)
  return rows.map(rowToDiary)
}

/**
 * 🔍 특정 일기 조회
 * @param id - 일기 ID
 * @returns 일기 객체 또는 undefined
 */
export function getDiaryById(id: string): Diary | undefined {
  console.log(`🔍 [DiaryStore] 일기 조회: ID=${id}`)

  const stmt = db.prepare('SELECT * FROM diaries WHERE id = ?')
  const row = stmt.get(id) as DiaryRow | undefined

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
export function saveDiary(diary: Diary): Diary {
  console.log(`💾 [DiaryStore] 일기 저장: ID=${diary.id}`)
  console.log(`💾 [DiaryStore] 내용 길이: ${diary.content.length}자`)

  const stmt = db.prepare(`
    INSERT INTO diaries (id, content, mood, date, images, prompt, emotion, emotionScore, keywords, feedback, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    diary.id,
    diary.content,
    diary.mood,
    diary.date,
    JSON.stringify(diary.images || []),
    diary.prompt || null,
    diary.emotion || null,
    diary.emotionScore || null,
    JSON.stringify(diary.keywords || []),
    diary.feedback || null,
    diary.createdAt,
    diary.updatedAt || null
  )

  console.log(`✅ [DiaryStore] 일기 저장 완료! (DB에 영구 저장됨)`)
  return diary
}

/**
 * ✏️ 일기 수정
 * @param id - 수정할 일기 ID
 * @param updates - 수정할 데이터
 * @returns 수정된 일기 객체 또는 undefined
 */
export function updateDiary(id: string, updates: UpdateDiaryRequest): Diary | undefined {
  console.log(`✏️ [DiaryStore] 일기 수정: ID=${id}`)

  // 기존 일기 조회
  const existing = getDiaryById(id)
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
    updatedAt: new Date().toISOString()
  }

  const stmt = db.prepare(`
    UPDATE diaries
    SET content = ?, mood = ?, date = ?, images = ?, prompt = ?,
        emotion = ?, emotionScore = ?, keywords = ?, feedback = ?, updatedAt = ?
    WHERE id = ?
  `)

  stmt.run(
    updated.content,
    updated.mood,
    updated.date,
    JSON.stringify(updated.images || []),
    updated.prompt || null,
    updated.emotion || null,
    updated.emotionScore || null,
    JSON.stringify(updated.keywords || []),
    updated.feedback || null,
    updated.updatedAt,
    id
  )

  console.log(`✅ [DiaryStore] 일기 수정 완료!`)
  return updated
}

/**
 * 🗑️ 일기 삭제
 * @param id - 삭제할 일기 ID
 * @returns 삭제 성공 여부
 */
export function deleteDiary(id: string): boolean {
  console.log(`🗑️ [DiaryStore] 일기 삭제: ID=${id}`)

  // 일기 존재 확인
  const existing = getDiaryById(id)
  if (!existing) {
    console.log(`🗑️ [DiaryStore] 삭제 실패: ID=${id} 존재하지 않음`)
    return false
  }

  const stmt = db.prepare('DELETE FROM diaries WHERE id = ?')
  stmt.run(id)

  console.log(`✅ [DiaryStore] 일기 삭제 완료!`)
  return true
}

/**
 * 📊 저장소 상태 출력 (디버깅용)
 */
export function getStoreStatus(): { count: number; ids: string[] } {
  const countResult = db.prepare('SELECT COUNT(*) as count FROM diaries').get() as { count: number }
  const idsResult = db.prepare('SELECT id FROM diaries').all() as { id: string }[]

  return {
    count: countResult.count,
    ids: idsResult.map(row => row.id)
  }
}
