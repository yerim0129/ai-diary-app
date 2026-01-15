<template>
  <div class="write-container">
    <!-- 배경 효과 -->
    <div class="ambient-bg" :class="selectedMood ? `mood-${selectedMood}` : ''"></div>

    <div class="write-content">
      <!-- 뒤로가기 -->
      <NuxtLink to="/" class="back-link animate-fade-in">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>홈으로</span>
      </NuxtLink>

      <!-- Step 1: 기분 선택 -->
      <Transition name="step" mode="out-in">
        <div v-if="!selectedMood" class="mood-step animate-fade-in-up">
          <div class="step-header">
            <span class="step-badge">Step 1</span>
            <h1 class="step-title">오늘의 기분은 어떤가요?</h1>
            <p class="step-desc">가장 가까운 감정을 선택해주세요</p>
          </div>

          <div class="mood-grid">
            <button
              v-for="(emoji, mood) in moods"
              :key="mood"
              @click="selectMood(mood)"
              class="mood-card"
              :class="`mood-${mood}`"
            >
              <span class="mood-emoji">{{ emoji }}</span>
              <span class="mood-name">{{ getMoodLabel(mood) }}</span>
              <div class="mood-glow"></div>
            </button>
          </div>
        </div>

        <!-- Step 2: 일기 작성 -->
        <div v-else class="write-step animate-fade-in-up">
          <div class="step-header">
            <button @click="resetMood" class="change-mood-btn">
              <span class="selected-emoji">{{ moods[selectedMood] }}</span>
              <span>{{ getMoodLabel(selectedMood) }}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            <h1 class="step-title">{{ editMode ? '일기 수정하기' : '오늘의 이야기' }}</h1>
          </div>

          <!-- AI 추천 프롬프트 -->
          <Transition name="slide-fade">
            <div v-if="aiPrompt" class="ai-prompt-card">
              <div class="ai-prompt-header">
                <div class="ai-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <span class="ai-label">AI 추천 질문</span>
              </div>
              <p class="ai-prompt-text">{{ aiPrompt }}</p>
              <button @click="useAIPrompt" class="use-prompt-btn">
                이 질문으로 작성하기
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </Transition>

          <!-- 현재 프롬프트 -->
          <div class="prompt-section">
            <div class="prompt-card">
              <p class="prompt-text">{{ currentPrompt }}</p>
              <button @click="changePrompt" class="refresh-prompt-btn" title="다른 질문 보기">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 4v6h-6M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 에디터 영역 -->
          <div class="editor-section" :class="{ 'is-focused': isEditorFocused }">
            <textarea
              ref="textareaRef"
              v-model="content"
              @focus="isEditorFocused = true"
              @blur="isEditorFocused = false"
              placeholder="오늘 있었던 일, 느낀 감정, 떠오르는 생각들을 자유롭게 적어보세요..."
              class="editor-textarea"
            ></textarea>

            <!-- 글자 수 -->
            <div class="editor-footer">
              <span class="char-count" :class="{ 'warning': content.length > 1800 }">
                {{ content.length.toLocaleString() }}
              </span>
            </div>
          </div>

          <!-- 이미지 업로더 -->
          <ImageUploader v-model="selectedImages" :max-images="5" />

          <!-- 액션 버튼 -->
          <div class="action-section">
            <button
              @click="saveDiary"
              class="save-btn"
              :class="{ 'is-loading': isAnalyzing }"
              :disabled="!content.trim() || isAnalyzing"
            >
              <Transition name="fade" mode="out-in">
                <span v-if="isAnalyzing" class="btn-content">
                  <span class="spinner"></span>
                  분석 중...
                </span>
                <span v-else class="btn-content">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  {{ editMode ? '수정 완료' : '저장하기' }}
                </span>
              </Transition>
            </button>

            <NuxtLink to="/" class="cancel-btn">
              취소
            </NuxtLink>
          </div>

          <!-- AI 분석 상태 -->
          <Transition name="slide-up">
            <div v-if="isAnalyzing" class="analyzing-status">
              <div class="analyzing-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div class="analyzing-text">
                <span class="analyzing-title">AI가 일기를 분석하고 있어요</span>
                <span class="analyzing-desc">감정과 키워드를 찾고 있습니다...</span>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
