<template>
  <!-- 로딩 스켈레톤 -->
  <HomePageSkeleton v-if="isLoading" />

  <!-- 실제 컨텐츠 -->
  <div v-else class="home-container">
    <!-- 배경 그라데이션 (감정에 따라 변화) -->
    <div class="ambient-bg" :style="ambientStyle"></div>

    <div class="home-content">
      <!-- 헤더 섹션 -->
      <header class="home-header animate-fade-in-up">
        <div class="greeting">
          <span class="greeting-time">{{ greetingTime }}</span>
          <h1 class="greeting-title">오늘 하루는 어떠셨나요?</h1>
        </div>
        <p class="greeting-sub">기록은 기억이 되고, 기억은 성장이 됩니다</p>
      </header>

      <!-- Bento Grid 레이아웃 -->
      <div class="bento-grid">
        <!-- 메인 CTA: 일기 작성 -->
        <NuxtLink to="/write" class="bento-card bento-main animate-fade-in-up stagger-1">
          <div class="card-glow"></div>
          <div class="bento-main-content">
            <div class="bento-main-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </div>
            <div class="bento-main-text">
              <span class="bento-main-title">오늘의 이야기</span>
              <span class="bento-main-desc">새로운 일기 작성하기</span>
            </div>
          </div>
          <div class="bento-main-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </NuxtLink>

        <!-- 연속 작성 -->
        <NuxtLink to="/calendar" class="bento-card bento-stat animate-fade-in-up stagger-2">
          <div class="stat-icon-wrap">
            <span class="stat-emoji">🔥</span>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.streak }}<span class="stat-unit">일</span></span>
            <span class="stat-label">연속 작성</span>
          </div>
          <div class="stat-ring" :style="{ '--progress': Math.min(stats.streak * 10, 100) + '%' }"></div>
        </NuxtLink>

        <!-- 이번 달 -->
        <NuxtLink to="/insights?filter=thisMonth" class="bento-card bento-stat animate-fade-in-up stagger-3">
          <div class="stat-icon-wrap">
            <span class="stat-emoji">📝</span>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.thisMonth }}<span class="stat-unit">개</span></span>
            <span class="stat-label">이번 달 일기</span>
          </div>
          <div class="stat-bar">
            <div class="stat-bar-fill" :style="{ width: stats.achievement + '%' }"></div>
          </div>
        </NuxtLink>

        <!-- 최근 일기 (큰 카드) -->
        <div class="bento-card bento-recent animate-fade-in-up stagger-4">
          <div class="recent-header">
            <h3 class="recent-title">최근 일기</h3>
            <NuxtLink v-if="recentDiaries.length > 0" to="/insights" class="recent-more">
              전체 보기
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </NuxtLink>
          </div>

          <!-- 빈 상태 -->
          <div v-if="recentDiaries.length === 0" class="empty-state">
            <div class="empty-illustration">
              <span class="empty-emoji animate-float">📔</span>
            </div>
            <p class="empty-text">아직 작성된 일기가 없어요</p>
            <p class="empty-sub">첫 번째 이야기를 들려주세요</p>
          </div>

          <!-- 일기 목록 -->
          <div v-else class="recent-list">
            <div
              v-for="(diary, index) in recentDiaries"
              :key="diary.id"
              class="diary-card"
              :class="'stagger-' + (index + 1)"
              :style="{ '--emotion-color': getEmotionColor(diary.mood) }"
              @click="openDiary(diary)"
            >
              <div class="diary-emotion">
                <span class="diary-emoji">{{ getMoodEmoji(diary.mood) }}</span>
              </div>
              <div class="diary-content">
                <div class="diary-meta">
                  <span class="diary-date">{{ formatDate(diary.date) }}</span>
                  <span v-if="diary.emotion" class="diary-ai-tag">AI 분석 완료</span>
                </div>
                <p class="diary-preview">{{ diary.content.substring(0, 50) }}{{ diary.content.length > 50 ? '...' : '' }}</p>
              </div>
              <div class="diary-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- On This Day -->
        <div class="bento-card bento-memory animate-fade-in-up stagger-5" v-if="onThisDay">
          <div class="memory-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            1년 전 오늘
          </div>
          <p class="memory-preview">{{ onThisDay.content.substring(0, 60) }}...</p>
          <span class="memory-emoji">{{ getMoodEmoji(onThisDay.mood) }}</span>
        </div>

        <!-- 리포트 바로가기 -->
        <NuxtLink to="/report" class="bento-card bento-report animate-fade-in-up stagger-5">
          <div class="report-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
          </div>
          <div class="report-content">
            <span class="report-title">감정 리포트</span>
            <span class="report-value">{{ stats.achievement }}% 달성</span>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- 일기 상세 모달 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedDiary" class="modal-overlay" @click="closeDiary">
          <div class="modal-container" @click.stop>
            <div class="modal-card" :style="{ '--emotion-color': getEmotionColor(selectedDiary.mood) }">
              <!-- 모달 헤더 -->
              <div class="modal-header">
                <div class="modal-emotion">
                  <span class="modal-emoji">{{ getMoodEmoji(selectedDiary.mood) }}</span>
                  <div class="modal-meta">
                    <span class="modal-date">{{ formatDate(selectedDiary.date) }}</span>
                    <span class="modal-mood">{{ getMoodLabel(selectedDiary.mood) }}</span>
                  </div>
                </div>
                <button class="modal-close" @click="closeDiary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <!-- 프롬프트 -->
              <div v-if="selectedDiary.prompt" class="modal-prompt">
                <span class="prompt-icon">💭</span>
                {{ selectedDiary.prompt }}
              </div>

              <!-- 본문 -->
              <div class="modal-body">
                {{ selectedDiary.content }}
              </div>

              <!-- 이미지 갤러리 -->
              <ImageGallery v-if="selectedDiary.images && selectedDiary.images.length > 0" :imageIds="selectedDiary.images" />

              <!-- AI 분석 결과 -->
              <div v-if="selectedDiary.emotion" class="ai-section">
                <div class="ai-header">
                  <div class="ai-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
                      <path d="M12 2a10 10 0 0 1 10 10"/>
                    </svg>
                    AI 감정 분석
                  </div>
                  <span class="ai-badge" :class="selectedDiary.aiSource">
                    {{ selectedDiary.aiSource === 'gemini' ? 'Gemini' : 'Local' }}
                  </span>
                </div>

                <div class="ai-content">
                  <!-- 감정 분석 -->
                  <div class="ai-emotion">
                    <div class="ai-emotion-main">
                      <span class="ai-emotion-emoji">{{ getMoodEmoji(selectedDiary.emotion) }}</span>
                      <div class="ai-emotion-info">
                        <span class="ai-emotion-label">{{ getMoodLabel(selectedDiary.emotion) }}</span>
                        <div class="ai-emotion-score">
                          <div class="score-bar">
                            <div class="score-fill" :style="{ width: selectedDiary.emotionScore + '%' }"></div>
                          </div>
                          <span class="score-value">{{ selectedDiary.emotionScore }}점</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 키워드 -->
                  <div v-if="selectedDiary.keywords && selectedDiary.keywords.length > 0" class="ai-keywords">
                    <span class="ai-section-label">키워드</span>
                    <div class="keyword-list">
                      <span v-for="(keyword, index) in selectedDiary.keywords" :key="index" class="keyword-tag">
                        {{ keyword }}
                      </span>
                    </div>
                  </div>

                  <!-- 피드백 -->
                  <div v-if="selectedDiary.feedback" class="ai-feedback">
                    <span class="ai-section-label">피드백</span>
                    <p class="feedback-text">{{ selectedDiary.feedback }}</p>
                  </div>

                  <!-- 조언 -->
                  <div v-if="selectedDiary.advice" class="ai-advice">
                    <div class="advice-icon">💡</div>
                    <p class="advice-text">{{ selectedDiary.advice }}</p>
                  </div>
                </div>
              </div>

              <!-- 액션 버튼 -->
              <div class="modal-actions">
                <button class="action-btn action-edit" @click="editDiary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  수정하기
                </button>
                <button class="action-btn action-delete" @click="handleDelete">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  삭제하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
