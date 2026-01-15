<template>
  <!-- 로딩 스켈레톤 -->
  <InsightsSkeleton v-if="isLoading" />

  <!-- 실제 컨텐츠 -->
  <div v-else class="insights-page">
    <!-- Ambient Background -->
    <div class="ambient-bg"></div>

    <div class="insights-content">
      <!-- 헤더 -->
      <header class="insights-header animate-fade-in">
        <NuxtLink to="/" class="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>홈으로</span>
        </NuxtLink>
        <div class="header-text">
          <span class="header-label">Insights</span>
          <h1 class="header-title">감정 대시보드</h1>
          <p class="header-subtitle">나의 감정 여정을 살펴보세요</p>
        </div>
      </header>

      <!-- 필터 배너 -->
      <Transition name="slide-fade">
        <div v-if="activeFilter" class="filter-banner animate-fade-in">
          <div class="filter-content">
            <svg class="filter-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span class="filter-text">
              {{ activeFilter === 'thisMonth' ? '이번 달 일기만 보기' : activeFilter }}
            </span>
          </div>
          <button @click="clearFilter" class="filter-clear">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            필터 해제
          </button>
        </div>
      </Transition>

      <!-- 검색창 -->
      <div class="search-section animate-fade-in" style="animation-delay: 0.1s;">
        <div class="search-box" :class="{ focused: isSearchFocused }">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="일기 내용, 날짜로 검색..."
            class="search-input"
            @input="handleSearch"
            @focus="isSearchFocused = true; showDropdown = true"
            @blur="isSearchFocused = false"
          />
          <Transition name="fade">
            <button v-if="searchQuery" @click="clearSearch" class="search-clear">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </Transition>
        </div>

        <!-- 검색 드롭다운 -->
        <Transition name="dropdown">
          <div v-if="searchQuery && showDropdown && !isSearching" class="search-dropdown">
            <div v-if="filteredDiaries.length > 0" class="dropdown-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              "{{ searchQuery }}" 검색 결과: {{ filteredDiaries.length }}개
            </div>
            <div v-if="filteredDiaries.length === 0" class="dropdown-empty">
              <span class="empty-icon">🔍</span>
              <p>"{{ searchQuery }}"에 대한 검색 결과가 없습니다.</p>
            </div>
            <div
              v-for="diary in filteredDiaries.slice(0, 5)"
              :key="diary.id"
              class="dropdown-item"
              @click="openDiaryModal(diary)"
            >
              <div class="dropdown-emoji" :style="{ background: getEmotionBg(diary.mood) }">
                {{ getMoodEmoji(diary.mood) }}
              </div>
              <div class="dropdown-info">
                <div class="dropdown-date">{{ diary.date }}</div>
                <div class="dropdown-preview">{{ diary.content.substring(0, 40) }}...</div>
              </div>
              <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
            <div v-if="filteredDiaries.length > 5" class="dropdown-more">
              + {{ filteredDiaries.length - 5 }}개 더 있음
            </div>
          </div>
        </Transition>

        <Transition name="fade">
          <div v-if="isSearching" class="search-loading">
            <div class="loading-spinner"></div>
            <span>검색 중...</span>
          </div>
        </Transition>
      </div>

      <!-- Empty State -->
      <div v-if="diaries.length === 0 && !searchQuery" class="empty-state animate-fade-in">
        <div class="empty-illustration">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <p class="empty-text">아직 작성된 일기가 없습니다</p>
        <p class="empty-subtext">첫 일기를 작성하고 감정 여정을 시작해보세요</p>
        <NuxtLink to="/write" class="btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          첫 일기 쓰러 가기
        </NuxtLink>
      </div>

      <div v-else class="insights-grid">
        <!-- 통계 카드 -->
        <div class="stats-row animate-fade-in" style="animation-delay: 0.15s;">
          <div class="stat-card">
            <div class="stat-icon-wrap" style="--stat-color: var(--emotion-happy);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.streak }}일</span>
              <span class="stat-label">연속 작성</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrap" style="--stat-color: var(--emotion-calm);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.thisMonth }}개</span>
              <span class="stat-label">이번 달</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrap" style="--stat-color: var(--accent);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.achievement }}%</span>
              <span class="stat-label">달성률</span>
            </div>
          </div>
        </div>

        <!-- 기분 분석 카드 -->
        <div class="mood-analysis-card animate-fade-in" style="animation-delay: 0.2s;">
          <div class="card-header">
            <h2 class="card-title">감정 분포</h2>
            <span class="card-badge">{{ diaries.length }}개 분석</span>
          </div>
          <div class="mood-stats">
            <div
              v-for="(count, mood) in moodStats"
              :key="mood"
              class="mood-stat-item"
              :class="{ active: count > 0 }"
            >
              <div class="mood-emoji-wrap" :style="{ background: getEmotionBg(mood) }">
                {{ getMoodEmoji(mood) }}
              </div>
              <div class="mood-stat-info">
                <div class="mood-stat-header">
                  <span class="mood-name">{{ getMoodLabel(mood) }}</span>
                  <span class="mood-count">{{ count }}회</span>
                </div>
                <div class="mood-bar">
                  <div
                    class="mood-bar-fill"
                    :style="{
                      width: getMoodPercentage(count) + '%',
                      background: `var(--emotion-${mood})`
                    }"
                  ></div>
                </div>
                <span class="mood-percentage">{{ getMoodPercentage(count) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 일기 목록 -->
        <div class="diary-list-card animate-fade-in" style="animation-delay: 0.25s;">
          <div class="card-header">
            <h2 class="card-title">
              {{ searchQuery ? '검색 결과' : (activeFilter === 'thisMonth' ? '이번 달 일기' : '최근 일기') }}
            </h2>
            <span v-if="filteredDiaries.length > 0" class="card-badge">{{ filteredDiaries.length }}개</span>
          </div>
          <div class="diary-list">
            <TransitionGroup name="list">
              <div
                v-for="(diary, index) in filteredDiaries"
                :key="diary.id"
                class="diary-item"
                :style="{ animationDelay: `${index * 0.05}s` }"
                @click="toggleDiary(diary.id)"
              >
                <div class="diary-item-main">
                  <div class="diary-emoji" :style="{ background: getEmotionBg(diary.mood) }">
                    {{ getMoodEmoji(diary.mood) }}
                  </div>
                  <div class="diary-info">
                    <span class="diary-date">{{ diary.date }}</span>
                    <p class="diary-prompt">{{ diary.prompt || '오늘의 일기' }}</p>
                  </div>
                  <button class="expand-btn" :class="{ expanded: expandedDiaries.includes(diary.id) }">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                </div>
                <Transition name="expand">
                  <div v-if="expandedDiaries.includes(diary.id)" class="diary-content-expanded">
                    <p class="diary-content-text">{{ diary.content }}</p>
                    <div class="diary-actions">
                      <button @click.stop="openDiaryModal(diary)" class="action-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        자세히 보기
                      </button>
                    </div>
                  </div>
                </Transition>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>
    </div>

    <!-- 일기 모달 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedDiary" class="modal-overlay" @click="closeDiaryModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header" :style="{ background: getEmotionGradient(selectedDiary.mood) }">
              <button @click="closeDiaryModal" class="modal-close">
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

              <!-- 이미지 갤러리 -->
              <ImageGallery v-if="selectedDiary.images && selectedDiary.images.length > 0" :imageIds="selectedDiary.images" />

              <!-- AI 분석 결과 -->
              <div v-if="selectedDiary.emotion" class="ai-analysis">
                <div class="analysis-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
                    <path d="M12 2a10 10 0 0 1 10 10"/>
                    <circle cx="12" cy="12" r="6"/>
                  </svg>
                  AI 감정 분석
                </div>
                <div class="analysis-content">
                  <div class="analysis-item">
                    <span class="analysis-label">감정</span>
                    <span class="analysis-value">
                      {{ getMoodEmoji(selectedDiary.emotion) }} {{ getMoodLabel(selectedDiary.emotion) }}
                      <span v-if="selectedDiary.emotionScore" class="analysis-score">({{ selectedDiary.emotionScore }}점)</span>
                    </span>
                  </div>
                  <div v-if="selectedDiary.keywords && selectedDiary.keywords.length > 0" class="analysis-item">
                    <span class="analysis-label">키워드</span>
                    <div class="keyword-tags">
                      <span v-for="(keyword, index) in selectedDiary.keywords" :key="index" class="keyword-tag">
                        {{ keyword }}
                      </span>
                    </div>
                  </div>
                  <div v-if="selectedDiary.feedback" class="analysis-item feedback-item">
                    <span class="analysis-label">피드백</span>
                    <p class="feedback-text">{{ selectedDiary.feedback }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button @click="editDiary" class="modal-btn edit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                수정하기
              </button>
              <button @click="deleteDiaryFromModal" class="modal-btn delete">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                삭제하기
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
/**
 * 📊 감정 대시보드 페이지
 */
const { getAll } = useDiary()

const diaries = ref([])
const expandedDiaries = ref([])
const isLoading = ref(true)

// 검색 관련 상태
const searchQuery = ref('')
const filteredDiaries = ref([])
const isSearching = ref(false)
const showDropdown = ref(false)
const selectedDiary = ref(null)
const isSearchFocused = ref(false)
let searchTimeout = null

const router = useRouter()
const route = useRoute()

// 필터 상태
const activeFilter = ref(null)

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
 * 통계 계산 함수
 */
const calculateStats = async () => {
  try {
    const allDiaries = await getAll()
    diaries.value = allDiaries
    filteredDiaries.value = allDiaries

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

    // 달성률
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
  } catch (error) {
    console.error('통계 계산 실패:', error)
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
 * 검색 함수 (디바운스)
 */
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (!searchQuery.value.trim()) {
    filteredDiaries.value = diaries.value
    return
  }

  isSearching.value = true

  searchTimeout = setTimeout(async () => {
    try {
      const result = await getAll({ search: searchQuery.value })
      filteredDiaries.value = result
    } catch (error) {
      console.error('검색 실패:', error)
      filteredDiaries.value = []
    } finally {
      isSearching.value = false
    }
  }, 300)
}

const clearSearch = () => {
  searchQuery.value = ''
  filteredDiaries.value = diaries.value
  isSearching.value = false
  showDropdown.value = false
}

const openDiaryModal = (diary) => {
  selectedDiary.value = diary
  showDropdown.value = false
}

const closeDiaryModal = () => {
  selectedDiary.value = null
}

const editDiary = () => {
  if (!selectedDiary.value) return
  router.push(`/write?edit=${selectedDiary.value.id}`)
}

const { deleteDiary: removeDiary } = useDiary()

const deleteDiaryFromModal = async () => {
  if (!selectedDiary.value) return

  if (confirm('정말로 이 일기를 삭제하시겠습니까?')) {
    try {
      await removeDiary(selectedDiary.value.id)
      closeDiaryModal()
      await calculateStats()
    } catch (error) {
      console.error('일기 삭제 실패:', error)
      alert('일기를 삭제하는 중 오류가 발생했습니다.')
    }
  }
}

const applyThisMonthFilter = () => {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  filteredDiaries.value = diaries.value.filter(diary => {
    const diaryDate = new Date(diary.date)
    return diaryDate.getMonth() === currentMonth && diaryDate.getFullYear() === currentYear
  })
}

const clearFilter = () => {
  activeFilter.value = null
  filteredDiaries.value = diaries.value
  router.replace('/insights')
}

onMounted(async () => {
  isLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 300))
  await calculateStats()

  if (route.query.filter === 'thisMonth') {
    activeFilter.value = 'thisMonth'
    applyThisMonthFilter()
  }

  isLoading.value = false
})
</script>

<style scoped>
.insights-page {
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

.insights-content {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
  position: relative;
  z-index: 1;
}

/* Header */
.insights-header {
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

/* Filter Banner */
.filter-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--accent);
  color: white;
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-5);
  box-shadow: var(--shadow-md);
}

.filter-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.filter-icon {
  opacity: 0.9;
}

.filter-text {
  font-weight: 600;
  font-size: var(--text-sm);
}

.filter-clear {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
}

.filter-clear:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Search Section */
.search-section {
  position: relative;
  margin-bottom: var(--space-6);
}

.search-box {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-5);
  transition: all var(--duration-normal) var(--ease-out);
}

