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
        <NuxtLink to="/insights?filter=thisMonth" class="stat-card">
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

          <!-- AI 분석 결과 -->
          <div v-if="selectedDiary.emotion" class="ai-analysis">
            <div class="analysis-header">
              <span>🤖 AI 감정 분석</span>
              <span v-if="selectedDiary.aiSource === 'gemini'" class="ai-badge gemini">Gemini</span>
              <span v-else class="ai-badge local">Local</span>
            </div>
            <div class="analysis-content">
              <div class="analysis-item">
                <span class="analysis-label">감정:</span>
                <span class="analysis-value">
                  {{ getMoodEmoji(selectedDiary.emotion) }} {{ getMoodLabel(selectedDiary.emotion) }}
                  <span class="analysis-score">({{ selectedDiary.emotionScore }}점)</span>
                </span>
              </div>
              <div class="analysis-item" v-if="selectedDiary.keywords && selectedDiary.keywords.length > 0">
                <span class="analysis-label">키워드:</span>
                <span class="analysis-value">
                  <span v-for="(keyword, index) in selectedDiary.keywords" :key="index" class="keyword-tag">
                    {{ keyword }}
                  </span>
                </span>
              </div>
              <div class="analysis-item" v-if="selectedDiary.feedback">
                <span class="analysis-label">피드백:</span>
                <span class="analysis-value feedback-text">{{ selectedDiary.feedback }}</span>
              </div>
              <div class="analysis-item advice-item" v-if="selectedDiary.advice">
                <span class="analysis-label">💡 조언:</span>
                <span class="analysis-value advice-text">{{ selectedDiary.advice }}</span>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="editDiary" class="modal-edit">
              ✏️ 수정하기
            </button>
            <button @click="deleteDiary" class="modal-delete">
              🗑️ 삭제하기
            </button>
          </div>
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
/**
 * 📌 useDiary에서 API 호출 함수들을 가져옵니다.
 * - getAll: GET /api/diaries (전체 일기 조회)
 * - deleteDiary: DELETE /api/diaries/:id (일기 삭제)
 *
 * ⚠️ 중요: 이 함수들은 이제 모두 async 함수입니다!
 */
const { getAll, deleteDiary: removeDiary } = useDiary()

// 📌 기분 이모지 매핑
const moods = {
  happy: '😊',
  calm: '😌',
  sad: '😔',
  angry: '😤',
  tired: '😴',
  excited: '🤩'  // 백엔드 샘플 데이터에 있는 mood 추가
}

// 📌 기분 한글 라벨 매핑
const moodLabels = {
  happy: '행복',
  calm: '평온',
  sad: '우울',
  angry: '화남',
  tired: '피곤',
  excited: '신남'
}

// 📌 통계 데이터 (반응형)
const stats = ref({
  streak: 0,
  thisMonth: 0,
  achievement: 0
})

// 📌 최근 일기 목록 (반응형)
const recentDiaries = ref([])

// 📌 선택된 일기 (모달에서 사용)
const selectedDiary = ref(null)

// 📌 로딩 상태
const isLoading = ref(true)

// 📌 기분 이모지 반환 함수
const getMoodEmoji = (mood) => moods[mood] || '😊'

// 📌 기분 라벨 반환 함수
const getMoodLabel = (mood) => moodLabels[mood] || mood

// 📌 일기 모달 열기
const openDiary = (diary) => {
  console.log('📖 [index.vue] 일기 모달 열기:', diary.id)
  selectedDiary.value = diary
}

// 📌 일기 모달 닫기
const closeDiary = () => {
  console.log('📖 [index.vue] 일기 모달 닫기')
  selectedDiary.value = null
}

// 📌 일기 수정 페이지로 이동
const editDiary = () => {
  if (!selectedDiary.value) return
  console.log('✏️ [index.vue] 일기 수정 페이지로 이동:', selectedDiary.value.id)
  navigateTo(`/write?edit=${selectedDiary.value.id}`)
}

/**
 * 🗑️ 일기 삭제 함수
 * - 이제 백엔드 API를 호출합니다 (DELETE /api/diaries/:id)
 */