const { save, getById, update } = useDiary()
const { getRecommendedPrompt } = useAI()
const { analyzeDiary } = useEmotionAnalysis()
const router = useRouter()
const route = useRoute()

const moods = {
  happy: '😊',
  calm: '😌',
  sad: '😔',
  angry: '😤',
  tired: '😴'
}

const prompts = {
  happy: [
    '오늘 가장 감사했던 순간은?',
    '당신을 웃게 만든 일은?',
    '오늘 가장 뿌듯했던 성취는?',
    '누군가에게 받은 따뜻한 말이 있나요?',
    '오늘 발견한 작은 행복은?',
    '기쁨을 나누고 싶은 사람은 누구인가요?',
    '지금 이 순간, 감사한 것 세 가지는?',
    '오늘 당신을 미소 짓게 만든 것은?'
  ],
  calm: [
    '가장 평화로웠던 순간은?',
    '마음이 편안했던 이유는?',
    '오늘 나를 위해 한 일은?',
    '마음의 여유를 느낀 순간은?',
    '고요함 속에서 무슨 생각을 했나요?',
    '지금 이 평온함을 어떻게 유지할 수 있을까요?',
    '오늘 나에게 위로가 된 것은?',
    '마음이 차분해지는 나만의 방법은?'
  ],
  sad: [
    '마음이 무거운 이유는?',
    '지금 필요한 것은?',
    '이 감정을 어떻게 표현하고 싶나요?',
    '위로가 필요한 부분은 무엇인가요?',
    '과거의 나라면 지금의 나에게 뭐라고 할까요?',
    '이 슬픔이 나에게 알려주는 것은?',
    '지금 가장 듣고 싶은 말은?',
    '내일의 나는 오늘을 어떻게 기억할까요?'
  ],
  angry: [
    '화나게 만든 일은?',
    '이 감정 뒤에 진짜 이유는?',
    '어떤 기대가 충족되지 않았나요?',
    '이 분노를 건강하게 표현하려면?',
    '상황을 다르게 볼 수 있는 관점은?',
    '지금 나에게 진짜 필요한 것은?',
    '이 감정이 지나간 후 남는 것은?',
    '분노 속에 숨겨진 나의 가치는?'
  ],
  tired: [
    '에너지를 소진한 일은?',
    '내일은 어떻게 할까?',
    '오늘 나를 지치게 만든 것은?',
    '지금 가장 쉬고 싶은 방법은?',
    '나에게 에너지를 주는 것은 무엇인가요?',
    '휴식이 필요한 부분은 어디인가요?',
    '나를 회복시키는 것들을 떠올려볼까요?',
    '완벽하지 않아도 괜찮다는 걸 알고 있나요?'
  ]
}

const selectedMood = ref(null)
const currentPrompt = ref('')
const aiPrompt = ref('')
const content = ref('')
const selectedImages = ref([])
const editMode = ref(false)
const editingDiaryId = ref(null)
const isAnalyzing = ref(false)
const isEditorFocused = ref(false)
const textareaRef = ref(null)

const getMoodLabel = (mood) => {
  const labels = { happy: '행복', calm: '평온', sad: '우울', angry: '화남', tired: '피곤' }
  return labels[mood]
}

const selectMood = async (mood) => {
  selectedMood.value = mood
  aiPrompt.value = await getRecommendedPrompt(mood)
  const moodPrompts = prompts[mood]
  currentPrompt.value = moodPrompts[Math.floor(Math.random() * moodPrompts.length)]

  // 에디터에 포커스
  await nextTick()
  textareaRef.value?.focus()
}

const useAIPrompt = () => {
  currentPrompt.value = aiPrompt.value
  aiPrompt.value = ''
}

const changePrompt = () => {
  if (!selectedMood.value) return
  const moodPrompts = prompts[selectedMood.value]
  let newPrompt
  do {
    newPrompt = moodPrompts[Math.floor(Math.random() * moodPrompts.length)]
  } while (newPrompt === currentPrompt.value && moodPrompts.length > 1)
  currentPrompt.value = newPrompt
}

const resetMood = () => {
  selectedMood.value = null
  content.value = ''
  selectedImages.value = []
}