.search-box.focused {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px var(--accent)15;
}

.search-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: var(--text-base);
  color: var(--text-primary);
  outline: none;
  font-family: inherit;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--bg-subtle);
  border: none;
  border-radius: var(--radius-full);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.search-clear:hover {
  background: var(--accent);
  color: white;
}

/* Search Dropdown */
.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  margin-top: var(--space-2);
  z-index: 100;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--text-muted);
  background: var(--bg-subtle);
  border-bottom: 1px solid var(--border-subtle);
}

.dropdown-empty {
  padding: var(--space-8) var(--space-4);
  text-align: center;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: var(--space-2);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
  border-bottom: 1px solid var(--border-subtle);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: var(--bg-hover);
}

.dropdown-emoji {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.dropdown-info {
  flex: 1;
  min-width: 0;
}

.dropdown-date {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-bottom: 2px;
}

.dropdown-preview {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-arrow {
  color: var(--text-muted);
  flex-shrink: 0;
}

.dropdown-more {
  padding: var(--space-3) var(--space-4);
  text-align: center;
  font-size: var(--text-sm);
  color: var(--accent);
  background: var(--bg-subtle);
  font-weight: 500;
}

.search-loading {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-3);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--text-muted);
  background: var(--bg-subtle);
  border-radius: var(--radius-lg);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-default);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