const { getAll, deleteDiary: removeDiary } = useDiary()

// 기분 이모지 매핑
const moods = {
  happy: '😊',
  calm: '😌',
  sad: '😔',
  angry: '😤',
  tired: '😴',
  excited: '🤩'
}

// 기분 한글 라벨
const moodLabels = {
  happy: '행복',
  calm: '평온',
  sad: '우울',
  angry: '화남',
  tired: '피곤',
  excited: '신남'
}

// 감정 색상 매핑
const emotionColors = {
  happy: 'var(--emotion-happy)',
  calm: 'var(--emotion-calm)',
  sad: 'var(--emotion-sad)',
  angry: 'var(--emotion-angry)',
  tired: 'var(--emotion-tired)',
  excited: 'var(--emotion-happy)'
}

// 상태
const stats = ref({ streak: 0, thisMonth: 0, achievement: 0 })
const recentDiaries = ref([])
const selectedDiary = ref(null)
const isLoading = ref(true)
const onThisDay = ref(null)

// 인사말 시간대
const greetingTime = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '늦은 밤이에요'
  if (hour < 12) return '좋은 아침이에요'
  if (hour < 18) return '좋은 오후에요'
  return '좋은 저녁이에요'
})

// 배경 스타일 (최근 감정 기반)
const ambientStyle = computed(() => {
  if (recentDiaries.value.length === 0) return {}
  const mood = recentDiaries.value[0].mood
  const color = emotionColors[mood] || 'var(--accent)'
  return {
    background: `radial-gradient(ellipse at 50% 0%, ${color}15 0%, transparent 50%)`
  }
})

