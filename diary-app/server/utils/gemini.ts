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
  // gemini-2.5-flash 모델 사용 (무료 티어)
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

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
        maxOutputTokens: 2048
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
  console.log('📝 [parseGeminiResponse] 원본 응답:', response.substring(0, 500))

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

    console.log('📝 [parseGeminiResponse] 추출된 JSON:', jsonStr.substring(0, 300))

    const parsed = JSON.parse(jsonStr)
    console.log('✅ [parseGeminiResponse] 파싱 성공:', parsed)
    return parsed
  } catch (e: any) {
    console.error('❌ [parseGeminiResponse] JSON 파싱 실패:', e.message)
    console.error('❌ [parseGeminiResponse] 원본 응답:', response)

    // 파싱 실패 시 기본값 반환 (로컬 폴백용)
    return {
      content: response,
      emotion: undefined,
      keywords: [],
      feedback: '',
      advice: ''
    }
  }
}
