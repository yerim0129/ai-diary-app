<template>
  <div class="container">
    <div class="content">
      <!-- 헤더 -->
      <div class="header">
        <NuxtLink to="/" class="back-btn">← 홈으로</NuxtLink>
        <h1 class="title">감정 리포트</h1>
        <p class="subtitle">나의 감정 여정을 되돌아보세요</p>
      </div>

      <!-- 기간 선택 -->
      <div class="period-selector">
        <button
          @click="selectedPeriod = 'week'"
          class="period-btn"
          :class="{ active: selectedPeriod === 'week' }"
        >
          주간 리포트
        </button>
        <button
          @click="selectedPeriod = 'month'"
          class="period-btn"
          :class="{ active: selectedPeriod === 'month' }"
        >
          월간 리포트
        </button>
      </div>

      <div v-if="report.diaries.length === 0" class="empty-state">
        <p class="empty-text">{{ selectedPeriod === 'week' ? '이번 주' : '이번 달' }}에 작성된 일기가 없습니다.</p>
        <NuxtLink to="/write" class="btn btn-write">
          일기 쓰러 가기
        </NuxtLink>
      </div>

      <div v-else>
        <!-- 리포트 요약 -->
        <div class="summary-card">
          <h2 class="section-title">📊 {{ periodText }} 요약</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-icon">📝</div>
              <div class="summary-label">총 작성</div>
              <div class="summary-value">{{ report.diaries.length }}개</div>
            </div>
            <div class="summary-item">
              <div class="summary-icon">{{ getMoodEmoji(report.topMood) }}</div>
              <div class="summary-label">가장 많은 감정</div>
              <div class="summary-value">{{ getMoodLabel(report.topMood) }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-icon">🎯</div>
              <div class="summary-label">감정 다양성</div>
              <div class="summary-value">{{ report.diversity }}/5</div>
            </div>
          </div>
        </div>

        <!-- 감정 분포 -->
        <div class="mood-distribution">
          <h2 class="section-title">감정 분포</h2>
          <div class="mood-chart">
            <div
              v-for="(count, mood) in report.moodCounts"
              :key="mood"
              v-if="count > 0"
              class="mood-bar-item"
            >
              <div class="mood-info">
                <span class="mood-emoji">{{ getMoodEmoji(mood) }}</span>
                <span class="mood-name">{{ getMoodLabel(mood) }}</span>
              </div>
              <div class="bar-container">
                <div
                  class="bar-fill"
                  :class="`mood-${mood}`"
                  :style="{ width: getPercentage(count, report.diaries.length) + '%' }"
                >
                  <span class="bar-label">{{ count }}회</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 감정 추세 -->
        <div class="trend-card" v-if="emotionTrend">
          <h2 class="section-title">📈 감정 추세</h2>
          <div class="trend-box" :class="`trend-${emotionTrend.trend}`">
            <div class="trend-icon">
              {{ emotionTrend.trend === 'improving' ? '📈' : emotionTrend.trend === 'declining' ? '📉' : '➡️' }}
            </div>
            <p class="trend-message">{{ emotionTrend.message }}</p>
          </div>
        </div>

        <!-- AI 인사이트 -->
        <div class="insights-card">
          <h2 class="section-title">✨ AI 인사이트</h2>
          <div class="insight-item" v-for="(insight, index) in report.insights" :key="index">
            <div class="insight-icon">💡</div>
            <p class="insight-text">{{ insight }}</p>
          </div>
        </div>

        <!-- 하이라이트 일기 -->
        <div class="highlights-card">
          <h2 class="section-title">⭐ 주요 일기</h2>
          <div
            v-for="diary in report.highlights"
            :key="diary.id"
            class="highlight-item"
            :class="`mood-${diary.mood}`"
            @click="openDiary(diary)"
          >
            <div class="highlight-header">
              <span class="highlight-emoji">{{ getMoodEmoji(diary.mood) }}</span>
              <span class="highlight-date">{{ diary.date }}</span>
            </div>
            <p class="highlight-preview">{{ diary.content.substring(0, 80) }}...</p>
          </div>
        </div>

        <!-- 리포트 다운로드 버튼 -->
        <div class="action-section">
          <button @click="exportReport" class="btn-export">
            📥 리포트 다운로드 (텍스트)
          </button>
        </div>
      </div>

      <!-- 일기 모달 -->
      <div v-if="selectedDiary" class="modal-overlay" @click="closeDiary">
        <div class="modal-content" @click.stop>
          <button @click="closeDiary" class="modal-close">✕</button>
          <div class="modal-header">
            <span class="modal-emoji">{{ getMoodEmoji(selectedDiary.mood) }}</span>
            <span class="modal-date">{{ selectedDiary.date }}</span>
          </div>
          <p class="modal-prompt">{{ selectedDiary.prompt }}</p>
          <div class="modal-body">
            {{ selectedDiary.content }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { getAll } = useDiary()
const { analyzeTrend } = useEmotionAnalysis()

const moods = {
  happy: '😊',
  calm: '😌',
  sad: '😔',
  angry: '😤',
  tired: '😴'
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

const generateReport = () => {
  const allDiaries = getAll()
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

  // 하이라이트 일기 선택 (각 감정별 최신 1개씩)
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
    highlights: highlights.slice(0, 3) // 최대 3개
  }

  // 감정 추세 분석
  emotionTrend.value = analyzeTrend(allDiaries)
}

const generateInsights = (diaries, moodCounts, topMood, diversity) => {
  const insights = []
  const totalDiaries = diaries.length

  if (totalDiaries === 0) return insights

  // 작성 빈도 인사이트
  const avgPerWeek = selectedPeriod.value === 'week' ? totalDiaries : (totalDiaries / 4.3).toFixed(1)
  if (selectedPeriod.value === 'week') {
    if (totalDiaries >= 5) {
      insights.push(`이번 주 ${totalDiaries}개의 일기를 작성하셨네요! 꾸준한 기록이 인상적입니다. 💪`)
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
    insights.push(`${diversity}가지 다양한 감정을 경험하셨네요. 풍부한 감정 표현이 돋보입니다! 🌈`)
  }

  // 감정별 인사이트
  const happyPercentage = Math.round((moodCounts.happy / totalDiaries) * 100)
  const sadPercentage = Math.round((moodCounts.sad / totalDiaries) * 100)
  const angryPercentage = Math.round((moodCounts.angry / totalDiaries) * 100)

  if (happyPercentage >= 50) {
    insights.push(`행복한 순간이 ${happyPercentage}%를 차지했어요! 긍정적인 마음가짐이 느껴집니다. ✨`)
  }

  if (sadPercentage + angryPercentage >= 50) {
    insights.push(`힘든 감정이 많았던 시기였네요. 자신을 돌보는 시간을 가져보세요. 스스로에게 더 친절해지는 것도 중요합니다. 💙`)
  }

  if (moodCounts.calm >= 2) {
    insights.push(`평온한 순간을 ${moodCounts.calm}번이나 느끼셨네요. 마음의 안정을 잘 유지하고 계십니다. 🌿`)
  }

  // 연속성 체크
  const sortedDiaries = [...diaries].sort((a, b) => new Date(b.date) - new Date(a.date))
  let consecutiveDays = 0
  for (let i = 0; i < sortedDiaries.length - 1; i++) {
    const diff = Math.abs(new Date(sortedDiaries[i].date) - new Date(sortedDiaries[i + 1].date))
    const dayDiff = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (dayDiff === 1) {
      consecutiveDays++
    }
  }

  if (consecutiveDays >= 3) {
    insights.push(`${consecutiveDays + 1}일 연속으로 일기를 작성하셨네요! 훌륭한 습관입니다. 🔥`)
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

watch(selectedPeriod, () => {
  generateReport()
})

onMounted(() => {
  generateReport()
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  transition: background 0.3s ease;
}

.content {
  max-width: 900px;
  margin: 0 auto;
}

.header {
  margin-bottom: 32px;
}

.back-btn {
  display: inline-block;
  padding: 8px 16px;
  background: var(--bg-card);
  color: var(--text-secondary);
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 16px;
  transition: background 0.3s ease, color 0.3s ease;
  box-shadow: 0 2px 4px var(--shadow);
}

.back-btn:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

.subtitle {
  text-align: center;
  color: var(--text-secondary);
  font-size: 1rem;
  transition: color 0.3s ease;
}

.period-selector {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 32px;
}

.period-btn {
  padding: 12px 24px;
  border: 2px solid var(--border-color);
  background: var(--bg-card);
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.period-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.period-btn.active {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: white;
  border-color: var(--accent-primary);
}

.empty-state {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 64px 32px;
  text-align: center;
  box-shadow: 0 2px 8px var(--shadow);
  transition: background 0.3s ease;
}

.empty-text {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 24px;
  transition: color 0.3s ease;
}

.btn-write {
  display: inline-block;
  padding: 14px 28px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s;
}

.summary-card,
.mood-distribution,
.trend-card,
.insights-card,
.highlights-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px var(--shadow);
  transition: background 0.3s ease;
}

.trend-box {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  border-radius: 12px;
  border-left: 4px solid var(--text-secondary);
}

.trend-box.trend-improving {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-left-color: #10b981;
}

.trend-box.trend-declining {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border-left-color: #ef4444;
}

.trend-box.trend-stable {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-left-color: #3b82f6;
}

.trend-icon {
  font-size: 2.5rem;
}

.trend-message {
  flex: 1;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.6;
  transition: color 0.3s ease;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
  transition: color 0.3s ease;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.summary-item {
  text-align: center;
}

.summary-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.summary-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.mood-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mood-bar-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mood-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.mood-emoji {
  font-size: 1.5rem;
}

.mood-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-body);
  transition: color 0.3s ease;
}

.bar-container {
  flex: 1;
  height: 40px;
  background: var(--bg-hover-deep);
  border-radius: 8px;
  overflow: hidden;
  transition: background 0.3s ease;
}

.bar-fill {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 12px;
  transition: width 0.5s ease;
}

.bar-fill.mood-happy {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}

.bar-fill.mood-calm {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.bar-fill.mood-sad {
  background: linear-gradient(135deg, #e9d5ff, #d8b4fe);
}

.bar-fill.mood-angry {
  background: linear-gradient(135deg, #fecaca, #fca5a5);
}

.bar-fill.mood-tired {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
}

.bar-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.insight-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--bg-hover);
  border-radius: 12px;
  margin-bottom: 12px;
  transition: background 0.3s ease;
}

.insight-icon {
  font-size: 1.5rem;
}

.insight-text {
  flex: 1;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-body);
  transition: color 0.3s ease;
}

.highlight-item {
  padding: 20px;
  background: var(--bg-hover);
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s;
  border-left: 4px solid var(--border-color);
}

.highlight-item:hover {
  background: var(--bg-hover-deep);
  transform: translateY(-2px);
}

.highlight-item.mood-happy {
  border-left-color: #fbbf24;
}

.highlight-item.mood-calm {
  border-left-color: #60a5fa;
}

.highlight-item.mood-sad {
  border-left-color: #c084fc;
}

.highlight-item.mood-angry {
  border-left-color: #f87171;
}

.highlight-item.mood-tired {
  border-left-color: #9ca3af;
}

.highlight-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.highlight-emoji {
  font-size: 1.5rem;
}

.highlight-date {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.highlight-preview {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-body);
  transition: color 0.3s ease;
}

.action-section {
  text-align: center;
}

.btn-export {
  padding: 16px 32px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
}

/* 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px var(--shadow-modal);
  transition: background 0.3s ease;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: var(--bg-hover-deep);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.2rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;
}

.modal-close:hover {
  background: var(--bg-hover-deep);
  color: var(--text-primary);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.modal-emoji {
  font-size: 2rem;
}

.modal-date {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.modal-prompt {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-body);
  background: var(--bg-hover);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  transition: background 0.3s ease, color 0.3s ease;
}

.modal-body {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--text-body);
  white-space: pre-wrap;
  transition: color 0.3s ease;
}

@media (max-width: 640px) {
  .summary-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .period-selector {
    flex-direction: column;
  }

  .mood-bar-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .bar-container {
    width: 100%;
  }

  .modal-content {
    padding: 24px;
  }
}
</style>
