<template>
  <div class="report-page">
    <!-- Ambient Background -->
    <div class="ambient-bg"></div>

    <div class="report-content">
      <!-- 헤더 -->
      <header class="report-header animate-fade-in">
        <NuxtLink to="/" class="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>홈으로</span>
        </NuxtLink>
        <div class="header-text">
          <span class="header-label">Report</span>
          <h1 class="header-title">감정 리포트</h1>
          <p class="header-subtitle">나의 감정 여정을 되돌아보세요</p>
        </div>
      </header>

      <!-- 기간 선택 -->
      <div class="period-selector animate-fade-in" style="animation-delay: 0.1s;">
        <button
          @click="selectedPeriod = 'week'"
          class="period-btn"
          :class="{ active: selectedPeriod === 'week' }"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          주간 리포트
        </button>
        <button
          @click="selectedPeriod = 'month'"
          class="period-btn"
          :class="{ active: selectedPeriod === 'month' }"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <line x1="8" y1="14" x2="8" y2="14.01"/>
            <line x1="12" y1="14" x2="12" y2="14.01"/>
            <line x1="16" y1="14" x2="16" y2="14.01"/>
            <line x1="8" y1="18" x2="8" y2="18.01"/>
            <line x1="12" y1="18" x2="12" y2="18.01"/>
          </svg>
          월간 리포트
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="report.diaries.length === 0" class="empty-state animate-fade-in">
        <div class="empty-illustration">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <p class="empty-text">{{ selectedPeriod === 'week' ? '이번 주' : '이번 달' }}에 작성된 일기가 없습니다</p>
        <p class="empty-subtext">일기를 작성하고 리포트를 받아보세요</p>
        <NuxtLink to="/write" class="btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          일기 쓰러 가기
        </NuxtLink>
      </div>

      <div v-else class="report-grid">
        <!-- 리포트 요약 -->
        <div class="summary-card animate-fade-in" style="animation-delay: 0.15s;">
          <div class="card-header">
            <h2 class="card-title">{{ periodText }} 요약</h2>
            <span class="card-badge">{{ report.diaries.length }}개 분석</span>
          </div>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-icon-wrap" style="--summary-color: var(--emotion-happy);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div class="summary-info">
                <span class="summary-value">{{ report.diaries.length }}개</span>
                <span class="summary-label">총 작성</span>
              </div>
            </div>
            <div class="summary-item">
              <div class="summary-icon-wrap emoji" :style="{ background: getEmotionBg(report.topMood) }">
                {{ getMoodEmoji(report.topMood) }}
              </div>
              <div class="summary-info">
                <span class="summary-value">{{ getMoodLabel(report.topMood) }}</span>
                <span class="summary-label">가장 많은 감정</span>
              </div>
            </div>
            <div class="summary-item">
              <div class="summary-icon-wrap" style="--summary-color: var(--accent);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a10 10 0 0 1 10 10"/>
                  <path d="M12 12L12 6"/>
                  <path d="M12 12L16 14"/>
                </svg>
              </div>
              <div class="summary-info">
                <span class="summary-value">{{ report.diversity }}/5</span>
                <span class="summary-label">감정 다양성</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 감정 분포 -->
        <div class="distribution-card animate-fade-in" style="animation-delay: 0.2s;">
          <div class="card-header">
            <h2 class="card-title">감정 분포</h2>
          </div>
          <div class="mood-chart">
            <div
              v-for="(count, mood) in report.moodCounts"
              :key="mood"
              v-show="count > 0"
              class="mood-bar-item"
            >
              <div class="mood-info">
                <div class="mood-emoji-wrap" :style="{ background: getEmotionBg(mood) }">
                  {{ getMoodEmoji(mood) }}
                </div>
                <span class="mood-name">{{ getMoodLabel(mood) }}</span>
              </div>
              <div class="bar-wrapper">
                <div class="bar-container">
                  <div
                    class="bar-fill"
                    :style="{
                      width: getPercentage(count, report.diaries.length) + '%',
                      background: `var(--emotion-${mood})`
                    }"
                  ></div>
                </div>
                <span class="bar-value">{{ count }}회 ({{ getPercentage(count, report.diaries.length) }}%)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 감정 추세 -->
        <Transition name="fade">
          <div v-if="emotionTrend" class="trend-card animate-fade-in" style="animation-delay: 0.25s;">
            <div class="card-header">
              <h2 class="card-title">감정 추세</h2>
            </div>
            <div class="trend-box" :class="`trend-${emotionTrend.trend}`">
              <div class="trend-icon-wrap">
                <svg v-if="emotionTrend.trend === 'improving'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
                <svg v-else-if="emotionTrend.trend === 'declining'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                  <polyline points="17 18 23 18 23 12"/>
                </svg>
                <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
              <div class="trend-content">
                <span class="trend-label">
                  {{ emotionTrend.trend === 'improving' ? '상승 추세' : emotionTrend.trend === 'declining' ? '하락 추세' : '안정적' }}
                </span>
                <p class="trend-message">{{ emotionTrend.message }}</p>
              </div>
            </div>
          </div>
        </Transition>

        <!-- AI 인사이트 -->
        <div class="insights-card animate-fade-in" style="animation-delay: 0.3s;">
          <div class="card-header">
            <h2 class="card-title">AI 인사이트</h2>
            <div class="card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
                <path d="M12 2a10 10 0 0 1 10 10"/>
                <circle cx="12" cy="12" r="6"/>
              </svg>
            </div>
          </div>
          <div class="insights-list">
            <div v-for="(insight, index) in report.insights" :key="index" class="insight-item">
              <div class="insight-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18V5l12-2v13"/>
                  <circle cx="6" cy="18" r="3"/>
                  <circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <p class="insight-text">{{ insight }}</p>
            </div>
          </div>
        </div>

        <!-- 하이라이트 일기 -->
        <div v-if="report.highlights.length > 0" class="highlights-card animate-fade-in" style="animation-delay: 0.35s;">
          <div class="card-header">
            <h2 class="card-title">주요 일기</h2>
            <span class="card-badge">{{ report.highlights.length }}개</span>
          </div>
          <div class="highlights-list">
            <div
              v-for="diary in report.highlights"
              :key="diary.id"
              class="highlight-item"
              @click="openDiary(diary)"
            >
              <div class="highlight-emoji" :style="{ background: getEmotionBg(diary.mood) }">
                {{ getMoodEmoji(diary.mood) }}
              </div>
              <div class="highlight-info">
                <span class="highlight-date">{{ diary.date }}</span>
                <p class="highlight-preview">{{ diary.content.substring(0, 60) }}...</p>
              </div>
              <svg class="highlight-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- 리포트 다운로드 -->
        <div class="action-section animate-fade-in" style="animation-delay: 0.4s;">
          <button @click="exportReport" class="btn-export">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            리포트 다운로드
          </button>
        </div>
      </div>
    </div>

    <!-- 일기 모달 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedDiary" class="modal-overlay" @click="closeDiary">
          <div class="modal-content" @click.stop>
            <div class="modal-header" :style="{ background: getEmotionGradient(selectedDiary.mood) }">
              <button @click="closeDiary" class="modal-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <div class="modal-emoji">{{ getMoodEmoji(selectedDiary.mood) }}</div>
              <span class="modal-date">{{ selectedDiary.date }}</span>
              <span class="modal-mood-label">{{ getMoodLabel(selectedDiary.mood) }}</span>
            </div>
            <div class="modal-body">
              <div v-if="selectedDiary.prompt" class="modal-prompt">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                {{ selectedDiary.prompt }}
              </div>
              <div class="modal-diary-content">
                {{ selectedDiary.content }}
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
/**
 * 감정 리포트 페이지
 */
