<template>
  <!-- 로딩 스켈레톤 -->
  <CalendarSkeleton v-if="isLoading" />

  <!-- 실제 컨텐츠 -->
  <div v-else class="calendar-container">
    <div class="calendar-content">
      <!-- 헤더 -->
      <header class="page-header animate-fade-in-up">
        <NuxtLink to="/" class="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          홈으로
        </NuxtLink>
        <div class="header-text">
          <h1 class="page-title">일기 캘린더</h1>
          <p class="page-subtitle">나의 감정 여정을 한눈에</p>
        </div>
      </header>

      <!-- 월 선택 -->
      <div class="month-nav animate-fade-in-up stagger-1">
        <button @click="previousMonth" class="nav-btn" aria-label="이전 달">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h2 class="current-month">{{ currentMonthText }}</h2>
        <button @click="nextMonth" class="nav-btn" aria-label="다음 달">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      <!-- 캘린더 -->
      <div class="calendar-card animate-fade-in-up stagger-2">
        <!-- 요일 헤더 -->
        <div class="weekday-header">
          <div v-for="day in weekdays" :key="day" class="weekday" :class="{ 'weekend': day === '일' || day === '토' }">
            {{ day }}
          </div>
        </div>

        <!-- 날짜 그리드 -->
        <div class="calendar-grid">
          <button
            v-for="(day, index) in calendarDays"
            :key="index"
            class="calendar-day"
            :class="{
              'other-month': day.isOtherMonth,
              'today': day.isToday,
              'has-diary': day.diary,
              [`mood-${day.diary?.mood}`]: day.diary
            }"
            :disabled="!day.diary"
            @click="day.diary && openDiary(day.diary)"
          >
            <span class="day-number">{{ day.date }}</span>
            <span v-if="day.diary" class="day-emoji">
              {{ getMoodEmoji(day.diary.mood) }}
            </span>
            <div v-if="day.isToday" class="today-indicator"></div>
          </button>
        </div>
      </div>

      <!-- 월간 통계 -->
      <div class="stats-card animate-fade-in-up stagger-3">
        <div class="stat-item">
          <span class="stat-icon">📝</span>
          <div class="stat-info">
            <span class="stat-value">{{ monthlyStats.total }}</span>
            <span class="stat-label">이번 달 일기</span>
          </div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-icon">{{ monthlyStats.topEmoji }}</span>
          <div class="stat-info">
            <span class="stat-value">{{ monthlyStats.topMoodLabel }}</span>
            <span class="stat-label">가장 많은 감정</span>
          </div>
        </div>
      </div>

      <!-- 감정 범례 -->
      <div class="legend-card animate-fade-in-up stagger-4">
        <span class="legend-title">감정 범례</span>
        <div class="legend-items">
          <div v-for="(emoji, mood) in moods" :key="mood" class="legend-item">
            <span class="legend-emoji">{{ emoji }}</span>
            <span class="legend-label">{{ getMoodLabel(mood) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 일기 모달 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedDiary" class="modal-overlay" @click="closeDiary">
          <div class="modal-container" @click.stop>
            <div class="modal-card" :style="{ '--emotion-color': getEmotionColor(selectedDiary.mood) }">
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

              <div v-if="selectedDiary.prompt" class="modal-prompt">
                <span class="prompt-icon">💭</span>
                {{ selectedDiary.prompt }}
              </div>

              <div class="modal-body">
                {{ selectedDiary.content }}
              </div>

              <ImageGallery v-if="selectedDiary.images && selectedDiary.images.length > 0" :imageIds="selectedDiary.images" />

              <div class="modal-actions">
                <button class="action-btn action-edit" @click="editDiary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  수정하기
                </button>
                <button class="action-btn action-delete" @click="deleteDiary">
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

const weekdays = ['일', '월', '화', '수', '목', '금', '토']

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

const emotionColors = {
  happy: 'var(--emotion-happy)',
  calm: 'var(--emotion-calm)',
  sad: 'var(--emotion-sad)',
  angry: 'var(--emotion-angry)',
  tired: 'var(--emotion-tired)'
}

const currentDate = ref(new Date())
const calendarDays = ref([])
const selectedDiary = ref(null)
const isLoading = ref(true)
const monthlyStats = ref({
  total: 0,
  topMood: '-',
  topMoodLabel: '-',
  topEmoji: '📊'
})

const currentMonthText = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return `${year}년 ${month}월`
})

const getMoodEmoji = (mood) => moods[mood] || '😊'
const getMoodLabel = (mood) => moodLabels[mood] || mood
const getEmotionColor = (mood) => emotionColors[mood] || 'var(--accent)'

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

const generateCalendar = async () => {
  try {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()

    const firstDay = new Date(year, month, 1)
    const startDay = new Date(firstDay)
    startDay.setDate(startDay.getDate() - firstDay.getDay())

    const allDiaries = await getAll()

    const diaryMap = {}
    allDiaries.forEach(diary => {
      const diaryDate = new Date(diary.date)
      const key = `${diaryDate.getFullYear()}-${diaryDate.getMonth() + 1}-${diaryDate.getDate()}`
      diaryMap[key] = diary
    })

    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDay)
      date.setDate(date.getDate() + i)

      const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      const diary = diaryMap[dateKey]

      days.push({
        date: date.getDate(),
        fullDate: new Date(date),
        isOtherMonth: date.getMonth() !== month,
        isToday: date.getTime() === today.getTime(),
        diary: diary
      })
    }

    calendarDays.value = days
    calculateMonthlyStats(allDiaries, year, month)
  } catch (error) {
    console.error('캘린더 생성 실패:', error)
  }
}

