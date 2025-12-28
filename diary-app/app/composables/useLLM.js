/**
 * LLM API 연동 Composable (Gemini)
 */
export const useLLM = () => {
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * LLM 기반 일기 분석
   */
  const analyzeDiaryWithLLM = async (text) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/ai/analyze', {
        method: 'POST',
        body: { text }
      })

      return response.data
    } catch (e) {
      error.value = e.data?.message || e.message || 'AI 분석 실패'
      console.error('LLM 분석 오류:', e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * AI 상담 챗
   */
  const chatWithAI = async (message, context = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/ai/chat', {
        method: 'POST',
        body: { message, context }
      })

      return response.message
    } catch (e) {
      error.value = e.data?.message || e.message || '응답 생성 실패'
      console.error('Chat 오류:', e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    analyzeDiaryWithLLM,
    chatWithAI
  }
}