const { getAll } = useDiary()

const moods = {
  happy: '😊',
  calm: '😌',
  sad: '😔',
  angry: '😤',
  tired: '😴',
  excited: '🤩'
}

const moodLabels = {
  happy: '행복',
  calm: '평온',
  sad: '우울',
  angry: '화남',
  tired: '피곤'
}

const selectedPeriod = ref('week')
const selectedDiary = ref(null)
const emotionTrend = ref(null)
const report = ref({
  diaries: [],
  moodCounts: {},
  topMood: '',
  diversity: 0,
  insights: [],
  highlights: []
})

const periodText = computed(() => {
  return selectedPeriod.value === 'week' ? '이번 주' : '이번 달'
})

const getMoodEmoji = (mood) => moods[mood] || '😊'
const getMoodLabel = (mood) => moodLabels[mood] || mood

const getPercentage = (count, total) => {
  return Math.round((count / total) * 100)
}

const getEmotionBg = (mood) => {
  const colors = {
    happy: 'var(--emotion-happy-bg)',
    calm: 'var(--emotion-calm-bg)',
    sad: 'var(--emotion-sad-bg)',
    angry: 'var(--emotion-angry-bg)',
    tired: 'var(--emotion-tired-bg)'
  }
  return colors[mood] || 'var(--bg-subtle)'
}

