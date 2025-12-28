/**
 * 🧠 감정 분석 Composable
 * Gemini API 우선, 실패시 로컬 키워드 분석으로 폴백
 */
export const useEmotionAnalysis = () => {
  /**
   * 📊 Step 1: AI 감정 분석
   * Gemini LLM 기반 감정 분석 (폴백: 키워드 분석)
   * @param {string} text - 분석할 일기 내용
   * @returns {Promise<Object>} 분석 결과
   */
  const analyzeDiary = async (text) => {
    console.log('🧠 AI 감정 분석 시작... 텍스트 길이:', text?.length)

    // 1. Gemini LLM 분석 시도
    try {
      console.log('🤖 Gemini API 호출 중...')
      const response = await $fetch('/api/ai/analyze', {
        method: 'POST',
        body: { text }
      })
      console.log('🤖 Gemini API 응답:', JSON.stringify(response))

      if (response.success && response.data?.emotion) {
        console.log('✅ Gemini 분석 성공:', response.data)
        const result = {
          emotion: response.data.emotion,
          keywords: response.data.keywords || [],
          feedback: response.data.feedback || '',
          advice: response.data.advice || '',
          score: 85, // LLM 분석은 높은 신뢰도
          source: 'gemini'
        }
        console.log('✅ 반환할 결과:', JSON.stringify(result))
        return result
      } else {
        console.warn('⚠️ Gemini 응답에 emotion 없음:', response)
      }
    } catch (e) {
      console.error('❌ Gemini 분석 실패:', e)
      console.warn('⚠️ Gemini 분석 실패, 로컬 분석으로 폴백:', e.message || e)
    }

    // 2. 폴백: 로컬 키워드 분석
    const result = analyzeLocally(text)
    console.log('✅ 로컬 분석 완료:', result)
    return {
      ...result,
      source: 'local'
    }
  }

  /**
   * 🏠 Step 2: 로컬 감정 분석 (키워드 기반)
   * @param {string} text - 분석할 텍스트
   * @returns {Object} 분석 결과
   */
  const analyzeLocally = (text) => {

    const lowerText = text.toLowerCase()

    // 감정별 키워드
    const emotionKeywords = {
      happy: ['행복', '기쁨', '즐거', '좋아', '웃', '감사', '사랑', '성공', '뿌듯', '만족', '최고', '멋지', '완벽'],
      calm: ['평온', '편안', '차분', '고요', '여유', '휴식', '명상', '안정', '평화', '고요'],
      sad: ['슬프', '우울', '힘들', '외로', '그립', '아프', '실패', '후회', '눈물', '절망', '힘들어'],
      angry: ['화', '짜증', '분노', '억울', '불만', '싫어', '미워', '스트레스', '답답', '열받'],
      tired: ['피곤', '지침', '지쳐', '졸', '무기력', '번아웃', '탈진', '힘빠', '지루']
    }

    // 각 감정의 점수 계산
    const scores = {}
    let foundKeywords = []

    Object.keys(emotionKeywords).forEach(emotion => {
      scores[emotion] = 0
      emotionKeywords[emotion].forEach(keyword => {
        const regex = new RegExp(keyword, 'g')
        const matches = lowerText.match(regex)
        if (matches) {
          scores[emotion] += matches.length
          foundKeywords.push(keyword)
        }
      })
    })

    // 가장 높은 점수의 감정
    let topEmotion = 'calm' // 기본값
    let maxScore = 0

    Object.keys(scores).forEach(emotion => {
      if (scores[emotion] > maxScore) {
        maxScore = scores[emotion]
        topEmotion = emotion
      }
    })

    // 점수를 0-100으로 정규화
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
    const normalizedScore = totalScore > 0
      ? Math.round((scores[topEmotion] / totalScore) * 100)
      : 50

    // 키워드는 최대 3개만
    const keywords = [...new Set(foundKeywords)].slice(0, 3)
    if (keywords.length === 0) {
      keywords.push('일상', '생각')
    }

    const feedback = generateFeedback(topEmotion, normalizedScore)

    return {
      emotion: topEmotion,
      keywords,
      feedback,
      score: normalizedScore
    }
  }

  /**
   * 💬 Step 4: 감정에 맞는 피드백 생성
   * @param {string} emotion - 감정 (happy, calm, sad, angry, tired)
   * @returns {string} 피드백 메시지
   */
  const generateFeedback = (emotion) => {
    const feedbacks = {
      happy: [
        '정말 멋진 하루였네요! 이 기쁨을 오래 간직하세요! 😊',
        '긍정적인 에너지가 느껴져요! 계속 이런 날들이 많길 바래요! ✨',
        '행복한 순간이네요! 이런 감정을 자주 느끼면 좋겠어요! 🌟'
      ],
      calm: [
        '평온한 하루였군요. 마음의 안정을 유지하세요. 🌿',
        '차분한 하루네요. 이런 여유로운 시간도 중요해요. ☁️',
        '고요한 순간이에요. 내면의 평화를 즐기세요. 🍃'
      ],
      sad: [
        '힘든 시간이지만, 이 또한 지나갈 거예요. 힘내세요. 💙',
        '슬픔을 느끼는 것도 괜찮아요. 충분히 쉬어가세요. 🌧️',
        '어려운 순간이네요. 스스로에게 더 따뜻하게 대해주세요. 🤗'
      ],
      angry: [
        '화가 났던 하루군요. 깊게 숨을 쉬고 차분히 정리해봐요. 🌊',
        '분노는 자연스러운 감정이에요. 건강하게 표현하는 게 중요해요. 💪',
        '감정을 솔직히 표현해주셔서 좋아요. 곧 괜찮아질 거예요. 🔥'
      ],
      tired: [
        '많이 피곤하셨군요. 충분한 휴식을 취하세요. 😴',
        '지친 하루였네요. 내일은 더 나은 하루가 될 거예요. 🌙',
        '무리하지 마세요. 잠시 멈춰서 쉬어가도 괜찮아요. 💤'
      ]
    }

    const messages = feedbacks[emotion] || feedbacks.calm
    const randomIndex = Math.floor(Math.random() * messages.length)
    return messages[randomIndex]
  }

  /**
   * 🔍 Step 5: 키워드 추출 (간단 버전)
   * @returns {Array} 키워드 배열
   */
  const extractKeywords = () => {
    // 실제로는 더 복잡한 NLP 처리가 필요하지만,
    // 여기서는 간단하게 감정에 맞는 키워드 반환
    const keywords = ['감정', '기분', '생각']
    return keywords
  }

  return {
    analyzeDiary,
    analyzeLocally
  }
}