// 헬퍼 함수들
const getMoodEmoji = (mood) => moods[mood] || '😊'
const getMoodLabel = (mood) => moodLabels[mood] || mood
const getEmotionColor = (mood) => emotionColors[mood] || 'var(--accent)'

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffTime = now - date
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '어제'
  if (diffDays < 7) return `${diffDays}일 전`

  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

// 모달 함수
const openDiary = (diary) => {
  selectedDiary.value = diary
  document.body.style.overflow = 'hidden'
}

const closeDiary = () => {
  selectedDiary.value = null
  document.body.style.overflow = ''
}

const editDiary = () => {
  if (!selectedDiary.value) return
  navigateTo(`/write?edit=${selectedDiary.value.id}`)
}

const handleDelete = async () => {
  if (!selectedDiary.value) return

  if (confirm('정말로 이 일기를 삭제하시겠습니까?')) {
    try {
      const diary = selectedDiary.value

      if (diary.images && diary.images.length > 0) {
        const { deleteImages } = useImageDB()
        await deleteImages(diary.images)
      }

      await removeDiary(diary.id)
      closeDiary()
      await calculateStats()
    } catch (error) {
      console.error('삭제 오류:', error)
      alert('일기를 삭제하는 중 오류가 발생했습니다.')
    }
  }
}

// 통계 계산
const calculateStats = async () => {
  try {
    const diaries = await getAll()
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    // 이번 달 일기
    const thisMonthDiaries = diaries.filter(d => {
      const diaryDate = new Date(d.date)
      return diaryDate.getMonth() === currentMonth && diaryDate.getFullYear() === currentYear
    })
    stats.value.thisMonth = thisMonthDiaries.length

    // 연속 작성일 계산
    let streak = 0
    const sortedDiaries = [...diaries].sort((a, b) => new Date(b.date) - new Date(a.date))

    if (sortedDiaries.length > 0) {
      const todayStr = today.toLocaleDateString('ko-KR')
      const lastDiaryDate = new Date(sortedDiaries[0].date).toLocaleDateString('ko-KR')

      if (todayStr === lastDiaryDate) {
        streak = 1
        for (let i = 1; i < sortedDiaries.length; i++) {
          const prevDate = new Date(sortedDiaries[i - 1].date)
          const currDate = new Date(sortedDiaries[i].date)
          const diffDays = Math.ceil(Math.abs(prevDate - currDate) / (1000 * 60 * 60 * 24))
          if (diffDays === 1) streak++
          else break
        }
      }
    }
    stats.value.streak = streak

    // 달성률
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    stats.value.achievement = Math.min(100, Math.round((thisMonthDiaries.length / daysInMonth) * 100))

    // 최근 일기
    recentDiaries.value = sortedDiaries.slice(0, 3)

    // On This Day (1년 전 오늘)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0]
    onThisDay.value = diaries.find(d => d.date === oneYearAgoStr) || null

  } catch (error) {
    console.error('통계 계산 오류:', error)
    recentDiaries.value = []
  }
}

onMounted(async () => {
  isLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 400))
  await calculateStats()
  isLoading.value = false
})
</script>

<style scoped>
/* ============================================
   HOME PAGE - Bento Grid Layout
   ============================================ */
.home-container {
  min-height: 100vh;
  padding: var(--space-5);
  position: relative;
  overflow: hidden;
}