const calculateMonthlyStats = (allDiaries, year, month) => {
  const thisMonthDiaries = allDiaries.filter(d => {
    const diaryDate = new Date(d.date)
    return diaryDate.getFullYear() === year && diaryDate.getMonth() === month
  })

  monthlyStats.value.total = thisMonthDiaries.length

  if (thisMonthDiaries.length > 0) {
    const moodCounts = {}
    thisMonthDiaries.forEach(d => {
      moodCounts[d.mood] = (moodCounts[d.mood] || 0) + 1
    })

    const topMood = Object.keys(moodCounts).reduce((a, b) =>
      moodCounts[a] > moodCounts[b] ? a : b
    )

    monthlyStats.value.topMood = topMood
    monthlyStats.value.topMoodLabel = moodLabels[topMood] || '-'
    monthlyStats.value.topEmoji = moods[topMood] || '📊'
  } else {
    monthlyStats.value.topMood = '-'
    monthlyStats.value.topMoodLabel = '-'
    monthlyStats.value.topEmoji = '📊'
  }
}

const previousMonth = async () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
  await generateCalendar()
}

const nextMonth = async () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
  await generateCalendar()
}

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

const deleteDiary = async () => {
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
      await generateCalendar()
    } catch (error) {
      console.error('일기 삭제 오류:', error)
      alert('일기를 삭제하는 중 오류가 발생했습니다.')
    }
  }
}

onMounted(async () => {
  isLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 400))
  await generateCalendar()
  isLoading.value = false
})
</script>

<style scoped>
.calendar-container {
  min-height: 100vh;
  padding: var(--space-5);
}

.calendar-content {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

/* Header */
.page-header {
  margin-bottom: var(--space-8);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-tertiary);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 500;
  margin-bottom: var(--space-4);
  transition: color var(--duration-fast) var(--ease-out);
}

.back-link:hover {
  color: var(--text-secondary);
}

.header-text {
  text-align: center;
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--space-2);
}

.page-subtitle {
  font-size: var(--text-base);
  color: var(--text-tertiary);
}

/* Month Navigation */
.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-6);
  margin-bottom: var(--space-6);
}

.nav-btn {
  width: 44px;
  height: 44px;
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.nav-btn:hover {
  background: var(--bg-hover);
  border-color: var(--accent);
  color: var(--accent);
  transform: scale(1.05);
}

.nav-btn:active {
  transform: scale(0.95);
}

.current-month {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
  min-width: 160px;
  text-align: center;
}

/* Calendar Card */
.calendar-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-subtle);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-5);
}

.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.weekday {
  text-align: center;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-tertiary);
  padding: var(--space-2);
}

.weekday.weekend {
  color: var(--error);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-2);
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  background: var(--bg-subtle);
  border: 2px solid transparent;
  cursor: default;
  position: relative;
  transition:
    background var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.calendar-day.other-month {
  opacity: 0.3;
}

.calendar-day.today {
  background: var(--accent-subtle);
  border-color: var(--accent);
}

.today-indicator {
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  background: var(--accent);
  border-radius: 50%;
}

.calendar-day.has-diary {
  cursor: pointer;
  border-color: var(--border-default);
}

.calendar-day.has-diary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--accent);
}

.calendar-day.has-diary:active {
  transform: translateY(0) scale(0.98);
}

/* Mood-based colors */
.calendar-day.mood-happy { background: var(--emotion-happy-subtle); }
.calendar-day.mood-calm { background: var(--emotion-calm-subtle); }
.calendar-day.mood-sad { background: var(--emotion-sad-subtle); }
.calendar-day.mood-angry { background: var(--emotion-angry-subtle); }
.calendar-day.mood-tired { background: var(--emotion-tired-subtle); }

.calendar-day.mood-happy:hover { border-color: var(--emotion-happy); }
.calendar-day.mood-calm:hover { border-color: var(--emotion-calm); }
.calendar-day.mood-sad:hover { border-color: var(--emotion-sad); }
.calendar-day.mood-angry:hover { border-color: var(--emotion-angry); }
.calendar-day.mood-tired:hover { border-color: var(--emotion-tired); }

.day-number {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.day-emoji {
  font-size: 1.25rem;
  margin-top: 2px;
}

/* Stats Card */
.stats-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-subtle);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-8);
  margin-bottom: var(--space-5);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.stat-icon {
  font-size: 2rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border-default);
}

/* Legend */
.legend-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-subtle);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
}

.legend-title {
  display: block;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-3);
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.legend-emoji {
  font-size: 1.25rem;
}

.legend-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* Modal */
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

.modal-body {
  padding: var(--space-6);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
  white-space: pre-wrap;
}

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

/* Animations */
.animate-fade-in-up {
  opacity: 0;
  animation: fadeInUp var(--duration-normal) var(--ease-out) forwards;
}

.stagger-1 { animation-delay: 0.05s; }
.stagger-2 { animation-delay: 0.1s; }
.stagger-3 { animation-delay: 0.15s; }
.stagger-4 { animation-delay: 0.2s; }

/* Responsive */
@media (max-width: 640px) {
  .calendar-content {
    padding: var(--space-4) var(--space-2);
  }

  .page-title {
    font-size: var(--text-2xl);
  }

  .current-month {
    font-size: var(--text-lg);
    min-width: 120px;
  }

  .calendar-card {
    padding: var(--space-3);
  }

  .weekday, .day-number {
    font-size: var(--text-xs);
  }

  .day-emoji {
    font-size: 1rem;
  }

  .stats-card {
    flex-direction: column;
    gap: var(--space-4);
  }

  .stat-divider {
    width: 60px;
    height: 1px;
  }

  .legend-items {
    justify-content: center;
  }

  .modal-header {
    padding: var(--space-5);
  }

  .modal-body {
    padding: var(--space-5);
  }

  .modal-actions {
    padding: var(--space-4);
  }
}
</style>
