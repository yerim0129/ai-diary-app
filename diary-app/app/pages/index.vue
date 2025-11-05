<template>
  <!-- 로딩 스켈레톤 -->
  <HomePageSkeleton v-if="isLoading" />

  <!-- 실제 컨텐츠 -->
  <div v-else class="container">
    <div class="content">
      <!-- 헤더 -->
      <header class="header">
        <h1 class="title">✨ 오늘의 일기</h1>
        <p class="subtitle">AI가 당신의 하루를 함께합니다</p>
      </header>

      <!-- 통계 카드 -->
      <div class="stats-grid">
        <NuxtLink to="/calendar" class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-label">연속 작성</div>
          <div class="stat-value">{{ stats.streak }}일</div>
        </NuxtLink>
        <NuxtLink to="/calendar" class="stat-card">
          <div class="stat-icon">📖</div>
          <div class="stat-label">이번 달</div>
          <div class="stat-value">{{ stats.thisMonth }}개</div>
        </NuxtLink>
        <NuxtLink to="/report" class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-label">리포트</div>
          <div class="stat-value">{{ stats.achievement }}%</div>
        </NuxtLink>
      </div>

      <!-- 최근 일기 -->
      <div class="recent-section">
        <div class="section-header">
          <h3 class="section-title">최근 일기</h3>
          <NuxtLink v-if="recentDiaries.length > 0" to="/insights" class="view-all-btn">
            전체 보기 →
          </NuxtLink>
        </div>
        <div v-if="recentDiaries.length === 0" class="empty-recent">
          <p>자유롭게 당신의 이야기를 들려주세요...</p>
        </div>
        <div v-else class="recent-list">
          <div
            v-for="diary in recentDiaries"
            :key="diary.id"
            class="recent-item"
            @click="openDiary(diary)"
          >
            <span class="recent-emoji">{{ getMoodEmoji(diary.mood) }}</span>
            <div class="recent-info">
              <div class="recent-date">{{ diary.date }}</div>
              <div class="recent-preview">{{ diary.content.substring(0, 30) }}...</div>
            </div>
          </div>
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

          <!-- 이미지 갤러리 -->
          <ImageGallery v-if="selectedDiary.images && selectedDiary.images.length > 0" :imageIds="selectedDiary.images" />

          <button @click="deleteDiary" class="modal-delete">
            🗑️ 삭제하기
          </button>
        </div>
      </div>

      <!-- 액션 버튼 -->
      <div class="action-section">
        <NuxtLink to="/write" class="btn-write">
          작성하기
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const { getAll } = useDiary()

const moods = {
  happy: '😊',
  calm: '😌',
  sad: '😔',
  angry: '😤',
  tired: '😴'
}

const stats = ref({
  streak: 0,
  thisMonth: 0,
  achievement: 0
})

const recentDiaries = ref([])
const selectedDiary = ref(null)
const isLoading = ref(true)

const getMoodEmoji = (mood) => moods[mood] || '😊'

const openDiary = (diary) => {
  selectedDiary.value = diary
}

const closeDiary = () => {
  selectedDiary.value = null
}

const deleteDiary = () => {
  if (!selectedDiary.value) return

  if (confirm('정말로 이 일기를 삭제하시겠습니까?')) {
    const allDiaries = getAll()
    const filteredDiaries = allDiaries.filter(d => d.id !== selectedDiary.value.id)

    // LocalStorage에 저장
    localStorage.setItem('diaries', JSON.stringify(filteredDiaries))

    // 상태 업데이트
    closeDiary()
    calculateStats()
  }
}

const calculateStats = () => {
  const diaries = getAll()
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  // 이번 달 일기 수
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

  // 최근 일기 3개
  recentDiaries.value = sortedDiaries.slice(0, 3)
}

onMounted(async () => {
  // 로딩 시뮬레이션 (실제 데이터 로드)
  isLoading.value = true

  // 최소 로딩 시간 보장 (UX 개선)
  await new Promise(resolve => setTimeout(resolve, 800))

  calculateStats()
  isLoading.value = false
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
  padding: 40px 20px;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 8px var(--shadow);
  transition: all 0.2s;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px var(--shadow-hover);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
}

.recent-section {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px var(--shadow);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.view-all-btn {
  font-size: 0.9rem;
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.view-all-btn:hover {
  color: var(--accent-secondary);
}

.empty-recent {
  text-align: center;
  padding: 32px;
  color: var(--text-tertiary);
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 8px;
  background: var(--bg-hover);
  transition: all 0.2s;
  cursor: pointer;
}

.recent-item:hover {
  background: var(--bg-hover-deep);
  transform: translateY(-1px);
}

.recent-emoji {
  font-size: 1.8rem;
}

.recent-info {
  flex: 1;
}

.recent-date {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.recent-preview {
  font-size: 0.9rem;
  color: var(--text-body);
}

.action-section {
  display: flex;
  justify-content: center;
}

.btn-write {
  width: 100%;
  max-width: 400px;
  padding: 18px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-write:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px var(--accent-shadow);
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
  transition: all 0.2s;
}

.modal-close:hover {
  background: var(--bg-hover);
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
}

.modal-prompt {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-body);
  background: var(--bg-hover);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.modal-body {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--text-body);
  white-space: pre-wrap;
  margin-bottom: 20px;
}

.modal-delete {
  width: 100%;
  padding: 14px;
  background: var(--delete-bg);
  color: var(--delete-text);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-delete:hover {
  background: var(--delete-bg-hover);
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .title {
    font-size: 1.8rem;
  }

  .btn-write {
    font-size: 1rem;
    padding: 16px;
  }

  .modal-content {
    padding: 24px;
  }
}
</style>
