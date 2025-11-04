export const useEmotionAnalysis = () => {
  // Hugging Face Inference API (무료, API 키 필요)
  // 사용 방법: https://huggingface.co/settings/tokens 에서 무료 API 키 발급
  const HUGGING_FACE_API_KEY = '' // 여기에 API 키를 입력하세요

  const analyzeEmotion = async (text) => {
    // API 키가 없으면 로컬 분석 사용
    if (!HUGGING_FACE_API_KEY) {
      return analyzeEmotionLocally(text)
    }

    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: text,
          }),
        }
      )

      if (!response.ok) {
        console.error('API 요청 실패:', response.status)
        return analyzeEmotionLocally(text)
      }

      const result = await response.json()

      // Hugging Face 결과를 우리 감정 형식으로 매핑
      return mapHuggingFaceResult(result)
    } catch (error) {
      console.error('감정 분석 오류:', error)
      return analyzeEmotionLocally(text)
    }
  }

  // Hugging Face 결과 매핑
  const mapHuggingFaceResult = (result) => {
    if (!result || !result[0]) return null

    const emotions = result[0]
    const topEmotion = emotions.reduce((prev, current) =>
      prev.score > current.score ? prev : current
    )

    // Hugging Face 감정 → 우리 감정 매핑
    const emotionMap = {
      'joy': 'happy',
      'neutral': 'calm',
      'sadness': 'sad',
      'anger': 'angry',
      'fear': 'sad',
      'disgust': 'angry',
      'surprise': 'happy'
    }

    return {
      emotion: emotionMap[topEmotion.label.toLowerCase()] || 'calm',
      confidence: Math.round(topEmotion.score * 100),
      details: emotions.map(e => ({
        label: e.label,
        score: Math.round(e.score * 100)
      })),
      source: 'huggingface'
    }
  }

  // 로컬 감정 분석 (API 키 없을 때)
  const analyzeEmotionLocally = (text) => {
    const lowerText = text.toLowerCase()

    // 간단한 키워드 기반 감정 분석
    const keywords = {
      happy: ['행복', '기쁨', '즐거', '좋아', '웃', '감사', '사랑', '성공', '뿌듯', '만족'],
      sad: ['슬프', '우울', '힘들', '외로', '그립', '아프', '실패', '후회', '눈물', '절망'],
      angry: ['화', '짜증', '분노', '억울', '불만', '싫어', '미워', '스트레스', '답답'],
      calm: ['평온', '편안', '차분', '고요', '여유', '휴식', '명상', '안정'],
      tired: ['피곤', '지침', '힘들', '지쳐', '졸', '무기력', '번아웃', '탈진']
    }

    const scores = {}
    Object.keys(keywords).forEach(emotion => {
      scores[emotion] = 0
      keywords[emotion].forEach(keyword => {
        const count = (lowerText.match(new RegExp(keyword, 'g')) || []).length
        scores[emotion] += count
      })
    })

    // 가장 높은 점수의 감정 찾기
    const topEmotion = Object.keys(scores).reduce((a, b) =>
      scores[a] > scores[b] ? a : b
    )

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
    const confidence = totalScore > 0
      ? Math.round((scores[topEmotion] / totalScore) * 100)
      : 50

    return {
      emotion: topEmotion,
      confidence: confidence,
      details: Object.keys(scores).map(key => ({
        label: key,
        score: totalScore > 0 ? Math.round((scores[key] / totalScore) * 100) : 20
      })),
      source: 'local'
    }
  }

  // 일기 저장 시 감정 분석 추가
  const analyzeDiaryEmotion = async (diary) => {
    const analysis = await analyzeEmotion(diary.content)

    return {
      ...diary,
      emotionAnalysis: analysis,
      suggestedMood: analysis ? analysis.emotion : diary.mood,
      moodConfidence: analysis ? analysis.confidence : null
    }
  }

  // 감정 추세 분석
  const analyzeTrend = (diaries) => {
    if (diaries.length < 2) {
      return {
        trend: 'stable',
        message: '데이터가 부족합니다.'
      }
    }

    const recentDiaries = diaries.slice(0, 7)
    const olderDiaries = diaries.slice(7, 14)

    const getPositiveRate = (diaryList) => {
      const positiveMoods = ['happy', 'calm']
      const positiveCount = diaryList.filter(d => positiveMoods.includes(d.mood)).length
      return diaryList.length > 0 ? positiveCount / diaryList.length : 0
    }

    const recentPositive = getPositiveRate(recentDiaries)
    const olderPositive = olderDiaries.length > 0 ? getPositiveRate(olderDiaries) : recentPositive

    const diff = recentPositive - olderPositive

    if (diff > 0.2) {
      return {
        trend: 'improving',
        message: '최근 긍정적인 감정이 증가하고 있어요! 좋은 흐름입니다. 📈'
      }
    } else if (diff < -0.2) {
      return {
        trend: 'declining',
        message: '최근 힘든 시간을 보내고 계시네요. 스스로를 돌보는 시간을 가져보세요. 💙'
      }
    } else {
      return {
        trend: 'stable',
        message: '감정 상태가 안정적으로 유지되고 있어요. 🌿'
      }
    }
  }

  return {
    analyzeEmotion,
    analyzeDiaryEmotion,
    analyzeTrend,
    analyzeEmotionLocally
  }
}