const getEmotionGradient = (mood) => {
  const colors = {
    happy: 'linear-gradient(135deg, var(--emotion-happy) 0%, var(--emotion-happy)80 100%)',
    calm: 'linear-gradient(135deg, var(--emotion-calm) 0%, var(--emotion-calm)80 100%)',
    sad: 'linear-gradient(135deg, var(--emotion-sad) 0%, var(--emotion-sad)80 100%)',
    angry: 'linear-gradient(135deg, var(--emotion-angry) 0%, var(--emotion-angry)80 100%)',
    tired: 'linear-gradient(135deg, var(--emotion-tired) 0%, var(--emotion-tired)80 100%)'
  }
  return colors[mood] || 'var(--accent)'
}

/**
 * 리포트 생성 함수
 */
const generateReport = async () => {
  try {
    const allDiaries = await getAll()
    const now = new Date()

    // 기간별 일기 필터링
    let periodDiaries = []
    if (selectedPeriod.value === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      periodDiaries = allDiaries.filter(d => new Date(d.date) >= weekAgo)
    } else {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      periodDiaries = allDiaries.filter(d => new Date(d.date) >= monthAgo)
    }

    // 감정 통계
    const moodCounts = {
      happy: 0,
      calm: 0,
      sad: 0,
      angry: 0,
      tired: 0
    }

    periodDiaries.forEach(d => {
      if (moodCounts[d.mood] !== undefined) {
        moodCounts[d.mood]++
      }
    })

    const topMood = Object.keys(moodCounts).reduce((a, b) =>
      moodCounts[a] > moodCounts[b] ? a : b
    )

    const diversity = Object.values(moodCounts).filter(c => c > 0).length

    // AI 인사이트 생성
    const insights = generateInsights(periodDiaries, moodCounts, topMood, diversity)

    // 하이라이트 일기 선택
    const highlights = []
    Object.keys(moods).forEach(mood => {
      const moodDiaries = periodDiaries.filter(d => d.mood === mood)
      if (moodDiaries.length > 0) {
        highlights.push(moodDiaries[0])
      }
    })

    report.value = {
      diaries: periodDiaries,
      moodCounts,
      topMood,
      diversity,
      insights,
      highlights: highlights.slice(0, 3)
    }

    // 감정 추세 분석
    emotionTrend.value = analyzeEmotionTrend(allDiaries)
  } catch (error) {
    console.error('리포트 생성 실패:', error)
  }
}

