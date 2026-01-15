/**
 * 🔍 특정 일기 조회 API
 * GET /api/diaries/:id
 *
 * ID로 특정 일기를 조회합니다.
 *
 * URL 파라미터:
 * - id: string - 조회할 일기의 ID (예: /api/diaries/123)
 *
 * 응답 (성공):
 * {
 *   success: true,
 *   diary: { ... }
 * }
 *
 * 응답 (실패 - 404):
 * {
 *   statusCode: 404,
 *   message: "일기를 찾을 수 없습니다."
 * }
 */

import { getDiaryById } from '../../utils/diaryStore'

export default defineEventHandler(async (event) => {
  // 1. URL 파라미터에서 ID 추출
  const id = getRouterParam(event, 'id')
  console.log(`[GET /api/diaries/${id}] 특정 일기 조회 요청`)

  try {
    // 2. ID 유효성 검사
    if (!id) {
      console.log('[GET /api/diaries/:id] 에러: ID 누락')
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: '일기 ID가 필요합니다.'
      })
    }

    // 3. 저장소에서 일기 조회 (async)
    const diary = await getDiaryById(id)

    // 4. 일기가 없으면 404 에러
    if (!diary) {
      console.log(`[GET /api/diaries/${id}] 에러: 일기 없음`)
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: '일기를 찾을 수 없습니다.'
      })
    }

    // 5. 성공 응답 반환
    console.log(`[GET /api/diaries/${id}] 조회 성공`)
    return {
      success: true,
      diary: diary
    }

  } catch (error: any) {
    // 이미 createError로 만든 에러는 그대로 throw
    if (error.statusCode) {
      throw error
    }

    // 예상치 못한 에러 처리
    console.error(`[GET /api/diaries/${id}] 서버 에러:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: '일기 조회 중 오류가 발생했습니다.'
    })
  }
})
