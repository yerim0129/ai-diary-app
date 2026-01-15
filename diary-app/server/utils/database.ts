/**
 * 💾 Vercel Postgres 데이터베이스 연결
 *
 * 📌 변경 사항 (SQLite → PostgreSQL):
 * - 이전: better-sqlite3 (로컬 파일 DB)
 * - 현재: @vercel/postgres (Vercel 클라우드 DB)
 *
 * 📁 환경변수 필요: POSTGRES_URL (Vercel에서 자동 설정)
 */

import { sql } from '@vercel/postgres'

// ============================================
// 📋 테이블 초기화 함수
// ============================================

/**
 * 📌 diaries 테이블 생성
 * PostgreSQL 문법으로 변환됨
 */
export async function initDatabase() {
  console.log('💾 [Database] PostgreSQL 테이블 초기화 중...')

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS diaries (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        mood TEXT NOT NULL,
        date TEXT NOT NULL,
        images TEXT DEFAULT '[]',
        prompt TEXT,
        emotion TEXT,
        emotion_score INTEGER,
        keywords TEXT DEFAULT '[]',
        feedback TEXT,
        advice TEXT,
        ai_source TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT
      )
    `
    console.log('✅ [Database] diaries 테이블 준비 완료!')
    return { success: true }
  } catch (error: any) {
    console.error('❌ [Database] 테이블 생성 실패:', error.message)
    return { success: false, error: error.message }
  }
}

// ============================================
// 📦 SQL 객체 내보내기
// ============================================

export { sql }

// 📌 DB 정보 확인용 함수
export async function getDatabaseInfo() {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM diaries`
    return {
      type: 'PostgreSQL (Vercel)',
      tableExists: true,
      diaryCount: result.rows[0]?.count || 0
    }
  } catch (error: any) {
    return {
      type: 'PostgreSQL (Vercel)',
      tableExists: false,
      error: error.message
    }
  }
}
