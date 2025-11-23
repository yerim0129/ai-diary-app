/**
 * 🚀 Nuxt Server API - 감정 분석 엔드포인트
 * 브라우저 → Nuxt Server → Hugging Face API
 * CORS 문제를 우회하기 위해 서버에서 API 호출
 */

export default defineEventHandler(async (event) => {
  try {
    // 요청 body에서 텍스트 가져오기
    const { text } = await readBody(event)

    if (!text || text.trim().length === 0) {
      throw createError({
        statusCode: 400,
        message: '분석할 텍스트가 없습니다.'
      })
    }

    // 환경 변수에서 Hugging Face 토큰 가져오기
    const config = useRuntimeConfig()
    const HF_TOKEN = config.public.hfToken

    if (!HF_TOKEN || HF_TOKEN === 'your-huggingface-token-here') {
      console.warn('⚠️ HF_TOKEN이 설정되지 않았습니다.')
      throw createError({
        statusCode: 500,
        message: 'API 토큰이 설정되지 않았습니다.'
      })
    }

    console.log('🔍 서버에서 Hugging Face API 호출 시작...')

    // Hugging Face API 호출
    const API_URL = 'https://api-inference.huggingface.co/models/beomi/kcbert-base'

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: text,
        options: {
          wait_for_model: true
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Hugging Face API 오류: ${response.status} - ${errorText}`)

      throw createError({
        statusCode: response.status,
        message: `API 호출 실패: ${response.statusText}`
      })
    }

    const result = await response.json()
    console.log('✅ Hugging Face API 응답 성공')

    return {
      success: true,
      data: result
    }

  } catch (error) {
    console.error('❌ 서버 에러:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '감정 분석 중 오류가 발생했습니다.'
    })
  }
})