const saveDiary = async () => {
  if (!content.value.trim()) return

  try {
    isAnalyzing.value = true
    const analysis = await analyzeDiary(content.value)

    if (editMode.value) {
      const updatedDiary = {
        content: content.value,
        images: selectedImages.value.map(img => img.id),
        emotion: analysis.emotion,
        keywords: analysis.keywords,
        feedback: analysis.feedback,
        advice: analysis.advice || '',
        emotionScore: analysis.score,
        aiSource: analysis.source || 'local'
      }
      await update(editingDiaryId.value, updatedDiary)
    } else {
      const diary = {
        date: new Date().toISOString().split('T')[0],
        mood: selectedMood.value,
        prompt: currentPrompt.value,
        content: content.value,
        images: selectedImages.value.map(img => img.id),
        emotion: analysis.emotion,
        keywords: analysis.keywords,
        feedback: analysis.feedback,
        advice: analysis.advice || '',
        emotionScore: analysis.score,
        aiSource: analysis.source || 'local'
      }
      await save(diary)
    }

    router.push('/')
  } catch (error) {
    console.error('저장 오류:', error)
    alert('일기를 저장하는 중 오류가 발생했습니다.')
  } finally {
    isAnalyzing.value = false
  }
}

onMounted(async () => {
  const editId = route.query.edit
  if (editId) {
    editMode.value = true
    editingDiaryId.value = editId

    try {
      const diary = await getById(editingDiaryId.value)
      if (diary) {
        selectedMood.value = diary.mood
        currentPrompt.value = diary.prompt || ''
        content.value = diary.content

        if (diary.images && diary.images.length > 0) {
          const { loadMultipleImages } = useImageUpload()
          selectedImages.value = await loadMultipleImages(diary.images, 'thumbnail')
        }
      } else {
        alert('일기를 찾을 수 없습니다.')
        router.push('/')
      }
    } catch (error) {
      console.error('일기 불러오기 실패:', error)
      alert('일기를 불러오는 중 오류가 발생했습니다.')
      router.push('/')
    }
  }
})
</script>

<style scoped>
.write-container {
  min-height: 100vh;
  padding: var(--space-5);
  position: relative;
}

.ambient-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.5;
  transition: background var(--duration-slow) var(--ease-out);
}

.ambient-bg.mood-happy {
  background: radial-gradient(ellipse at 50% 0%, var(--emotion-happy-subtle) 0%, transparent 50%);
}

.ambient-bg.mood-calm {
  background: radial-gradient(ellipse at 50% 0%, var(--emotion-calm-subtle) 0%, transparent 50%);
}

.ambient-bg.mood-sad {
  background: radial-gradient(ellipse at 50% 0%, var(--emotion-sad-subtle) 0%, transparent 50%);
}

.ambient-bg.mood-angry {
  background: radial-gradient(ellipse at 50% 0%, var(--emotion-angry-subtle) 0%, transparent 50%);
}

.ambient-bg.mood-tired {
  background: radial-gradient(ellipse at 50% 0%, var(--emotion-tired-subtle) 0%, transparent 50%);
}

.write-content {
  max-width: 640px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
  position: relative;
  z-index: 1;
}

/* Back Link */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-tertiary);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 500;
  margin-bottom: var(--space-8);
  transition: color var(--duration-fast) var(--ease-out);
}

.back-link:hover {
  color: var(--text-secondary);
}

/* Step Header */
.step-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.step-badge {
  display: inline-block;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-subtle);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  margin-bottom: var(--space-3);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.step-title {
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--space-2);
}

.step-desc {
  font-size: var(--text-base);
  color: var(--text-tertiary);
}

/* Mood Grid */
.mood-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-3);
}

.mood-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-5) var(--space-3);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  cursor: pointer;
  overflow: hidden;
  transition:
    transform var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
}

.mood-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
}

.mood-card:active {
  transform: translateY(-2px) scale(0.98);
}

.mood-card.mood-happy:hover { border-color: var(--emotion-happy); }
.mood-card.mood-calm:hover { border-color: var(--emotion-calm); }
.mood-card.mood-sad:hover { border-color: var(--emotion-sad); }
.mood-card.mood-angry:hover { border-color: var(--emotion-angry); }
.mood-card.mood-tired:hover { border-color: var(--emotion-tired); }

