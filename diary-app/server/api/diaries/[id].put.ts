/**
 * ✏️ 일기 수정 API
 * PUT /api/diaries/:id
 *
 * ID로 특정 일기를 수정합니다.
 *
 * URL 파라미터:
 * - id: string - 수정할 일기의 ID (예: /api/diaries/123)
 *
 * 요청 Body:
 * {
 *   content?: string - 일기 내용
 *   mood?: string - 기분
 *   date?: string - 날짜
 *   images?: string[] - 이미지 URL 배열
 *   prompt?: string - AI 프롬프트
 * }
 *
 * 응답 (성공):
 * {
 *   success: true,
 *   message: "일기가 수정되었습니다.",
 *   diary: { ... }
 * }
 *
 * 응답 (실패 - 404):
 * {
 *   statusCode: 404,
 *   message: "일기를 찾을 수 없습니다."
 * }
 */

import { updateDiary, getDiaryById, type UpdateDiaryRequest } from '../../utils/diaryStore'

export default defineEventHandler(async (event) => {
  // 1. URL 파라미터에서 ID 추출
  const id = getRouterParam(event, 'id')
  console.log(`[PUT /api/diaries/${id}] 일기 수정 요청`)

  try {
    // 2. ID 유효성 검사
    if (!id) {
      console.log('[PUT /api/diaries/:id] 에러: ID 누락')
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: '일기 ID가 필요합니다.'
      })
    }

    // 3. 일기 존재 여부 확인
    const existingDiary = getDiaryById(id)
    if (!existingDiary) {
      console.log(`[PUT /api/diaries/${id}] 에러: 일기 없음`)
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: '일기를 찾을 수 없습니다.'
      })
    }

    // 4. 요청 body 읽기
    const body = await readBody<UpdateDiaryRequest>(event)
    console.log(`[PUT /api/diaries/${id}] 수정 데이터:`, JSON.stringify(body, null, 2))

    // 5. 수정할 데이터가 있는지 확인
    if (!body || Object.keys(body).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: '수정할 데이터가 없습니다.'
      })
    }

    // 6. 일기 수정 (updatedAt 자동 추가됨)
    const updatedDiary = updateDiary(id, {
      content: body.content?.trim(),
      mood: body.mood?.trim(),
      date: body.date,
      images: body.images,
      prompt: body.prompt
    })

    if (!updatedDiary) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: '일기 수정에 실패했습니다.'
      })
    }

    // 7. 성공 응답 반환
    console.log(`[PUT /api/diaries/${id}] 수정 성공`)
    return {
      success: true,
      message: '일기가 수정되었습니다.',
      diary: updatedDiary
    }

  } catch (error: any) {
    // 이미 createError로 만든 에러는 그대로 throw
    if (error.statusCode) {
      throw error
    }

    // 예상치 못한 에러 처리
    console.error(`[PUT /api/diaries/${id}] 서버 에러:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: '일기 수정 중 오류가 발생했습니다.'
    })
  }
})
