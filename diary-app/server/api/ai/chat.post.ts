/**
 * AI 상담 챗봇 API (Gemini)
 */
import { callGemini, getCounselorPrompt } from '../../utils/gemini'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { message, context } = await readBody(event)

  if (!message || message.trim().length === 0) {
    throw createError({
      statusCode: 400,
      message: '메시지가 없습니다.'
    })
  }

  if (!config.geminiApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Gemini API 키가 설정되지 않았습니다.'
    })
  }

  const systemPrompt = getCounselorPrompt(context || {})

  try {
    console.log('💬 AI 상담 요청...')

    const response = await callGemini(message, systemPrompt, config.geminiApiKey)

    console.log('✅ AI 응답 완료')

    return {
      success: true,
      message: response
    }

  } catch (error: any) {
    console.error('❌ Chat API 오류:', error)
    throw createError({
      statusCode: 500,
      message: error.message || '응답 생성 중 오류가 발생했습니다.'
    })
  }
})