.mood-emoji {
  font-size: 2.5rem;
  transition: transform var(--duration-normal) var(--ease-spring);
}

.mood-card:hover .mood-emoji {
  transform: scale(1.15);
}

.mood-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
}

.mood-glow {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.mood-card.mood-happy .mood-glow { background: var(--emotion-happy-subtle); }
.mood-card.mood-calm .mood-glow { background: var(--emotion-calm-subtle); }
.mood-card.mood-sad .mood-glow { background: var(--emotion-sad-subtle); }
.mood-card.mood-angry .mood-glow { background: var(--emotion-angry-subtle); }
.mood-card.mood-tired .mood-glow { background: var(--emotion-tired-subtle); }

.mood-card:hover .mood-glow {
  opacity: 1;
}

/* Write Step */
.write-step {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.change-mood-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  margin: 0 auto var(--space-2);
  transition:
    background var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.change-mood-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-strong);
}

.selected-emoji {
  font-size: 1.25rem;
}

/* AI Prompt Card */
.ai-prompt-card {
  background: var(--warning-subtle);
  border: 1px solid var(--warning)30;
  border-radius: var(--radius-lg);
  padding: var(--space-5);
}

.ai-prompt-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.ai-icon {
  width: 28px;
  height: 28px;
  background: var(--warning);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.ai-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--warning);
}

.ai-prompt-text {
  font-size: var(--text-base);
  color: var(--text-primary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-4);
}

.use-prompt-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--warning);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.use-prompt-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

/* Prompt Section */
.prompt-section {
  position: relative;
}

.prompt-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--bg-subtle);
  border-radius: var(--radius-lg);
  border-left: 3px solid var(--accent);
}

.prompt-text {
  flex: 1;
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-primary);
  line-height: var(--leading-relaxed);
  margin: 0;
}

.refresh-prompt-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.refresh-prompt-btn:hover {
  background: var(--bg-hover);
  color: var(--accent);
  transform: rotate(180deg);
}

/* Editor Section */
.editor-section {
  position: relative;
  background: var(--bg-card);
  border: 2px solid var(--border-default);
  border-radius: var(--radius-xl);
  transition:
    border-color var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
}

.editor-section.is-focused {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-subtle);
}

.editor-textarea {
  width: 100%;
  min-height: 280px;
  padding: var(--space-5);
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
  resize: vertical;
}

.editor-textarea::placeholder {
  color: var(--text-muted);
}

.editor-textarea:focus {
  outline: none;
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  padding: var(--space-3) var(--space-5);
  border-top: 1px solid var(--border-subtle);
}

.char-count {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-tertiary);
  font-variant-numeric: tabular-nums;
}

.char-count.warning {
  color: var(--warning);
}

/* Action Section */
.action-section {
  display: flex;
  gap: var(--space-3);
}

.save-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.save-btn:not(:disabled):hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
}

.save-btn:active {
  transform: translateY(0) scale(0.98);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-btn.is-loading {
  background: var(--accent-subtle);
  color: var(--accent);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.cancel-btn {
  padding: var(--space-4) var(--space-6);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 500;
  text-decoration: none;
  text-align: center;
  transition:
    background var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.cancel-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-strong);
}

/* Analyzing Status */
.analyzing-status {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--accent-subtle);
  border-radius: var(--radius-lg);
}

.analyzing-icon {
  width: 48px;
  height: 48px;
  background: var(--accent);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: pulse 2s var(--ease-in-out) infinite;
}

.analyzing-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.analyzing-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--accent-hover);
}

.analyzing-desc {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Transitions */
.step-enter-active,
.step-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.step-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.step-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.animate-fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.animate-fade-in-up {
  animation: fadeInUp var(--duration-normal) var(--ease-out);
}

/* Responsive */
@media (max-width: 640px) {
  .write-content {
    padding: var(--space-4) var(--space-2);
  }

  .step-title {
    font-size: var(--text-2xl);
  }

  .mood-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .mood-card {
    padding: var(--space-4) var(--space-2);
  }

  .mood-emoji {
    font-size: 2rem;
  }

  .action-section {
    flex-direction: column;
  }

  .cancel-btn {
    order: 2;
  }
}
</style>
