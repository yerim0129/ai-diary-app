# LLM 연동 가이드 (Google Gemini API - 무료)

> AI 에이전트 포트폴리오 고도화를 위한 LLM 연동 작업 가이드

---

## 📋 작업 개요

### 현재 상태
- Hugging Face BERT 모델 사용 (별점 분류만 가능)
- 키워드 기반 감정 분석 (규칙 기반)
- 하드코딩된 피드백 메시지

### 목표 상태
- LLM 기반 자연어 감정 분석
- 개인화된 AI 피드백 생성
- 대화형 AI 상담 기능

---

## 💰 왜 Gemini인가?

| 서비스 | 무료 티어 | 비고 |
|--------|----------|------|
| **Google Gemini** | ✅ **무료** (분당 15회, 일 1500회) | 추천! |
| OpenAI | ❌ 유료 | 신규 크레딧 없음 |
| Claude | ❌ 유료 | 신규 크레딧 없음 |
| Groq | ✅ 무료 (제한적) | Llama 모델만 |

**Gemini 무료 티어 제한:**
- 분당 15 요청
- 분당 100만 토큰
- 일일 1,500 요청

→ 개인 프로젝트/포트폴리오에 충분!

---

## 🚀 Step 1: Google AI Studio에서 API 키 발급

### 1-1. Google AI Studio 접속
1. https://aistudio.google.com 접속
2. Google 계정으로 로그인

### 1-2. API 키 생성
1. 좌측 메뉴에서 **"Get API key"** 클릭
2. **"Create API key"** 버튼 클릭
3. 프로젝트 선택 (없으면 새로 생성)
4. 생성된 API 키 복사

> ⚠️ API 키는 한 번만 표시됩니다. 안전하게 보관하세요!

---

## 🔧 Step 2: 환경 변수 설정

### 2-1. `.env` 파일 수정

```bash
# diary-app/.env

# 기존
NUXT_PUBLIC_HF_TOKEN=your-huggingface-token-here

# 추가 - Gemini API 키
GEMINI_API_KEY=AIzaSy어쩌구저쩌구_키값
```

### 2-2. `.env.example` 업데이트

```bash
NUXT_PUBLIC_HF_TOKEN=your-huggingface-token-here
GEMINI_API_KEY=your-gemini-api-key-here
```

### 2-3. `nuxt.config.ts` 수정

```typescript
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    // 서버 전용 (클라이언트에 노출 안됨)
    geminiApiKey: process.env.GEMINI_API_KEY,

    public: {
      hfToken: process.env.NUXT_PUBLIC_HF_TOKEN
    }
  }
})
```

---

## 📝 Step 3: Gemini 서비스 파일 생성

### `server/utils/gemini.ts` 생성

```typescript
/**
 * Google Gemini API 서비스
 * 무료 티어: 분당 15회, 일 1500회
 */

interface GeminiResponse {
  content: string
  emotion?: string
  keywords?: string[]
  feedback?: string
  advice?: string
}

interface DiaryContext {
  recentDiaries?: Array<{
    date: string
    mood: string
    content: string
  }>
  currentMood?: string
}

/**
 * Gemini API 호출
 */
export async function callGemini(
  prompt: string,
  systemPrompt: string,
  apiKey: string
): Promise<string> {
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${systemPrompt}\n\n${prompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Gemini API Error:', error)
    throw new Error(`Gemini API Error: ${response.status} - ${error}`)
  }

  const data = await response.json()

  // Gemini 응답 구조에서 텍스트 추출
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('Gemini 응답에서 텍스트를 찾을 수 없습니다.')
  }

  return text
}

/**
 * 일기 분석용 시스템 프롬프트
 */
export function getDiaryAnalysisPrompt(): string {
  return `당신은 따뜻하고 공감 능력이 뛰어난 AI 심리 상담사입니다.
사용자의 일기를 읽고 다음을 수행합니다:

1. 감정 분석: 일기에서 느껴지는 주요 감정을 파악합니다
2. 핵심 키워드: 일기의 핵심 주제나 키워드를 3개 추출합니다
3. 공감 피드백: 사용자의 감정에 공감하는 따뜻한 메시지를 작성합니다 (2-3문장)
4. 실천 조언: 구체적이고 실행 가능한 조언을 1-2개 제시합니다

응답은 반드시 아래 JSON 형식으로만 작성하세요 (다른 텍스트 없이 JSON만):
{
  "emotion": "happy 또는 calm 또는 sad 또는 angry 또는 tired 중 하나만",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "feedback": "공감 피드백 메시지",
  "advice": "실천 조언"
}`
}

/**
 * 대화형 상담용 시스템 프롬프트
 */
export function getCounselorPrompt(context: DiaryContext): string {
  let contextInfo = ''

  if (context.recentDiaries && context.recentDiaries.length > 0) {
    contextInfo = `\n\n[최근 일기 기록]