const analyzeEmotionTrend = (allDiaries) => {
  if (allDiaries.length < 2) {
    return null
  }

  const recentDiaries = allDiaries.slice(0, 5)
  const olderDiaries = allDiaries.slice(5, 10)

  if (olderDiaries.length === 0) {
    return {
      trend: 'stable',
      message: '일기가 더 쌓이면 감정 추세를 분석해드릴게요!'
    }
  }

  const emotionScores = {
    happy: 5,
    calm: 4,
    tired: 3,
    sad: 2,
    angry: 1
  }

  const recentAvg = recentDiaries.reduce((sum, d) => sum + (emotionScores[d.mood] || 3), 0) / recentDiaries.length
  const olderAvg = olderDiaries.reduce((sum, d) => sum + (emotionScores[d.mood] || 3), 0) / olderDiaries.length

  const diff = recentAvg - olderAvg

  if (diff > 0.5) {
    return {
      trend: 'improving',
      message: '최근 감정 상태가 좋아지고 있어요! 긍정적인 변화가 느껴집니다. 계속 이런 흐름을 유지해보세요!'
    }
  } else if (diff < -0.5) {
    return {
      trend: 'declining',
      message: '최근 힘든 시간을 보내고 계시네요. 스스로를 돌보는 시간을 가지세요. 필요하다면 주변에 도움을 요청하는 것도 좋습니다.'
    }
  } else {
    return {
      trend: 'stable',
      message: '감정 상태가 안정적으로 유지되고 있어요. 꾸준한 자기 관찰이 도움이 됩니다.'
    }
  }
}

const generateInsights = (diaries, moodCounts, topMood, diversity) => {
  const insights = []
  const totalDiaries = diaries.length

  if (totalDiaries === 0) return insights

  // 작성 빈도 인사이트
  const avgPerWeek = selectedPeriod.value === 'week' ? totalDiaries : (totalDiaries / 4.3).toFixed(1)
  if (selectedPeriod.value === 'week') {
    if (totalDiaries >= 5) {
      insights.push(`이번 주 ${totalDiaries}개의 일기를 작성하셨네요! 꾸준한 기록이 인상적입니다.`)
    } else if (totalDiaries >= 3) {
      insights.push(`이번 주 ${totalDiaries}번 일기를 쓰셨어요. 좋은 습관이 만들어지고 있습니다!`)
    } else {
      insights.push(`이번 주 ${totalDiaries}번 일기를 작성하셨네요. 더 자주 감정을 기록해보는 건 어떨까요?`)
    }
  } else {
    insights.push(`이번 달 총 ${totalDiaries}개의 일기를 작성하셨네요. 주당 평균 ${avgPerWeek}회입니다.`)
  }

  // 감정 다양성 인사이트
  if (diversity === 1) {
    insights.push(`${periodText.value}에는 주로 ${getMoodLabel(topMood)} 감정이 지속되었어요. 다양한 관점에서 하루를 돌아보는 것도 좋습니다.`)
  } else if (diversity >= 4) {
    insights.push(`${diversity}가지 다양한 감정을 경험하셨네요. 풍부한 감정 표현이 돋보입니다!`)
  }

  // 감정별 인사이트
  const happyPercentage = Math.round((moodCounts.happy / totalDiaries) * 100)
  const sadPercentage = Math.round((moodCounts.sad / totalDiaries) * 100)
  const angryPercentage = Math.round((moodCounts.angry / totalDiaries) * 100)

  if (happyPercentage >= 50) {
    insights.push(`행복한 순간이 ${happyPercentage}%를 차지했어요! 긍정적인 마음가짐이 느껴집니다.`)
  }

  if (sadPercentage + angryPercentage >= 50) {
    insights.push(`힘든 감정이 많았던 시기였네요. 자신을 돌보는 시간을 가져보세요.`)
  }

  if (moodCounts.calm >= 2) {
    insights.push(`평온한 순간을 ${moodCounts.calm}번이나 느끼셨네요. 마음의 안정을 잘 유지하고 계십니다.`)
  }

  return insights
}

const openDiary = (diary) => {
  selectedDiary.value = diary
}

const closeDiary = () => {
  selectedDiary.value = null
}

