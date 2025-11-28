/**
 * 💾 SQLite 데이터베이스 연결
 *
 * 📌 이 파일이 하는 일:
 * 1. SQLite DB 파일 생성 (diary.db)
 * 2. 테이블 생성 (diaries)
 * 3. DB 연결 객체 제공
 *
 * 📁 DB 파일 위치: diary-app/data/diary.db
 */

import Database from 'better-sqlite3'
import { resolve } from 'path'
import { existsSync, mkdirSync } from 'fs'

// ============================================
// 📁 DB 파일 경로 설정
// ============================================

// 📌 data 폴더 경로 (프로젝트 루트/data)
const dataDir = resolve(process.cwd(), 'data')

// 📌 data 폴더가 없으면 생성
if (!existsSync(dataDir)) {
  console.log('📁 [Database] data 폴더 생성 중...')
  mkdirSync(dataDir, { recursive: true })
}

// 📌 DB 파일 경로
const dbPath = resolve(dataDir, 'diary.db')
console.log('💾 [Database] DB 경로:', dbPath)

// ============================================
// 🔌 DB 연결
// ============================================

// 📌 SQLite DB 연결 (파일이 없으면 자동 생성)
const db = new Database(dbPath)
console.log('✅ [Database] SQLite 연결 성공!')

// ============================================
// 📋 테이블 생성
// ============================================

/**
 * 📌 diaries 테이블 생성
 *
 * 컬럼 설명:
 * - id: 고유 식별자 (문자열, 기본키)
 * - content: 일기 내용 (필수)
 * - mood: 기분 (필수)
 * - date: 일기 날짜 (필수)
 * - images: 이미지 ID 배열 (JSON 문자열)
 * - prompt: AI 프롬프트 (선택)
 * - emotion: AI 분석 감정 (선택)
 * - emotionScore: 감정 점수 (선택)
 * - keywords: AI 분석 키워드 (JSON 문자열)
 * - feedback: AI 피드백 (선택)
 * - createdAt: 생성 시간
 * - updatedAt: 수정 시간 (선택)
 */
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS diaries (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    mood TEXT NOT NULL,
    date TEXT NOT NULL,
    images TEXT DEFAULT '[]',
    prompt TEXT,
    emotion TEXT,
    emotionScore INTEGER,
    keywords TEXT DEFAULT '[]',
    feedback TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT
  )
`

// 📌 테이블 생성 실행
db.exec(createTableSQL)
console.log('✅ [Database] diaries 테이블 준비 완료!')

// ============================================
// 📦 DB 객체 내보내기
// ============================================

export { db }

// 📌 DB 정보 확인용 함수
export function getDatabaseInfo() {
  const count = db.prepare('SELECT COUNT(*) as count FROM diaries').get() as { count: number }
  return {
    path: dbPath,
    tableExists: true,
    diaryCount: count.count
  }
}