${context.recentDiaries.map(d =>
  `- ${d.date}: ${d.mood} - "${d.content.substring(0, 100)}..."`
).join('\n')}`
  }

  return `당신은 따뜻하고 전문적인 AI 심리 상담사입니다.
사용자와 자연스럽게 대화하며 감정을 탐색하도록 도와주세요.

[대화 원칙]
- 판단하지 않고 경청합니다
- 열린 질문으로 감정 탐색을 유도합니다
- 사용자의 감정을 반영하고 확인합니다
- 필요시 부드럽게 다른 관점을 제시합니다
- 응답은 2-4문장으로 간결하게 합니다
- 한국어로 따뜻하게 응답합니다
${contextInfo}

현재 사용자의 기분: ${context.currentMood || '알 수 없음'}`
}

/**
 * LLM 응답에서 JSON 파싱
 */
export function parseGeminiResponse(response: string): GeminiResponse {
  try {
    // JSON 블록 추출 시도 (```json ... ``` 또는 { ... })
    let jsonStr = response

    // 마크다운 코드 블록 제거
    const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim()
    } else {
      // 순수 JSON 객체 추출
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonStr = jsonMatch[0]
      }
    }

    return JSON.parse(jsonStr)
  } catch (e) {
    console.warn('JSON 파싱 실패, 텍스트로 반환:', e)
    return { content: response }
  }
}
```

---

## 🔌 Step 4: API 엔드포인트 생성

### 4-1. `server/api/ai/analyze.post.ts` 생성

```typescript
/**
 * Gemini 기반 일기 감정 분석 API
 */
import { callGemini, getDiaryAnalysisPrompt, parseGeminiResponse } from '~/server/utils/gemini'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { text } = await readBody(event)

  if (!text || text.trim().length === 0) {
    throw createError({
      statusCode: 400,
      message: '분석할 텍스트가 없습니다.'
    })
  }

  if (!config.geminiApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Gemini API 키가 설정되지 않았습니다. .env 파일을 확인하세요.'
    })
  }

  const systemPrompt = getDiaryAnalysisPrompt()
  const userPrompt = `다음 일기를 분석해주세요:\n\n"${text}"`

  try {
    console.log('🤖 Gemini API 호출 시작...')

    const response = await callGemini(userPrompt, systemPrompt, config.geminiApiKey)
    const parsed = parseGeminiResponse(response)

    console.log('✅ Gemini 분석 완료:', parsed)

    return {
      success: true,
      data: parsed,
      raw: response
    }

  } catch (error: any) {
    console.error('❌ Gemini API 오류:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'AI 분석 중 오류가 발생했습니다.'
    })
  }
})
```

### 4-2. `server/api/ai/chat.post.ts` 생성 (대화형 상담)

```typescript
/**
 * AI 상담 챗봇 API (Gemini)
 */
import { callGemini, getCounselorPrompt } from '~/server/utils/gemini'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { message, context } = await readBody(event)

  if (!message || message.trim().length === 0) {
    throw createError({
      statusCode: 400,
      message: '메시지가 없습니다.'
    })
  }

  if (!config.geminiApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Gemini API 키가 설정되지 않았습니다.'
    })
  }

  const systemPrompt = getCounselorPrompt(context || {})

  try {
    console.log('💬 AI 상담 요청...')

    const response = await callGemini(message, systemPrompt, config.geminiApiKey)

    console.log('✅ AI 응답 완료')

    return {
      success: true,
      message: response
    }

  } catch (error: any) {
    console.error('❌ Chat API 오류:', error)
    throw createError({
      statusCode: 500,
      message: error.message || '응답 생성 중 오류가 발생했습니다.'
    })
  }
})
```

---

## 🎨 Step 5: 프론트엔드 연동

### `app/composables/useLLM.js` 생성

```javascript
/**
 * LLM API 연동 Composable (Gemini)
 */
export const useLLM = () => {
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * LLM 기반 일기 분석
   */
  const analyzeDiaryWithLLM = async (text) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/ai/analyze', {
        method: 'POST',
        body: { text }
      })

      return response.data
    } catch (e) {
      error.value = e.data?.message || e.message || 'AI 분석 실패'
      console.error('LLM 분석 오류:', e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * AI 상담 챗
   */
  const chatWithAI = async (message, context = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/ai/chat', {
        method: 'POST',
        body: { message, context }
      })

      return response.message
    } catch (e) {
      error.value = e.data?.message || e.message || '응답 생성 실패'
      console.error('Chat 오류:', e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    analyzeDiaryWithLLM,
    chatWithAI
  }
}
```