const exportReport = () => {
  let reportText = `=== ${periodText.value} 감정 리포트 ===\n\n`
  reportText += `📊 요약\n`
  reportText += `- 총 작성: ${report.value.diaries.length}개\n`
  reportText += `- 가장 많은 감정: ${getMoodLabel(report.value.topMood)}\n`
  reportText += `- 감정 다양성: ${report.value.diversity}/5\n\n`

  reportText += `📈 감정 분포\n`
  Object.entries(report.value.moodCounts).forEach(([mood, count]) => {
    if (count > 0) {
      reportText += `${getMoodEmoji(mood)} ${getMoodLabel(mood)}: ${count}회 (${getPercentage(count, report.value.diaries.length)}%)\n`
    }
  })

  reportText += `\n✨ AI 인사이트\n`
  report.value.insights.forEach((insight, i) => {
    reportText += `${i + 1}. ${insight}\n`
  })

  reportText += `\n⭐ 주요 일기\n`
  report.value.highlights.forEach((diary, i) => {
    reportText += `\n${i + 1}. ${diary.date} - ${getMoodLabel(diary.mood)}\n`
    reportText += `Q: ${diary.prompt}\n`
    reportText += `A: ${diary.content}\n`
  })

  // 파일 다운로드
  const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `감정리포트_${selectedPeriod.value === 'week' ? '주간' : '월간'}_${new Date().toISOString().split('T')[0]}.txt`
  link.click()
  URL.revokeObjectURL(url)
}

// 기간 변경 시 리포트 재생성
watch(selectedPeriod, async () => {
  await generateReport()
})

// 페이지 로드 시 리포트 생성
onMounted(async () => {
  await generateReport()
})
</script>

<style scoped>
.report-page {
  min-height: 100vh;
  padding: var(--space-5);
  position: relative;
}

.ambient-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50vh;
  background: linear-gradient(
    180deg,
    var(--accent)08 0%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 0;
}

.report-content {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
  position: relative;
  z-index: 1;
}

/* Header */
.report-header {
  margin-bottom: var(--space-8);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  text-decoration: none;
  margin-bottom: var(--space-6);
  transition: all var(--duration-normal) var(--ease-out);
}

.back-link:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  transform: translateX(-4px);
}

.header-text {
  text-align: center;
}

.header-label {
  display: inline-block;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--space-2);
}

.header-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  letter-spacing: -0.02em;
}

.header-subtitle {
  font-size: var(--text-base);
  color: var(--text-muted);
}

/* Period Selector */
.period-selector {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  margin-bottom: var(--space-8);
}

.period-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.period-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.period-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--space-12) var(--space-6);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-2xl);
}

.empty-illustration {
  color: var(--text-muted);
  opacity: 0.5;
  margin-bottom: var(--space-6);
}

.empty-text {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.empty-subtext {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  background: var(--accent);
  color: white;
  border-radius: var(--radius-xl);
  font-weight: 600;
  text-decoration: none;
  transition: all var(--duration-normal) var(--ease-out);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Report Grid */
.report-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* Card Base */
.summary-card,
.distribution-card,
.trend-card,
.insights-card,
.highlights-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-5);
}

.card-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.card-badge {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-muted);
  background: var(--bg-subtle);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
}

.card-icon {
  color: var(--accent);
}

/* Summary Card */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-subtle);
  border-radius: var(--radius-xl);
  transition: all var(--duration-normal) var(--ease-out);
}

.summary-item:hover {
  background: var(--bg-hover);
}

.summary-icon-wrap {
  width: 48px;
  height: 48px;
  background: var(--summary-color, var(--accent))15;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--summary-color, var(--accent));
  flex-shrink: 0;
}

