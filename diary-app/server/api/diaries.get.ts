/**
 * 📋 일기 목록 조회 API
 * GET /api/diaries
 *
 * 저장된 모든 일기를 조회합니다.
 *
 * 쿼리 파라미터:
 * - limit: number (선택) - 최대 조회 개수 (예: ?limit=10)
 * - mood: string (선택) - 기분 필터 (예: ?mood=happy)
 *
 * 응답:
 * {
 *   success: true,
 *   count: 3,
 *   diaries: [...]
 * }
 */

import { getAllDiaries, type Diary } from '../utils/diaryStore'

export default defineEventHandler((event) => {
  console.log('[GET /api/diaries] 일기 목록 조회 요청')

  try {
    // 1. 쿼리 파라미터 읽기
    const query = getQuery(event)
    const limit = query.limit ? parseInt(query.limit as string) : undefined
    const moodFilter = query.mood as string | undefined

    console.log('[GET /api/diaries] 쿼리 파라미터:', { limit, mood: moodFilter })

    // 2. 모든 일기 조회
    let diaries: Diary[] = getAllDiaries()

    // 3. 기분 필터 적용
    if (moodFilter) {
      diaries = diaries.filter(diary => diary.mood === moodFilter)
      console.log(`[GET /api/diaries] 기분 필터 적용 (${moodFilter}): ${diaries.length}개`)
    }

    // 4. 최신순 정렬 (createdAt 기준)
    diaries.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // 5. limit 적용
    if (limit && limit > 0) {
      diaries = diaries.slice(0, limit)
      console.log(`[GET /api/diaries] limit 적용 (${limit}): ${diaries.length}개`)
    }

    // 6. 성공 응답 반환
    console.log(`[GET /api/diaries] 조회 완료: ${diaries.length}개`)
    return {
      success: true,
      count: diaries.length,
      diaries: diaries
    }

  } catch (error: any) {
    // 예상치 못한 에러 처리
    console.error('[GET /api/diaries] 서버 에러:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: '일기 목록 조회 중 오류가 발생했습니다.'
    })
  }
})
