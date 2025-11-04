<template>
  <div class="container">
    <div class="content">
      <!-- 헤더 -->
      <div class="header">
        <NuxtLink to="/" class="back-btn">← 홈으로</NuxtLink>
        <h1 class="title">일기 캘린더</h1>
        <p class="subtitle">나의 감정 여정을 한눈에</p>
      </div>

      <!-- 월 선택 -->
      <div class="month-selector">
        <button @click="previousMonth" class="month-btn">
          ←
        </button>
        <h2 class="current-month">{{ currentMonthText }}</h2>
        <button @click="nextMonth" class="month-btn">
          →
        </button>
      </div>

      <!-- 캘린더 -->
      <div class="calendar-card">
        <!-- 요일 헤더 -->
        <div class="weekday-header">
          <div v-for="day in weekdays" :key="day" class="weekday">
            {{ day }}
          </div>
        </div>

        <!-- 날짜 그리드 -->
        <div class="calendar-grid">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            class="calendar-day"
            :class="{
              'other-month': day.isOtherMonth,
              'today': day.isToday,
              'has-diary': day.diary
            }"
            @click="day.diary && openDiary(day.diary)"
          >
            <div class="day-number">{{ day.date }}</div>
            <div v-if="day.diary" class="day-emoji">
              {{ getMoodEmoji(day.diary.mood) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 통계 요약 -->
      <div class="calendar-stats">
        <div class="stat-item">
          <span class="stat-label">이번 달 일기</span>
          <span class="stat-value">{{ monthlyStats.total }}개</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-label">가장 많은 감정</span>
          <span class="stat-value">{{ monthlyStats.topMood }}</span>
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

const weekdays = ['일', '월', '화', '수', '목', '금', '토']

const moods = {
  happy: '😊',
  calm: '😌',
  sad: '😔',
  angry: '😤',
  tired: '😴'
}

const moodLabels = {
  happy: '😊 행복',
  calm: '😌 평온',
  sad: '😔 우울',
  angry: '😤 화남',
  tired: '😴 피곤'
}

const currentDate = ref(new Date())
const calendarDays = ref([])
const selectedDiary = ref(null)
const monthlyStats = ref({
  total: 0,
  topMood: '-'
})

const currentMonthText = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return `${year}년 ${month}월`
})

const getMoodEmoji = (mood) => moods[mood] || '😊'

const generateCalendar = () => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  // 이번 달 첫날과 마지막 날
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // 캘린더 시작일 (이전 달 날짜 포함)
  const startDay = new Date(firstDay)
  startDay.setDate(startDay.getDate() - firstDay.getDay())

  // 모든 일기 가져오기
  const allDiaries = getAll()
  const diaryMap = {}

  allDiaries.forEach(diary => {
    const diaryDate = new Date(diary.date)
    const key = `${diaryDate.getFullYear()}-${diaryDate.getMonth() + 1}-${diaryDate.getDate()}`
    diaryMap[key] = diary
  })

  // 캘린더 날짜 생성 (6주)
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

  // 월간 통계 계산
  calculateMonthlyStats(allDiaries, year, month)
}

const calculateMonthlyStats = (allDiaries, year, month) => {
  const thisMonthDiaries = allDiaries.filter(d => {
    const diaryDate = new Date(d.date)
    return diaryDate.getFullYear() === year && diaryDate.getMonth() === month
  })

  monthlyStats.value.total = thisMonthDiaries.length

  // 가장 많은 감정 찾기
  if (thisMonthDiaries.length > 0) {
    const moodCounts = {}
    thisMonthDiaries.forEach(d => {
      moodCounts[d.mood] = (moodCounts[d.mood] || 0) + 1
    })

    const topMood = Object.keys(moodCounts).reduce((a, b) =>
      moodCounts[a] > moodCounts[b] ? a : b
    )

    monthlyStats.value.topMood = moodLabels[topMood] || '-'
  } else {
    monthlyStats.value.topMood = '-'
  }
}

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
  generateCalendar()
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
  generateCalendar()
}

const openDiary = (diary) => {
  selectedDiary.value = diary
}

const closeDiary = () => {
  selectedDiary.value = null
}

onMounted(() => {
  generateCalendar()
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

.month-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
}

.month-btn {
  padding: 12px 20px;
  background: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.month-btn:hover {
  background: #f9fafb;
  color: #8b5cf6;
  transform: translateY(-1px);
}

.current-month {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  min-width: 180px;
  text-align: center;
}

.calendar-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.weekday {
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7280;
  padding: 8px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 12px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.calendar-day.other-month {
  opacity: 0.3;
  cursor: default;
}

.calendar-day.today {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  font-weight: 700;
}

.calendar-day.has-diary {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  cursor: pointer;
}

.calendar-day.has-diary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.2);
}

.day-number {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.day-emoji {
  font-size: 1.5rem;
}

.calendar-stats {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 0.9rem;
  color: #6b7280;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e5e7eb;
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
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.2rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e5e7eb;
  color: #1f2937;
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
  color: #6b7280;
}

.modal-prompt {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.modal-body {
  font-size: 1rem;
  line-height: 1.8;
  color: #4b5563;
  white-space: pre-wrap;
}

@media (max-width: 640px) {
  .title {
    font-size: 1.8rem;
  }

  .current-month {
    font-size: 1.2rem;
    min-width: 140px;
  }

  .month-btn {
    padding: 10px 16px;
  }

  .calendar-card {
    padding: 16px;
  }

  .day-number {
    font-size: 0.9rem;
  }

  .day-emoji {
    font-size: 1.2rem;
  }

  .calendar-stats {
    flex-direction: column;
    gap: 16px;
  }

  .stat-divider {
    width: 100%;
    height: 1px;
  }

  .modal-content {
    padding: 24px;
  }
}
</style>