---

## 🧪 Step 6: 테스트

### 6-1. 서버 재시작

```bash
cd diary-app
npm run dev
```

### 6-2. API 테스트 (PowerShell)

```powershell
# 분석 API 테스트
Invoke-RestMethod -Uri "http://localhost:3000/api/ai/analyze" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"text": "오늘 정말 행복한 하루였다. 친구들과 맛있는 저녁을 먹었다."}'

# 챗 API 테스트
Invoke-RestMethod -Uri "http://localhost:3000/api/ai/chat" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"message": "요즘 너무 지쳐요", "context": {"currentMood": "tired"}}'
```

### 6-3. 브라우저에서 테스트

브라우저 콘솔(F12)에서:

```javascript
// 분석 테스트
fetch('/api/ai/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: '오늘 정말 행복한 하루였다!' })
}).then(r => r.json()).then(console.log)

// 챗 테스트
fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: '요즘 기분이 안 좋아요' })
}).then(r => r.json()).then(console.log)
```

---

## 📊 Step 7: 기존 코드 마이그레이션

### `useEmotionAnalysis.js` 수정

기존 키워드 분석을 폴백으로 유지하면서 LLM 분석 우선 사용:

```javascript
/**
 * 감정 분석 Composable
 * Gemini API 우선, 실패시 로컬 키워드 분석으로 폴백
 */
export const useEmotionAnalysis = () => {
  const { analyzeDiaryWithLLM } = useLLM()

  const analyzeDiary = async (text) => {
    console.log('🧠 AI 감정 분석 시작...')

    // 1. Gemini LLM 분석 시도
    try {
      const llmResult = await analyzeDiaryWithLLM(text)

      if (llmResult && llmResult.emotion) {
        console.log('✅ Gemini 분석 성공:', llmResult)
        return {
          emotion: llmResult.emotion,
          keywords: llmResult.keywords || [],
          feedback: llmResult.feedback || '',
          advice: llmResult.advice || '',
          score: 80, // LLM 분석은 높은 신뢰도
          source: 'gemini'
        }
      }
    } catch (e) {
      console.warn('⚠️ Gemini 분석 실패, 로컬 분석으로 폴백:', e)
    }

    // 2. 폴백: 로컬 키워드 분석
    const localResult = analyzeLocally(text)
    return {
      ...localResult,
      source: 'local'
    }
  }

  // 기존 analyzeLocally 함수 유지...
  const analyzeLocally = (text) => {
    // ... 기존 코드 그대로
  }

  return {
    analyzeDiary,
    analyzeLocally
  }
}
```

---

## ✅ 체크리스트

### API 키 발급
- [ ] Google AI Studio 접속 (https://aistudio.google.com)
- [ ] API 키 생성 및 복사

### 환경 설정
- [ ] `.env` 파일에 `GEMINI_API_KEY` 추가
- [ ] `nuxt.config.ts`에 `runtimeConfig` 설정

### 파일 생성
- [ ] `server/utils/gemini.ts` 생성
- [ ] `server/api/ai/analyze.post.ts` 생성
- [ ] `server/api/ai/chat.post.ts` 생성
- [ ] `app/composables/useLLM.js` 생성

### 테스트
- [ ] 서버 재시작 (`npm run dev`)
- [ ] 분석 API 테스트
- [ ] 챗 API 테스트

### 마이그레이션
- [ ] `useEmotionAnalysis.js`에 LLM 연동
- [ ] UI에서 AI 분석 결과 표시 확인

---

## 🔧 문제 해결

### "API 키가 설정되지 않았습니다" 오류
1. `.env` 파일에 `GEMINI_API_KEY` 있는지 확인
2. 서버 재시작 (`npm run dev`)
3. `nuxt.config.ts`에 `runtimeConfig` 설정 확인

### "429 Too Many Requests" 오류
- 무료 티어 한도 초과 (분당 15회)
- 1분 기다린 후 재시도

### JSON 파싱 오류
- Gemini가 가끔 JSON 외 텍스트 포함
- `parseGeminiResponse` 함수가 자동 처리함

---

## 🔜 다음 단계 (추후 고도화)

1. **RAG 구현**: 벡터 DB로 과거 일기 검색
2. **메모리 시스템**: 대화 컨텍스트 유지
3. **스트리밍 응답**: 실시간 타이핑 효과
4. **AI 상담 페이지**: 전용 챗 UI 구현

---

## 📚 참고 자료

- [Google AI Studio](https://aistudio.google.com)
- [Gemini API 문서](https://ai.google.dev/docs)
- [Gemini 무료 티어 한도](https://ai.google.dev/pricing)

---

> 작성일: 2025-12-28
> 작성자: Claude Code Assistant
