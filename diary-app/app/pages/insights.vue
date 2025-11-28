<template>
  <!-- 로딩 스켈레톤 -->
  <InsightsSkeleton v-if="isLoading" />

  <!-- 실제 컨텐츠 -->
  <div v-else class="container">
    <div class="content">
      <!-- 헤더 -->
      <div class="header">
        <NuxtLink to="/" class="back-btn">← 홈으로</NuxtLink>
        <h1 class="title">감정 대시보드</h1>
        <p class="subtitle">나의 감정 여정을 살펴보세요</p>
      </div>

      <!-- 📅 필터 표시 (이번 달 등) -->
      <div v-if="activeFilter" class="filter-banner">
        <span class="filter-icon">📅</span>
        <span class="filter-text">
          {{ activeFilter === 'thisMonth' ? '이번 달 일기만 보기' : activeFilter }}
        </span>
        <button @click="clearFilter" class="filter-clear">✕ 필터 해제</button>
      </div>

      <!-- 🔍 검색창 -->
      <div class="search-section">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="일기 내용, 날짜로 검색..."
            class="search-input"
            @input="handleSearch"
            @focus="showDropdown = true"
          />
          <button v-if="searchQuery" @click="clearSearch" class="search-clear">✕</button>
        </div>

        <!-- 🔍 검색 드롭다운 -->
        <div v-if="searchQuery && showDropdown && !isSearching" class="search-dropdown">
          <div v-if="filteredDiaries.length > 0" class="dropdown-header">
            🔍 "{{ searchQuery }}" 검색 결과: {{ filteredDiaries.length }}개
          </div>
          <div v-if="filteredDiaries.length === 0" class="dropdown-empty">
            😢 "{{ searchQuery }}"에 대한 검색 결과가 없습니다.
          </div>
          <div
            v-for="diary in filteredDiaries.slice(0, 5)"
            :key="diary.id"
            class="dropdown-item"
            @click="openDiaryModal(diary)"
          >
            <span class="dropdown-emoji">{{ getMoodEmoji(diary.mood) }}</span>
            <div class="dropdown-info">
              <div class="dropdown-date">{{ diary.date }}</div>
              <div class="dropdown-preview">{{ diary.content.substring(0, 40) }}...</div>
            </div>
          </div>
          <div v-if="filteredDiaries.length > 5" class="dropdown-more">
            + {{ filteredDiaries.length - 5 }}개 더 있음
          </div>
        </div>

        <div v-if="isSearching" class="search-loading">
          🔄 검색 중...
        </div>
      </div>

      <!-- 🔍 검색 결과 일기 모달 -->
      <div v-if="selectedDiary" class="modal-overlay" @click="closeDiaryModal">
        <div class="modal-content" @click.stop>
          <button @click="closeDiaryModal" class="modal-close">✕</button>
          <div class="modal-header">
            <span class="modal-emoji">{{ getMoodEmoji(selectedDiary.mood) }}</span>
            <span class="modal-date">{{ selectedDiary.date }}</span>
          </div>
          <p v-if="selectedDiary.prompt" class="modal-prompt">{{ selectedDiary.prompt }}</p>
          <div class="modal-body">
            {{ selectedDiary.content }}
          </div>

          <!-- 이미지 갤러리 -->
          <ImageGallery v-if="selectedDiary.images && selectedDiary.images.length > 0" :imageIds="selectedDiary.images" />

          <!-- AI 분석 결과 -->
          <div v-if="selectedDiary.emotion" class="ai-analysis">
            <div class="analysis-header">🧠 AI 감정 분석</div>
            <div class="analysis-content">
              <div class="analysis-item">
                <span class="analysis-label">감정:</span>
                <span class="analysis-value">
                  {{ getMoodEmoji(selectedDiary.emotion) }} {{ getMoodLabel(selectedDiary.emotion) }}
                  <span v-if="selectedDiary.emotionScore" class="analysis-score">({{ selectedDiary.emotionScore }}점)</span>
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
            </div>
          </div>

          <div class="modal-actions">
            <button @click="editDiary" class="modal-edit">
              ✏️ 수정하기
            </button>
            <button @click="deleteDiaryFromModal" class="modal-delete">
              🗑️ 삭제하기
            </button>
          </div>
        </div>
      </div>

      <div v-if="diaries.length === 0 && !searchQuery" class="empty-state">
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
          <h2 class="section-title">
            {{ searchQuery ? '검색 결과' : (activeFilter === 'thisMonth' ? '📅 이번 달 일기' : '최근 일기') }}
            <span v-if="filteredDiaries.length > 0" class="diary-count">({{ filteredDiaries.length }}개)</span>
          </h2>
          <div class="diary-list">
            <div
              v-for="diary in filteredDiaries"
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
/**
 * 📊 감정 대시보드 페이지
 * - 백엔드 API에서 일기 데이터를 가져와 통계를 표시합니다
 * - getAll()은 이제 async 함수입니다 (GET /api/diaries)
 * - 🔍 검색 기능 추가됨!
 */
