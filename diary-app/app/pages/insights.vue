<template>
  <div class="container">
    <div class="content">
      <!-- 헤더 -->
      <div class="header">
        <NuxtLink to="/" class="back-btn">← 홈으로</NuxtLink>
        <h1 class="title">감정 대시보드</h1>
        <p class="subtitle">나의 감정 여정을 살펴보세요</p>
      </div>

      <div v-if="diaries.length === 0" class="empty-state">
        <p class="empty-text">아직 작성된 일기가 없습니다.</p>
        <NuxtLink to="/write" class="btn btn-write">
          첫 일기 쓰러 가기
        </NuxtLink>
      </div>

      <div v-else>
        <!-- 통계 카드 -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-label">연속 작성</div>
            <div class="stat-value">{{ stats.streak }}일</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📖</div>
            <div class="stat-label">이번 달</div>
            <div class="stat-value">{{ stats.thisMonth }}개</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-label">달성률</div>
            <div class="stat-value">{{ stats.achievement }}%</div>
          </div>
        </div>

        <!-- 기분 분석 카드 -->
        <div class="mood-analysis">
          <h2 class="section-title">지금 기분이 어떠신가요?</h2>
          <div class="mood-stats">
            <div
              v-for="(count, mood) in moodStats"
              :key="mood"
              class="mood-stat-item"
              :class="`mood-${mood}`"
            >
              <span class="mood-emoji">{{ getMoodEmoji(mood) }}</span>
              <div class="mood-stat-info">
                <span class="mood-name">{{ getMoodLabel(mood) }}</span>
                <div class="mood-bar">
                  <div
                    class="mood-bar-fill"
                    :style="{ width: getMoodPercentage(count) + '%' }"
                  ></div>
                </div>
                <span class="mood-count">{{ count }}회 ({{ getMoodPercentage(count) }}%)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 일기 목록 -->
        <div class="diary-section">
          <h2 class="section-title">최근 일기</h2>
          <div class="diary-list">
            <div
              v-for="diary in diaries"
              :key="diary.id"
              class="diary-card"
              :class="`mood-${diary.mood}`"
              @click="toggleDiary(diary.id)"
            >
              <div class="diary-header">
                <div class="diary-info">
                  <span class="diary-emoji">{{ getMoodEmoji(diary.mood) }}</span>
                  <span class="diary-date">{{ diary.date }}</span>
                </div>
                <button class="expand-btn">
                  {{ expandedDiaries.includes(diary.id) ? '▲' : '▼' }}
                </button>
              </div>

              <p class="diary-prompt">{{ diary.prompt }}</p>

              <div class="diary-content" :class="{ expanded: expandedDiaries.includes(diary.id) }">
                {{ diary.content }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { getAll } = useDiary()

const diaries = ref([])
const expandedDiaries = ref([])

const moods = {
  happy: '😊',
  calm: '😌',
  sad: '😔',
  angry: '😤',
  tired: '😴'
}

const moodLabels = {
  happy: '행복했어요',
  calm: '평온해요',
  sad: '우울해요',
  angry: '화나요',
  tired: '피곤해요'
}

const stats = ref({
  streak: 0,
  thisMonth: 0,
  achievement: 0
})

const moodStats = ref({
  happy: 0,
  calm: 0,
  sad: 0,
  angry: 0,
  tired: 0
})

const getMoodEmoji = (mood) => moods[mood] || '😊'
const getMoodLabel = (mood) => moodLabels[mood] || mood

const getMoodPercentage = (count) => {
  if (diaries.value.length === 0) return 0
  return Math.round((count / diaries.value.length) * 100)
}

const calculateStats = () => {
  const allDiaries = getAll()
  diaries.value = allDiaries

  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  // 이번 달 일기 수
  const thisMonthDiaries = allDiaries.filter(d => {
    const diaryDate = new Date(d.date)
    return diaryDate.getMonth() === currentMonth && diaryDate.getFullYear() === currentYear
  })
  stats.value.thisMonth = thisMonthDiaries.length

  // 연속 작성일 계산
  let streak = 0
  const sortedDiaries = [...allDiaries].sort((a, b) => new Date(b.date) - new Date(a.date))

  if (sortedDiaries.length > 0) {
    const todayStr = today.toLocaleDateString('ko-KR')
    const lastDiaryDate = new Date(sortedDiaries[0].date).toLocaleDateString('ko-KR')

    if (todayStr === lastDiaryDate) {
      streak = 1
      for (let i = 1; i < sortedDiaries.length; i++) {
        const prevDate = new Date(sortedDiaries[i - 1].date)
        const currDate = new Date(sortedDiaries[i].date)
        const diffTime = Math.abs(prevDate - currDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          streak++
        } else {
          break
        }
      }
    }
  }
  stats.value.streak = streak

  // 달성률 (이번 달 일수 대비)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  stats.value.achievement = Math.min(100, Math.round((thisMonthDiaries.length / daysInMonth) * 100))

  // 기분별 통계
  const moodCounts = {
    happy: 0,
    calm: 0,
    sad: 0,
    angry: 0,
    tired: 0
  }

  allDiaries.forEach(diary => {
    if (moodCounts[diary.mood] !== undefined) {
      moodCounts[diary.mood]++
    }
  })

  moodStats.value = moodCounts
}

const toggleDiary = (id) => {
  const index = expandedDiaries.value.indexOf(id)
  if (index > -1) {
    expandedDiaries.value.splice(index, 1)
  } else {
    expandedDiaries.value.push(id)
  }
}

onMounted(() => {
  calculateStats()
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf3 100%);
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
  background: white;
  color: #6b7280;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 16px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.back-btn:hover {
  background: #f9fafb;
  transform: translateY(-1px);
}

.title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin-bottom: 8px;
}

