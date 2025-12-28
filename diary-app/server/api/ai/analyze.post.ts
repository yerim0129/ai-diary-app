/**
 * Gemini 기반 일기 감정 분석 API
 */
import { callGemini, getDiaryAnalysisPrompt, parseGeminiResponse } from '../../utils/gemini'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { text } = await readBody(event)

  if (!text || text.trim().length === 0) {
    throw createError({
      statusCode: 400,
      message: '분석할 텍스트가 없습니다.'
    })
  }

  if (!config.geminiApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Gemini API 키가 설정되지 않았습니다. .env 파일을 확인하세요.'
    })
  }

  const systemPrompt = getDiaryAnalysisPrompt()
  const userPrompt = `다음 일기를 분석해주세요:\n\n"${text}"`

  try {
    console.log('🤖 Gemini API 호출 시작...')

    const response = await callGemini(userPrompt, systemPrompt, config.geminiApiKey)
    const parsed = parseGeminiResponse(response)

    console.log('✅ Gemini 분석 완료:', parsed)

    return {
      success: true,
      data: parsed,
      raw: response
    }

  } catch (error: any) {
    console.error('❌ Gemini API 오류:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'AI 분석 중 오류가 발생했습니다.'
    })
  }
})
