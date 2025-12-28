/**
 * 📝 일기 저장 API
 * POST /api/diaries
 *
 * 새로운 일기를 저장합니다.
 *
 * 요청 Body:
 * {
 *   content: string (필수) - 일기 내용
 *   mood: string (필수) - 기분 (happy, sad, excited, tired 등)
 *   date: string (필수) - 일기 날짜 (YYYY-MM-DD 형식)
 *   images?: string[] (선택) - 이미지 URL 배열
 *   prompt?: string (선택) - AI 프롬프트
 * }
 *
 * 응답:
 * {
 *   success: true,
 *   message: "일기가 저장되었습니다.",
 *   diary: { ... }
 * }
 */

import { saveDiary, type CreateDiaryRequest, type Diary } from '../utils/diaryStore'

export default defineEventHandler(async (event) => {
  console.log('[POST /api/diaries] 일기 저장 요청 받음')

  try {
    // 1. 요청 body 읽기
    const body = await readBody<CreateDiaryRequest>(event)
    console.log('[POST /api/diaries] 받은 데이터:', JSON.stringify(body, null, 2))

    // 2. 유효성 검사: content 필수
    if (!body.content || typeof body.content !== 'string') {
      console.log('[POST /api/diaries] 에러: content 필드 누락')
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'content 필드는 필수입니다.'
      })
    }

    // 3. 유효성 검사: mood 필수
    if (!body.mood || typeof body.mood !== 'string') {
      console.log('[POST /api/diaries] 에러: mood 필드 누락')
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'mood 필드는 필수입니다.'
      })
    }

    // 4. 유효성 검사: date 필수
    if (!body.date || typeof body.date !== 'string') {
      console.log('[POST /api/diaries] 에러: date 필드 누락')
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'date 필드는 필수입니다.'
      })
    }

    // 5. 새 일기 객체 생성 (AI 분석 결과 포함)
    const newDiary: Diary = {
      id: Date.now().toString(), // 고유 ID 자동 생성
      content: body.content.trim(),
      mood: body.mood.trim(),
      date: body.date,
      images: body.images || [],
      prompt: body.prompt || undefined,
      // AI 분석 결과
      emotion: body.emotion || undefined,
      emotionScore: body.emotionScore || undefined,
      keywords: body.keywords || [],
      feedback: body.feedback || undefined,
      advice: body.advice || undefined,
      aiSource: body.aiSource || undefined,
      createdAt: new Date().toISOString()
    }

    // 6. 저장소에 저장
    const savedDiary = saveDiary(newDiary)
    console.log('[POST /api/diaries] 저장 완료:', savedDiary.id)

    // 7. 성공 응답 반환
    setResponseStatus(event, 201) // Created
    return {
      success: true,
      message: '일기가 저장되었습니다.',
      diary: savedDiary
    }

  } catch (error: any) {
    // 이미 createError로 만든 에러는 그대로 throw
    if (error.statusCode) {
      throw error
    }

    // 예상치 못한 에러 처리
    console.error('[POST /api/diaries] 서버 에러:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: '일기 저장 중 오류가 발생했습니다.'
    })
  }
})