.subtitle {
  text-align: center;
  color: #6b7280;
  font-size: 1rem;
}

.empty-state {
  background: white;
  border-radius: 16px;
  padding: 64px 32px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.empty-text {
  font-size: 1.2rem;
  color: #6b7280;
  margin-bottom: 24px;
}

.btn-write {
  display: inline-block;
  padding: 14px 28px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s;
}

.btn-write:hover {
  transform: translateY(-2px);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
}

.mood-analysis {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24px;
}

.mood-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mood-stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: #f9fafb;
}

.mood-emoji {
  font-size: 2rem;
}

.mood-stat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mood-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
}

.mood-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.mood-bar-fill {
  height: 100%;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  border-radius: 4px;
  transition: width 0.3s;
}

.mood-count {
  font-size: 0.85rem;
  color: #6b7280;
}

.diary-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.diary-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.diary-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.diary-card:hover {
  background: #f3f4f6;
  transform: translateY(-2px);
}

.diary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.diary-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.diary-emoji {
  font-size: 1.5rem;
}

.diary-date {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 600;
}

.expand-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px 8px;
}

.diary-prompt {
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  padding: 10px;
  background: white;
  border-radius: 8px;
}

.diary-content {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #4b5563;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: max-height 0.3s;
  white-space: pre-wrap;
}

.diary-content.expanded {
  max-height: none;
  display: block;
  -webkit-line-clamp: unset;
}

/* 기분별 스타일 */
.mood-happy {
  border-left: 4px solid #fbbf24;
}

.mood-calm {
  border-left: 4px solid #60a5fa;
}

.mood-sad {
  border-left: 4px solid #c084fc;
}

.mood-angry {
  border-left: 4px solid #f87171;
}

.mood-tired {
  border-left: 4px solid #9ca3af;
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .title {
    font-size: 1.8rem;
  }

  .mood-analysis,
  .diary-section {
    padding: 24px;
  }

  .diary-card {
    padding: 16px;
  }
}
</style>
