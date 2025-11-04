# 간단한 AI 일기 앱 (Nuxt3)

## 목표
1. 메인: 오늘의 프롬프트 확인
2. 작성: 기분 선택 → 프롬프트 → 일기 작성
3. 인사이트: 작성한 일기 목록 보기

---

## 프로젝트 구조

```
pages/
  ├── index.vue          # 메인 (프롬프트 카드)
  ├── write.vue          # 기분 선택 + 일기 작성
  └── insights.vue       # 일기 목록
composables/
  └── useDiary.js        # LocalStorage 저장/불러오기
```

---

## 프롬프트 데이터 (pages/write.vue에 직접 포함)

```javascript
const prompts = {
  happy: ["오늘 가장 감사했던 순간은?", "당신을 웃게 만든 일은?"],
  calm: ["가장 평화로웠던 순간은?", "마음이 편안했던 이유는?"],
  sad: ["마음이 무거운 이유는?", "지금 필요한 것은?"],
  angry: ["화나게 만든 일은?", "이 감정 뒤에 진짜 이유는?"],
  tired: ["에너지를 소진한 일은?", "내일은 어떻게 할까?"]
}
```

---

## 페이지별 기능

### 1. index.vue (메인)
- 오늘 날짜 표시
- "일기 쓰기" 버튼 → /write로 이동
- "내 일기 보기" 버튼 → /insights로 이동
- 배경: 부드러운 그라디언트

### 2. write.vue (작성)
**Step 1: 기분 선택**
```
😊 행복  😌 평온  😔 우울  😤 화남  😴 피곤
```
클릭하면 프롬프트 표시

**Step 2: 프롬프트 + 일기 작성**
- 선택한 기분의 랜덤 프롬프트 표시
- Textarea (최소 높이 200px)
- 저장 버튼 → LocalStorage 저장 → 메인으로 이동

### 3. insights.vue (인사이트)
- 저장된 일기 목록 (최신순)
- 각 카드: 날짜, 기분 이모티콘, 내용 미리보기
- 클릭하면 전체 내용 표시

---

## 데이터 구조

```javascript
// LocalStorage 키: 'diaries'
[
  {
    id: Date.now(),
    date: '2025-10-27',
    mood: 'happy',
    prompt: '오늘 가장 감사했던 순간은?',
    content: '일기 내용...'
  }
]
```

---

## CSS 스타일 (간단)

```css
/* 기분별 색상 */
.mood-happy { background: linear-gradient(135deg, #fef3c7, #fde68a); }
.mood-calm { background: linear-gradient(135deg, #dbeafe, #bfdbfe); }
.mood-sad { background: linear-gradient(135deg, #e9d5ff, #d8b4fe); }
.mood-angry { background: linear-gradient(135deg, #fecaca, #fca5a5); }
.mood-tired { background: linear-gradient(135deg, #f3f4f6, #e5e7eb); }

/* 기본 */
- 카드: border-radius 16px, padding 24px
- 버튼: padding 12px 24px, border-radius 8px
- Textarea: width 100%, padding 16px
```

---

## useDiary.js (composable)

```javascript
export const useDiary = () => {
  // 저장
  const save = (diary) => {
    const diaries = JSON.parse(localStorage.getItem('diaries') || '[]')
    diaries.unshift(diary)
    localStorage.setItem('diaries', JSON.stringify(diaries))
  }
  
  // 불러오기
  const getAll = () => {
    return JSON.parse(localStorage.getItem('diaries') || '[]')
  }
  
  return { save, getAll }
}
```

---

## 실행 명령어

```bash
# 프로젝트 생성
npx nuxi@latest init diary-app
cd diary-app

# 개발 서버
npm run dev
```

---

## Claude Code에 요청할 내용

"위 플랜대로 Nuxt3 프로젝트를 만들어줘.
- 3개 페이지 (index, write, insights)
- useDiary composable
- 프롬프트는 write.vue에 직접 포함
- 모바일 반응형
- 간단하고 깔끔한 디자인"