.summary-icon-wrap.emoji {
  font-size: 1.5rem;
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-value {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.summary-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* Distribution Card */
.mood-chart {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.mood-bar-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.mood-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 110px;
}

.mood-emoji-wrap {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.mood-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.bar-container {
  height: 12px;
  background: var(--bg-subtle);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.6s var(--ease-out);
}

.bar-value {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* Trend Card */
.trend-box {
  display: flex;
  align-items: flex-start;
  gap: var(--space-5);
  padding: var(--space-5);
  border-radius: var(--radius-xl);
  border-left: 4px solid var(--text-muted);
}

.trend-box.trend-improving {
  background: linear-gradient(135deg, var(--emotion-calm)15 0%, var(--emotion-calm)05 100%);
  border-left-color: var(--emotion-calm);
}

.trend-box.trend-declining {
  background: linear-gradient(135deg, var(--emotion-sad)15 0%, var(--emotion-sad)05 100%);
  border-left-color: var(--emotion-sad);
}

.trend-box.trend-stable {
  background: linear-gradient(135deg, var(--accent)10 0%, var(--accent)05 100%);
  border-left-color: var(--accent);
}

.trend-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.trend-improving .trend-icon-wrap {
  background: var(--emotion-calm)20;
  color: var(--emotion-calm);
}

.trend-declining .trend-icon-wrap {
  background: var(--emotion-sad)20;
  color: var(--emotion-sad);
}

.trend-stable .trend-icon-wrap {
  background: var(--accent)15;
  color: var(--accent);
}

.trend-content {
  flex: 1;
}

.trend-label {
  display: inline-block;
  font-size: var(--text-sm);
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.trend-improving .trend-label {
  color: var(--emotion-calm);
}

.trend-declining .trend-label {
  color: var(--emotion-sad);
}

.trend-stable .trend-label {
  color: var(--accent);
}

.trend-message {
  font-size: var(--text-sm);
  line-height: 1.7;
  color: var(--text-secondary);
}

/* Insights Card */
.insights-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.insight-item {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-subtle);
  border-radius: var(--radius-xl);
  transition: all var(--duration-normal) var(--ease-out);
}

.insight-item:hover {
  background: var(--bg-hover);
}

.insight-icon {
  width: 32px;
  height: 32px;
  background: var(--accent)15;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  flex-shrink: 0;
}

.insight-text {
  flex: 1;
  font-size: var(--text-sm);
  line-height: 1.7;
  color: var(--text-secondary);
}

/* Highlights Card */
.highlights-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-subtle);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.highlight-item:hover {
  background: var(--bg-hover);
  transform: translateX(4px);
}

.highlight-emoji {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.highlight-info {
  flex: 1;
  min-width: 0;
}

.highlight-date {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-bottom: 2px;
}

.highlight-preview {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.highlight-arrow {
  color: var(--text-muted);
  flex-shrink: 0;
  transition: transform var(--duration-fast) var(--ease-out);
}

.highlight-item:hover .highlight-arrow {
  transform: translateX(4px);
}

/* Action Section */
.action-section {
  text-align: center;
}

.btn-export {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-8);
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.btn-export:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-5);
}

.modal-content {
  background: var(--bg-card);
  border-radius: var(--radius-2xl);
  max-width: 560px;
  width: 100%;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
}

.modal-header {
  position: relative;
  padding: var(--space-8) var(--space-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.modal-close {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: var(--radius-full);
  color: white;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.modal-emoji {
  font-size: 3rem;
  margin-bottom: var(--space-2);
}

.modal-date {
  font-size: var(--text-sm);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.modal-mood-label {
  font-size: var(--text-xs);
  color: rgba(255, 255, 255, 0.7);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6);
}

.modal-prompt {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--bg-subtle);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-5);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.6;
}

.modal-prompt svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--text-muted);
}

.modal-diary-content {
  font-size: var(--text-base);
  line-height: 1.8;
  color: var(--text-primary);
  white-space: pre-wrap;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-normal) var(--ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(20px);
}

/* Animation */
.animate-fade-in {
  animation: fadeInUp var(--duration-normal) var(--ease-out) both;
}

/* Responsive */
@media (max-width: 640px) {
  .report-content {
    padding: var(--space-4) var(--space-3);
  }

  .header-title {
    font-size: var(--text-2xl);
  }

  .period-selector {
    flex-direction: column;
    align-items: stretch;
  }

  .period-btn {
    justify-content: center;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .summary-item {
    padding: var(--space-4);
  }

  .summary-icon-wrap {
    width: 40px;
    height: 40px;
  }

  .mood-bar-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .mood-info {
    min-width: auto;
  }

  .bar-wrapper {
    width: 100%;
  }

  .summary-card,
  .distribution-card,
  .trend-card,
  .insights-card,
  .highlights-card {
    padding: var(--space-4);
  }

  .trend-box {
    flex-direction: column;
    gap: var(--space-4);
  }

  .modal-content {
    border-radius: var(--radius-xl);
  }

  .modal-header {
    padding: var(--space-6) var(--space-4);
  }

  .modal-emoji {
    font-size: 2.5rem;
  }

  .modal-body {
    padding: var(--space-4);
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in {
    animation: none;
  }
}
</style>