.ambient-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60vh;
  pointer-events: none;
  z-index: 0;
  transition: background var(--duration-slower) var(--ease-out);
}

.home-content {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
  position: relative;
  z-index: 1;
}

/* Header */
.home-header {
  text-align: center;
  margin-bottom: var(--space-10);
}

.greeting {
  margin-bottom: var(--space-3);
}

.greeting-time {
  display: inline-block;
  font-size: var(--text-sm);
  color: var(--accent);
  font-weight: 500;
  margin-bottom: var(--space-2);
  letter-spacing: var(--tracking-wide);
}

.greeting-title {
  font-size: var(--text-4xl);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
}

.greeting-sub {
  font-size: var(--text-base);
  color: var(--text-tertiary);
  margin-top: var(--space-2);
}

/* Bento Grid */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto;
  gap: var(--space-4);
}

/* Bento Card Base */
.bento-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-subtle);
  padding: var(--space-5);
  position: relative;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition:
    transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out);
}

.bento-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-default);
}

/* Main CTA Card */
.bento-main {
  grid-column: span 2;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
  border: none;
  padding: var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.bento-main:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: var(--shadow-xl), var(--shadow-glow);
}

.bento-main:hover .bento-main-arrow {
  transform: translateX(4px);
}

.card-glow {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 60%;
  height: 200%;
  background: radial-gradient(ellipse, rgba(255,255,255,0.15) 0%, transparent 60%);
  pointer-events: none;
}

.bento-main-content {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.bento-main-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.bento-main-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.bento-main-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: white;
}

.bento-main-desc {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.8);
}

.bento-main-arrow {
  color: white;
  opacity: 0.8;
  transition: transform var(--duration-fast) var(--ease-out);
}

/* Stat Cards */
.bento-stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  cursor: pointer;
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  background: var(--bg-subtle);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-emoji {
  font-size: 1.5rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: var(--tracking-tight);
}

.stat-unit {
  font-size: var(--text-lg);
  font-weight: 400;
  color: var(--text-tertiary);
  margin-left: 2px;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* Progress ring */
.stat-ring {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: conic-gradient(
    var(--accent) var(--progress, 0%),
    var(--border-default) var(--progress, 0%)
  );
  opacity: 0.3;
}

.stat-ring::after {
  content: '';
  position: absolute;
  inset: 6px;
  background: var(--bg-card);
  border-radius: 50%;
}

/* Progress bar */
.stat-bar {
  height: 4px;
  background: var(--border-default);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-top: auto;
}

.stat-bar-fill {
  height: 100%;
  background: var(--accent);
  border-radius: var(--radius-full);
  transition: width var(--duration-slow) var(--ease-out);
}

/* Recent Section */
.bento-recent {
  grid-column: span 2;
  padding: var(--space-6);
}

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-5);
}

.recent-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.recent-more {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--accent);
  font-weight: 500;
  text-decoration: none;
  transition: gap var(--duration-fast) var(--ease-out);
}

.recent-more:hover {
  gap: var(--space-2);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--space-10) var(--space-4);
}

.empty-illustration {
  margin-bottom: var(--space-4);
}

.empty-emoji {
  font-size: 4rem;
  display: inline-block;
}

.empty-text {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.empty-sub {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

/* Diary Cards */
.recent-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.diary-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-subtle);
  border-radius: var(--radius-lg);
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    background var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.diary-card:hover {
  background: var(--bg-hover);
  border-color: var(--emotion-color, var(--border-default));
  transform: translateX(4px);
}

.diary-card:hover .diary-arrow {
  opacity: 1;
  transform: translateX(2px);
}

.diary-emotion {
  width: 48px;
  height: 48px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--emotion-color, var(--border-default));
  flex-shrink: 0;
}

.diary-emoji {
  font-size: 1.5rem;
}

.diary-content {
  flex: 1;
  min-width: 0;
}

.diary-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.diary-date {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  font-weight: 500;
}

.diary-ai-tag {
  font-size: 10px;
  padding: 2px 6px;
  background: var(--accent-subtle);
  color: var(--accent);
  border-radius: var(--radius-full);
  font-weight: 500;
}