const { getAll } = useDiary()

const diaries = ref([])
const expandedDiaries = ref([])
const isLoading = ref(true)

// 🔍 검색 관련 상태
const searchQuery = ref('')
const filteredDiaries = ref([])
const isSearching = ref(false)
const showDropdown = ref(false)
const selectedDiary = ref(null)  // 모달용
let searchTimeout = null  // 디바운스용

const router = useRouter()
const route = useRoute()

// 📅 필터 상태 (이번 달 필터 등)
const activeFilter = ref(null)  // 'thisMonth' or null

const moods = {
  happy: '😊',
  calm: '😌',
  sad: '😔',
  angry: '😤',
  tired: '😴',
  excited: '🤩'  // 백엔드 샘플 데이터 지원
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

/**
 * 📊 통계 계산 함수
 * - 백엔드 API에서 일기 데이터를 가져와 통계를 계산합니다
 */
const calculateStats = async () => {
  console.log('📊 [insights.vue] 통계 계산 시작...')

  try {
    // 📌 백엔드에서 모든 일기 조회 (GET /api/diaries)
    console.log('📊 [insights.vue] 백엔드 API 호출: GET /api/diaries')
    const allDiaries = await getAll()
    console.log(`📊 [insights.vue] 총 ${allDiaries.length}개의 일기 조회됨`)

    diaries.value = allDiaries
    filteredDiaries.value = allDiaries  // 🔍 초기에는 전체 목록 표시

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

    console.log('✅ [insights.vue] 통계 계산 완료!')
  } catch (error) {
    console.error('❌ [insights.vue] 통계 계산 실패:', error)
  }
}

const toggleDiary = (id) => {
  const index = expandedDiaries.value.indexOf(id)
  if (index > -1) {
    expandedDiaries.value.splice(index, 1)
  } else {
    expandedDiaries.value.push(id)
  }
}

/**
 * 🔍 검색 함수 (디바운스 적용)
 * - 입력 후 300ms 대기 후 검색 실행
 * - 백엔드 API에 검색 요청
 */
const handleSearch = () => {
  // 이전 타이머 취소
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  // 검색어가 없으면 전체 목록 표시
  if (!searchQuery.value.trim()) {
    filteredDiaries.value = diaries.value
    return
  }

  isSearching.value = true
  console.log(`🔍 [insights.vue] 검색 대기 중: "${searchQuery.value}"`)

  // 300ms 디바운스
  searchTimeout = setTimeout(async () => {
    try {
      console.log(`🔍 [insights.vue] 검색 실행: "${searchQuery.value}"`)

      // 📌 백엔드 API 호출 (search 파라미터 사용)
      const result = await getAll({ search: searchQuery.value })

      filteredDiaries.value = result
      console.log(`🔍 [insights.vue] 검색 결과: ${result.length}개`)
    } catch (error) {
      console.error('❌ [insights.vue] 검색 실패:', error)
      filteredDiaries.value = []
    } finally {
      isSearching.value = false
    }
  }, 300)
}

/**
 * 🔍 검색 초기화
 */
const clearSearch = () => {
  console.log('🔍 [insights.vue] 검색 초기화')
  searchQuery.value = ''
  filteredDiaries.value = diaries.value
  isSearching.value = false
  showDropdown.value = false
}

/**
 * 📖 일기 모달 열기
 */
const openDiaryModal = (diary) => {
  console.log('📖 [insights.vue] 일기 모달 열기:', diary.id)
  selectedDiary.value = diary
  showDropdown.value = false  // 드롭다운 닫기
}

/**
 * 📖 일기 모달 닫기
 */
const closeDiaryModal = () => {
  console.log('📖 [insights.vue] 일기 모달 닫기')
  selectedDiary.value = null
}

/**
 * ✏️ 일기 수정 페이지로 이동
 */
const editDiary = () => {
  if (!selectedDiary.value) return
  console.log('✏️ [insights.vue] 일기 수정 페이지로 이동:', selectedDiary.value.id)
  router.push(`/write?edit=${selectedDiary.value.id}`)
}

/**
 * 🗑️ 일기 삭제 (모달에서)
 */
const { deleteDiary: removeDiary } = useDiary()

const deleteDiaryFromModal = async () => {
  if (!selectedDiary.value) return

  if (confirm('정말로 이 일기를 삭제하시겠습니까?')) {
    console.log('🗑️ [insights.vue] 일기 삭제 시작...')

    try {
      await removeDiary(selectedDiary.value.id)
      console.log('✅ [insights.vue] 일기 삭제 완료!')

      closeDiaryModal()

      // 통계 다시 계산
      await calculateStats()
    } catch (error) {
      console.error('❌ [insights.vue] 일기 삭제 실패:', error)
      alert('일기를 삭제하는 중 오류가 발생했습니다.')
    }
  }
}

// 📌 페이지 로드 시 통계 계산
onMounted(async () => {
  console.log('🚀 [insights.vue] 페이지 로드...')
  isLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  await calculateStats()

  // 📅 URL 쿼리 파라미터 확인 (이번 달 필터)
  if (route.query.filter === 'thisMonth') {
    console.log('📅 [insights.vue] 이번 달 필터 적용')
    activeFilter.value = 'thisMonth'
    applyThisMonthFilter()
  }

  isLoading.value = false
  console.log('✅ [insights.vue] 페이지 로드 완료!')
})

/**
 * 📅 이번 달 필터 적용
 */
const applyThisMonthFilter = () => {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  filteredDiaries.value = diaries.value.filter(diary => {
    const diaryDate = new Date(diary.date)
    return diaryDate.getMonth() === currentMonth && diaryDate.getFullYear() === currentYear
  })

  console.log(`📅 [insights.vue] 이번 달 일기: ${filteredDiaries.value.length}개`)
}

/**
 * 📅 필터 해제
 */
const clearFilter = () => {
  console.log('📅 [insights.vue] 필터 해제')
  activeFilter.value = null
  filteredDiaries.value = diaries.value
  router.replace('/insights')  // URL에서 쿼리 파라미터 제거
}
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

/* 📅 필터 배너 */
.filter-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: white;
  padding: 14px 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px var(--accent-shadow);
}

