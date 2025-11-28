/**
 * 🗑️ 일기 삭제 API
 * DELETE /api/diaries/:id
 *
 * ID로 특정 일기를 삭제합니다.
 *
 * URL 파라미터:
 * - id: string - 삭제할 일기의 ID (예: /api/diaries/123)
 *
 * 응답 (성공):
 * {
 *   success: true,
 *   message: "일기가 삭제되었습니다."
 * }
 *
 * 응답 (실패 - 404):
 * {
 *   statusCode: 404,
 *   message: "일기를 찾을 수 없습니다."
 * }
 */

import { deleteDiary, getDiaryById } from '../../utils/diaryStore'

export default defineEventHandler((event) => {
  // 1. URL 파라미터에서 ID 추출
  const id = getRouterParam(event, 'id')
  console.log(`[DELETE /api/diaries/${id}] 일기 삭제 요청`)

  try {
    // 2. ID 유효성 검사
    if (!id) {
      console.log('[DELETE /api/diaries/:id] 에러: ID 누락')
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: '일기 ID가 필요합니다.'
      })
    }

    // 3. 일기 존재 여부 확인
    const existingDiary = getDiaryById(id)
    if (!existingDiary) {
      console.log(`[DELETE /api/diaries/${id}] 에러: 일기 없음`)
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: '일기를 찾을 수 없습니다.'
      })
    }

    // 4. 일기 삭제
    const deleted = deleteDiary(id)

    if (!deleted) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: '일기 삭제에 실패했습니다.'
      })
    }

    // 5. 성공 응답 반환
    console.log(`[DELETE /api/diaries/${id}] 삭제 성공`)
    return {
      success: true,
      message: '일기가 삭제되었습니다.'
    }

  } catch (error: any) {
    // 이미 createError로 만든 에러는 그대로 throw
    if (error.statusCode) {
      throw error
    }

    // 예상치 못한 에러 처리
    console.error(`[DELETE /api/diaries/${id}] 서버 에러:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: '일기 삭제 중 오류가 발생했습니다.'
    })
  }
})