.diary-preview {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.diary-arrow {
  color: var(--text-tertiary);
  opacity: 0;
  transition:
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

/* On This Day */
.bento-memory {
  background: linear-gradient(135deg, var(--bg-subtle) 0%, var(--bg-card) 100%);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  cursor: pointer;
}

.memory-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  font-weight: 500;
}

.memory-preview {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}

.memory-emoji {
  font-size: 1.5rem;
  margin-top: auto;
}

/* Report Card */
.bento-report {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  cursor: pointer;
}

.report-icon {
  width: 48px;
  height: 48px;
  background: var(--accent-subtle);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
}

.report-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.report-title {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.report-value {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

/* ============================================
   MODAL STYLES
   ============================================ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-5);
}

.modal-container {
  width: 100%;
  max-width: 560px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-card {
  background: var(--bg-card);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
  background: linear-gradient(180deg, var(--emotion-color, var(--accent))08 0%, transparent 100%);
}

.modal-emotion {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.modal-emoji {
  font-size: 2.5rem;
}

.modal-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.modal-date {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
}

.modal-mood {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.modal-close {
  width: 36px;
  height: 36px;
  background: var(--bg-subtle);
  border: none;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.modal-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* Modal Prompt */
.modal-prompt {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  background: var(--bg-subtle);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-style: italic;
}

.prompt-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

/* Modal Body */
.modal-body {
  padding: var(--space-6);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
  white-space: pre-wrap;
}

/* AI Section */
.ai-section {
  margin: 0 var(--space-6) var(--space-6);
  padding: var(--space-5);
  background: var(--accent-subtle);
  border-radius: var(--radius-lg);
  border: 1px solid var(--accent)20;
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.ai-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--accent-hover);
}

.ai-badge {
  font-size: 10px;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ai-badge.gemini {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.ai-badge.local {
  background: var(--bg-hover);
  color: var(--text-secondary);
}

.ai-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.ai-emotion-main {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.ai-emotion-emoji {
  font-size: 2rem;
}

.ai-emotion-info {
  flex: 1;
}

.ai-emotion-label {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
}

.ai-emotion-score {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.score-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-card);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: var(--accent);
  border-radius: var(--radius-full);
  transition: width var(--duration-slow) var(--ease-out);
}

.score-value {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: 500;
}

.ai-section-label {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  font-weight: 500;
  margin-bottom: var(--space-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.keyword-tag {
  padding: var(--space-1) var(--space-3);
  background: var(--bg-card);
  color: var(--accent);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 500;
}

.feedback-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}

.ai-advice {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--warning-subtle);
  border-radius: var(--radius-md);
  margin-top: var(--space-2);
}

.advice-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.advice-text {
  font-size: var(--text-sm);
  color: var(--text-primary);
  line-height: var(--leading-relaxed);
}

/* Modal Actions */
.modal-actions {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-6);
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-subtle);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition:
    transform var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn:active {
  transform: translateY(0) scale(0.98);
}

.action-edit {
  background: var(--accent);
  color: white;
}

.action-edit:hover {
  background: var(--accent-hover);
  box-shadow: var(--shadow-md);
}

.action-delete {
  background: var(--error-subtle);
  color: var(--error);
}

.action-delete:hover {
  background: var(--delete-bg-hover);
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-normal) var(--ease-out);
}

.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform var(--duration-normal) var(--ease-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-card {
  transform: scale(0.95) translateY(10px);
}

.modal-leave-to .modal-card {
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 640px) {
  .home-content {
    padding: var(--space-6) var(--space-2);
  }

  .greeting-title {
    font-size: var(--text-2xl);
  }

  .bento-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .bento-main {
    grid-column: span 1;
  }

  .bento-recent {
    grid-column: span 1;
  }

  .bento-main-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .modal-container {
    max-height: 90vh;
  }

  .modal-header {
    padding: var(--space-5);
  }

  .modal-body {
    padding: var(--space-5);
  }

  .ai-section {
    margin: 0 var(--space-4) var(--space-4);
  }

  .modal-actions {
    padding: var(--space-4);
  }
}

/* Animation classes from app.vue */
.animate-fade-in-up {
  opacity: 0;
  animation: fadeInUp var(--duration-normal) var(--ease-out) forwards;
}

.animate-float {
  animation: float 3s var(--ease-in-out) infinite;
}

.stagger-1 { animation-delay: 0.05s; }
.stagger-2 { animation-delay: 0.1s; }
.stagger-3 { animation-delay: 0.15s; }
.stagger-4 { animation-delay: 0.2s; }
.stagger-5 { animation-delay: 0.25s; }
</style>