.filter-icon {
  font-size: 1.3rem;
}

.filter-text {
  flex: 1;
  font-weight: 600;
  font-size: 1rem;
}

.filter-clear {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.filter-clear:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 🔍 검색창 스타일 */
.search-section {
  margin-bottom: 24px;
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px var(--shadow);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.search-box:focus-within {
  border-color: var(--accent-primary);
  box-shadow: 0 4px 12px var(--accent-shadow);
}

.search-icon {
  font-size: 1.2rem;
  margin-right: 12px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-clear {
  background: var(--bg-hover-deep);
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 0.9rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-clear:hover {
  background: var(--accent-primary);
  color: white;
}

/* 🔍 검색 드롭다운 */
.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: 0 8px 24px var(--shadow-modal);
  margin-top: 8px;
  z-index: 100;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.dropdown-header {
  padding: 12px 16px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border-color);
}

.dropdown-empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--text-tertiary);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid var(--border-color);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: var(--bg-hover);
}

.dropdown-emoji {
  font-size: 1.5rem;
}

.dropdown-info {
  flex: 1;
  min-width: 0;
}

.dropdown-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.dropdown-preview {
  font-size: 0.9rem;
  color: var(--text-body);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-more {
  padding: 12px 16px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--accent-primary);
  background: var(--bg-hover);
}

.search-loading {
  margin-top: 12px;
  padding: 8px 16px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  background: var(--bg-hover);
  border-radius: 8px;
}

.search-section {
  position: relative;  /* 드롭다운 포지션 기준 */
}

/* 모달 스타일 */
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
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 8px var(--shadow);
  transition: background 0.3s ease;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.mood-analysis {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px var(--shadow);
  transition: background 0.3s ease;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.diary-count {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
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
  background: var(--bg-hover);
  transition: background 0.3s ease;
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
  color: var(--text-body);
  transition: color 0.3s ease;
}

.mood-bar {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  transition: background 0.3s ease;
}

.mood-bar-fill {
  height: 100%;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  border-radius: 4px;
  transition: width 0.3s;
}

.mood-count {
  font-size: 0.85rem;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.diary-section {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px var(--shadow);
  transition: background 0.3s ease;
}

.diary-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.diary-card {
  background: var(--bg-hover);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s;
}

.diary-card:hover {
  background: var(--bg-hover-deep);
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
  color: var(--text-secondary);
  font-weight: 600;
  transition: color 0.3s ease;
}

.expand-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.3s ease;
}

.diary-prompt {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-body);
  margin-bottom: 12px;
  padding: 10px;
  background: var(--bg-card);
  border-radius: 8px;
  transition: background 0.3s ease, color 0.3s ease;
}

.diary-content {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-body);
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: max-height 0.3s, color 0.3s ease;
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