/* Stats Row */
.insights-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  transition: all var(--duration-normal) var(--ease-out);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  background: var(--stat-color, var(--accent))15;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--stat-color, var(--accent));
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* Mood Analysis Card */
.mood-analysis-card {
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

.mood-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.mood-stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-subtle);
  border-radius: var(--radius-xl);
  opacity: 0.6;
  transition: all var(--duration-normal) var(--ease-out);
}

.mood-stat-item.active {
  opacity: 1;
}

.mood-stat-item:hover {
  background: var(--bg-hover);
}

.mood-emoji-wrap {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.mood-stat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.mood-stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mood-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.mood-count {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.mood-bar {
  height: 8px;
  background: var(--border-subtle);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.mood-bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.6s var(--ease-out);
}

.mood-percentage {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* Diary List Card */
.diary-list-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
}

.diary-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.diary-item {
  background: var(--bg-subtle);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-out);
  cursor: pointer;
}

.diary-item:hover {
  background: var(--bg-hover);
}

.diary-item-main {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
}

.diary-emoji {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.diary-info {
  flex: 1;
  min-width: 0;
}

.diary-date {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-bottom: 2px;
}

.diary-prompt {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.expand-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  flex-shrink: 0;
}

.expand-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.expand-btn.expanded {
  transform: rotate(180deg);
}

.diary-content-expanded {
  padding: 0 var(--space-4) var(--space-4);
  padding-left: calc(48px + var(--space-4) + var(--space-4));
}

.diary-content-text {
  font-size: var(--text-sm);
  line-height: 1.7;
  color: var(--text-secondary);
  white-space: pre-wrap;
  margin-bottom: var(--space-4);
}

.diary-actions {
  display: flex;
  gap: var(--space-2);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.action-btn:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
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
  margin-bottom: var(--space-6);
}

/* AI Analysis */
.ai-analysis {
  background: linear-gradient(135deg, var(--accent)08 0%, var(--accent)04 100%);
  border: 1px solid var(--accent)20;
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  margin-top: var(--space-5);
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--accent);
  margin-bottom: var(--space-4);
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.analysis-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.analysis-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.analysis-value {
  font-size: var(--text-sm);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.analysis-score {
  font-size: var(--text-xs);
  color: var(--accent);
  font-weight: 600;
}

.keyword-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.keyword-tag {
  display: inline-block;
  background: var(--accent);
  color: white;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
}

.feedback-item {
  padding-top: var(--space-3);
  border-top: 1px solid var(--accent)15;
}

.feedback-text {
  font-size: var(--text-sm);
  line-height: 1.7;
  color: var(--text-secondary);
  font-style: italic;
}

.modal-footer {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-subtle);
}

.modal-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  border: none;
  border-radius: var(--radius-xl);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.modal-btn.edit {
  background: var(--accent);
  color: white;
}

.modal-btn.edit:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.modal-btn.delete {
  background: var(--bg-subtle);
  color: var(--text-secondary);
}

.modal-btn.delete:hover {
  background: #ef4444;
  color: white;
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.expand-enter-active,
.expand-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.list-enter-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.list-leave-active {
  transition: all var(--duration-fast) var(--ease-out);
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
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
  .insights-content {
    padding: var(--space-4) var(--space-3);
  }

  .header-title {
    font-size: var(--text-2xl);
  }

  .stats-row {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .stat-card {
    padding: var(--space-4);
  }

  .stat-icon-wrap {
    width: 40px;
    height: 40px;
  }

  .stat-value {
    font-size: var(--text-lg);
  }

  .mood-analysis-card,
  .diary-list-card {
    padding: var(--space-4);
  }

  .mood-stat-item {
    padding: var(--space-3);
  }

  .mood-emoji-wrap {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .diary-emoji {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .diary-content-expanded {
    padding-left: var(--space-4);
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

  .modal-footer {
    flex-direction: column;
    padding: var(--space-4);
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in {
    animation: none;
  }

  .loading-spinner {
    animation: none;
  }
}
</style>