const deleteDiary = async () => {
  if (!selectedDiary.value) return

  if (confirm('정말로 이 일기를 삭제하시겠습니까?')) {
    console.log('🗑️ [index.vue] 일기 삭제 시작...')

    try {
      const diary = selectedDiary.value

      // 1. 첨부된 이미지 먼저 삭제 (IndexedDB에서)
      if (diary.images && diary.images.length > 0) {
        console.log('🖼️ [index.vue] 첨부 이미지 삭제 중...', diary.images)
        const { deleteImages } = useImageDB()
        await deleteImages(diary.images)
      }

      // 2. 📌 일기 데이터 삭제 (백엔드 API 호출)
      // ⚠️ removeDiary는 이제 async 함수이므로 await 필요!
      console.log('🗑️ [index.vue] 백엔드 API 호출: DELETE /api/diaries/' + diary.id)
      await removeDiary(diary.id)

      console.log('✅ [index.vue] 일기 삭제 완료!')

      // 3. 상태 업데이트
      closeDiary()

      // 📌 삭제 후 통계 다시 계산 (API 재호출)
      await calculateStats()

    } catch (error) {
      console.error('❌ [index.vue] 일기 삭제 중 오류:', error)
      alert('일기를 삭제하는 중 오류가 발생했습니다.')
    }
  }
}

/**
 * 📊 통계 계산 함수
 * - 이제 백엔드 API를 호출합니다 (GET /api/diaries)
 *
 * ⚠️ 중요: getAll()이 이제 async 함수이므로 await 필요!
 */
const calculateStats = async () => {
  console.log('📊 [index.vue] 통계 계산 시작...')

  try {
    // 📌 백엔드에서 모든 일기 조회 (API 호출)
    console.log('📊 [index.vue] 백엔드 API 호출: GET /api/diaries')
    const diaries = await getAll()

    console.log(`📊 [index.vue] 총 ${diaries.length}개의 일기를 받아왔습니다.`)

    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    // 📌 이번 달 일기 수 계산
    const thisMonthDiaries = diaries.filter(d => {
      const diaryDate = new Date(d.date)
      return diaryDate.getMonth() === currentMonth && diaryDate.getFullYear() === currentYear
    })
    stats.value.thisMonth = thisMonthDiaries.length
    console.log(`📊 [index.vue] 이번 달 일기: ${thisMonthDiaries.length}개`)

    // 📌 연속 작성일 계산
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
    console.log(`📊 [index.vue] 연속 작성일: ${streak}일`)

    // 📌 달성률 계산 (이번 달 일수 대비)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    stats.value.achievement = Math.min(100, Math.round((thisMonthDiaries.length / daysInMonth) * 100))
    console.log(`📊 [index.vue] 달성률: ${stats.value.achievement}%`)

    // 📌 최근 일기 3개 저장
    recentDiaries.value = sortedDiaries.slice(0, 3)
    console.log(`📊 [index.vue] 최근 일기 ${recentDiaries.value.length}개 표시`)

  } catch (error) {
    console.error('❌ [index.vue] 통계 계산 중 오류:', error)
    // 에러 발생 시 기본값 유지
    recentDiaries.value = []
  }
}

/**
 * 🚀 컴포넌트 마운트 시 실행
 * - 백엔드에서 데이터를 가져와 통계를 계산합니다
 */
onMounted(async () => {
  console.log('🚀 [index.vue] 페이지 로드 시작...')

  // 로딩 상태 시작
  isLoading.value = true

  // 📌 최소 로딩 시간 보장 (UX 개선 - 너무 빠르면 깜빡임)
  await new Promise(resolve => setTimeout(resolve, 500))

  // 📌 백엔드에서 데이터 가져오기 및 통계 계산
  await calculateStats()

  // 로딩 완료
  isLoading.value = false
  console.log('✅ [index.vue] 페이지 로드 완료!')
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

/* AI 분석 결과 */
.ai-analysis {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.analysis-header {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0369a1;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.analysis-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.analysis-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #075985;
}

.analysis-value {
  font-size: 1rem;
  color: #0c4a6e;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.analysis-score {
  font-size: 0.9rem;
  color: #0284c7;
  font-weight: 600;
}

.keyword-tag {
  display: inline-block;
  background: #0ea5e9;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 600;
}

.feedback-text {
  line-height: 1.6;
  font-style: italic;
}

.advice-item {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  padding: 12px;
  border-radius: 8px;
  margin-top: 8px;
}

.advice-text {
  line-height: 1.6;
  color: #92400e;
  font-weight: 500;
}

.ai-badge {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.ai-badge.gemini {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.ai-badge.local {
  background: #e5e7eb;
  color: #6b7280;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-edit {
  flex: 1;
  padding: 14px;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-edit:hover {
  background: var(--accent-secondary);
  transform: translateY(-1px);
}

.modal-delete {
  flex: 1;
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
