export const useAI = () => {
  const { getAll } = useDiary()

  // AI 추천 프롬프트 생성
  const getRecommendedPrompt = async (currentMood) => {
    const allDiaries = await getAll()

    if (allDiaries.length === 0) {
      // 첫 일기일 경우 기본 환영 프롬프트
      return getWelcomePrompt(currentMood)
    }

    // 최근 7일 감정 분석
    const recentDiaries = getRecentDiaries(allDiaries, 7)
    const moodPattern = analyzeMoodPattern(recentDiaries)

    // 패턴 기반 추천 프롬프트 생성
    return generateSmartPrompt(currentMood, moodPattern, recentDiaries)
  }

  // 최근 N일 일기 가져오기
  const getRecentDiaries = (diaries, days) => {
    const now = new Date()
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    return diaries.filter(diary => {
      const diaryDate = new Date(diary.date)
      return diaryDate >= cutoffDate
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  // 감정 패턴 분석
  const analyzeMoodPattern = (recentDiaries) => {
    const moodCounts = {
      happy: 0,
      calm: 0,
      sad: 0,
      angry: 0,
      tired: 0
    }

    recentDiaries.forEach(diary => {
      if (moodCounts[diary.mood] !== undefined) {
        moodCounts[diary.mood]++
      }
    })

    const totalDiaries = recentDiaries.length
    const dominantMood = Object.keys(moodCounts).reduce((a, b) =>
      moodCounts[a] > moodCounts[b] ? a : b
    )

    return {
      counts: moodCounts,
      dominant: dominantMood,
      total: totalDiaries,
      diversity: Object.values(moodCounts).filter(c => c > 0).length
    }
  }

  // 첫 일기 환영 프롬프트
  const getWelcomePrompt = (mood) => {
    const welcomePrompts = {
      happy: '첫 일기를 시작하신 걸 축하합니다! 오늘의 행복한 순간을 기록해볼까요?',
      calm: '일기 쓰기를 시작하셨네요. 지금 이 평온한 순간, 무엇이 떠오르시나요?',
      sad: '힘든 순간에도 일기를 시작하셨군요. 용기를 내주셔서 고맙습니다. 지금 어떤 감정이 드시나요?',
      angry: '감정을 표현하는 것은 중요합니다. 지금 무엇이 당신을 힘들게 하나요?',
      tired: '지친 하루였군요. 오늘 당신을 가장 지치게 만든 것은 무엇인가요?'
    }
    return welcomePrompts[mood] || '오늘 하루는 어땠나요?'
  }

  // 스마트 프롬프트 생성
  const generateSmartPrompt = (currentMood, pattern, recentDiaries) => {
    // 연속된 부정적 감정 감지
    const consecutiveNegative = checkConsecutiveNegativeMood(recentDiaries)

    // 급격한 감정 변화 감지
    const moodShift = detectMoodShift(recentDiaries, currentMood)

    // 오랜만에 작성
    const longGap = checkLongGap(recentDiaries)

    // 조건별 맞춤 프롬프트
    if (longGap) {
      return getLongGapPrompt(currentMood)
    }

    if (consecutiveNegative && (currentMood === 'sad' || currentMood === 'angry')) {
      return getSupportivePrompt(currentMood)
    }

    if (moodShift.isSignificant) {
      return getMoodShiftPrompt(currentMood, moodShift.from)
    }

    if (pattern.diversity === 1 && pattern.total >= 5) {
      return getDiversityPrompt(currentMood, pattern.dominant)
    }

    // 기본 심화 프롬프트
    return getDeepPrompt(currentMood)
  }

  // 연속 부정적 감정 체크
  const checkConsecutiveNegativeMood = (diaries) => {
    const negativeMoods = ['sad', 'angry', 'tired']
    let count = 0

    for (let i = 0; i < Math.min(3, diaries.length); i++) {
      if (negativeMoods.includes(diaries[i].mood)) {
        count++
      }
    }

    return count >= 3
  }

  // 감정 변화 감지
  const detectMoodShift = (diaries, currentMood) => {
    if (diaries.length === 0) return { isSignificant: false }

    const lastMood = diaries[0].mood
    const moodOpposites = {
      happy: ['sad', 'angry'],
      sad: ['happy'],
      angry: ['calm', 'happy'],
      calm: ['angry', 'tired'],
      tired: ['happy']
    }

    const isSignificant = moodOpposites[lastMood]?.includes(currentMood) || false

    return {
      isSignificant,
      from: lastMood,
      to: currentMood
    }
  }

  // 오랜만 작성 체크
  const checkLongGap = (diaries) => {
    if (diaries.length === 0) return false

    const lastDiaryDate = new Date(diaries[0].date)
    const daysSinceLastDiary = Math.floor((new Date() - lastDiaryDate) / (1000 * 60 * 60 * 24))

    return daysSinceLastDiary >= 7
  }

  // 프롬프트 생성 함수들
  const getLongGapPrompt = (mood) => {
    return '오랜만에 다시 찾아주셨네요! 그동안 어떻게 지내셨나요? 가장 기억에 남는 순간은?'
  }

  const getSupportivePrompt = (mood) => {
    const prompts = {
      sad: '최근 계속 힘든 시간을 보내고 계시는군요. 지금 가장 필요한 것은 무엇인가요? 혹시 도움을 청할 수 있는 사람이 있나요?',
      angry: '감정이 많이 쌓여있는 것 같아요. 이 분노를 건강하게 해소할 방법을 함께 찾아볼까요? 무엇이 도움이 될까요?'
    }
    return prompts[mood] || '힘든 시간을 보내고 계시네요. 어떤 것이 위로가 될까요?'
  }

  const getMoodShiftPrompt = (currentMood, fromMood) => {
    if (currentMood === 'happy' && (fromMood === 'sad' || fromMood === 'angry')) {
      return '기분이 좋아지셨군요! 무엇이 이 긍정적인 변화를 가져왔나요? 이 기분을 유지하려면 어떻게 해야 할까요?'
    }
    if (currentMood === 'sad' && fromMood === 'happy') {
      return '감정의 변화가 있으셨네요. 무슨 일이 있었나요? 이전의 기쁨을 기억하며, 지금의 감정을 표현해보세요.'
    }
    return `${fromMood}에서 ${currentMood}(으)로 감정이 바뀌셨네요. 이 변화에 대해 어떻게 생각하시나요?`
  }

  const getDiversityPrompt = (currentMood, dominantMood) => {
    return `최근 계속 ${getMoodLabel(dominantMood)} 감정이 지속되고 있어요. 오늘은 조금 다른 관점에서 생각해볼까요? 이 감정 이면에 숨겨진 다른 감정은 없나요?`
  }

  const getDeepPrompt = (mood) => {
    const deepPrompts = {
      happy: '이 행복한 감정을 더 깊이 탐구해볼까요? 왜 이것이 당신에게 기쁨을 주나요? 이 순간에서 배울 수 있는 것은?',
      calm: '평온함 속에서 진정한 자신과 대화해보세요. 지금 이 순간, 가장 듣고 싶은 내면의 목소리는 무엇인가요?',
      sad: '슬픔은 우리에게 중요한 것을 알려줍니다. 이 감정이 당신에게 전하는 메시지는 무엇일까요?',
      angry: '분노는 우리의 경계와 가치를 보여줍니다. 이 감정이 지키려는 당신의 가치는 무엇인가요?',
      tired: '휴식이 필요한 순간입니다. 진정한 회복을 위해 당신에게 필요한 것은 무엇인가요?'
    }
    return deepPrompts[mood] || '오늘 하루를 돌아보며, 가장 의미 있었던 순간은 무엇인가요?'
  }

  const getMoodLabel = (mood) => {
    const labels = {
      happy: '행복한',
      calm: '평온한',
      sad: '우울한',
      angry: '화난',
      tired: '피곤한'
    }
    return labels[mood] || mood
  }

  return {
    getRecommendedPrompt,
    analyzeMoodPattern,
    getRecentDiaries
  }
}
