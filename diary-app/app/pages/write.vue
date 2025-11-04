<template>
  <div class="container">
    <div class="card" :class="selectedMood ? `mood-${selectedMood}` : ''">
      <h1 class="title">오늘의 일기</h1>

      <!-- Step 1: 기분 선택 -->
      <div v-if="!selectedMood" class="mood-selector">
        <h2 class="subtitle">지금 기분이 어떠신가요?</h2>
        <div class="mood-grid">
          <button
            v-for="(emoji, mood) in moods"
            :key="mood"
            @click="selectMood(mood)"
            class="mood-btn"
          >
            <span class="emoji">{{ emoji }}</span>
            <span class="mood-label">{{ getMoodLabel(mood) }}</span>
          </button>
        </div>
        <NuxtLink to="/" class="back-to-home">
          ← 홈으로 돌아가기
        </NuxtLink>
      </div>

      <!-- Step 2: 프롬프트 + 일기 작성 -->
      <div v-else class="write-section">
        <button @click="resetMood" class="back-btn">← 기분 다시 선택</button>

        <!-- AI 추천 프롬프트 -->
        <div v-if="aiPrompt" class="ai-prompt-box">
          <div class="ai-badge">✨ AI 추천</div>
          <p class="ai-prompt">{{ aiPrompt }}</p>
          <button @click="useAIPrompt" class="use-ai-btn">
            이 질문으로 작성하기
          </button>
        </div>

        <div class="prompt-box">
          <p class="prompt">{{ currentPrompt }}</p>
          <button @click="changePrompt" class="refresh-btn">
            🔄 다른 문구 보기
          </button>
        </div>

        <textarea
          v-model="content"
          placeholder="자유롭게 작성해보세요..."
          class="diary-textarea"
        ></textarea>

        <div class="action-buttons">
          <button @click="saveDiary" class="btn btn-save" :disabled="!content.trim()">
            💾 저장하기
          </button>
          <NuxtLink to="/" class="btn btn-cancel">
            취소
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { save } = useDiary()
const { getRecommendedPrompt } = useAI()
const router = useRouter()

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

const getMoodLabel = (mood) => {
  const labels = {
    happy: '행복',
    calm: '평온',
    sad: '우울',
    angry: '화남',
    tired: '피곤'
  }
  return labels[mood]
}

const selectMood = (mood) => {
  selectedMood.value = mood

  // AI 추천 프롬프트 생성
  aiPrompt.value = getRecommendedPrompt(mood)

  // 기본 랜덤 프롬프트
  const moodPrompts = prompts[mood]
  currentPrompt.value = moodPrompts[Math.floor(Math.random() * moodPrompts.length)]
}

const useAIPrompt = () => {
  currentPrompt.value = aiPrompt.value
  aiPrompt.value = '' // AI 프롬프트 사용 후 숨김
}

const changePrompt = () => {
  if (!selectedMood.value) return
  const moodPrompts = prompts[selectedMood.value]
  // 현재 프롬프트와 다른 것 선택
  let newPrompt
  do {
    newPrompt = moodPrompts[Math.floor(Math.random() * moodPrompts.length)]
  } while (newPrompt === currentPrompt.value && moodPrompts.length > 1)
  currentPrompt.value = newPrompt
}

const resetMood = () => {
  selectedMood.value = null
  content.value = ''
}

const saveDiary = () => {
  if (!content.value.trim()) return

  const diary = {
    id: Date.now(),
    date: new Date().toLocaleDateString('ko-KR'),
    mood: selectedMood.value,
    prompt: currentPrompt.value,
    content: content.value
  }

  save(diary)
  router.push('/')
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf3 100%);
}

.card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  transition: background 0.3s;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 32px;
  color: #1f2937;
}

.subtitle {
  font-size: 1.3rem;
  text-align: center;
  margin-bottom: 24px;
  color: #374151;
}

.mood-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
}

.mood-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.mood-btn:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.emoji {
  font-size: 2.5rem;
}

.mood-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4b5563;
}

.back-to-home {
  display: block;
  text-align: center;
  margin-top: 24px;
  padding: 12px;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.back-to-home:hover {
  color: #374151;
}

.write-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.back-btn {
  align-self: flex-start;
  padding: 8px 16px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #4b5563;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #e5e7eb;
}

.ai-prompt-box {
  padding: 20px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  border: 2px solid #f59e0b;
  margin-bottom: 16px;
  position: relative;
}

.ai-badge {
  display: inline-block;
  background: #f59e0b;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.ai-prompt {
  font-size: 1.1rem;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 12px;
  line-height: 1.6;
}

.use-ai-btn {
  width: 100%;
  padding: 10px;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.use-ai-btn:hover {
  background: #d97706;
  transform: translateY(-1px);
}

.prompt-box {
  padding: 20px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  border-left: 4px solid #667eea;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prompt {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.refresh-btn {
  align-self: flex-end;
  padding: 8px 16px;
  border: none;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
}

.diary-textarea {
  width: 100%;
  min-height: 250px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.diary-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-save:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-cancel {
  background: #f3f4f6;
  color: #4b5563;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

/* 기분별 배경색 */
.mood-happy {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}

.mood-calm {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.mood-sad {
  background: linear-gradient(135deg, #e9d5ff, #d8b4fe);
}

.mood-angry {
  background: linear-gradient(135deg, #fecaca, #fca5a5);
}

.mood-tired {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
}

@media (max-width: 640px) {
  .card {
    padding: 24px;
  }

  .mood-grid {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 12px;
  }

  .emoji {
    font-size: 2rem;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
