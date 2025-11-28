# 🚀 백엔드 셋팅 가이드 (초보자용)

## 📚 목차
1. [프로젝트 성향 파악](#프로젝트-성향-파악)
2. [백엔드란? (초보자용 설명)](#백엔드란-초보자용-설명)
3. [현재 프로젝트 백엔드 상태](#현재-프로젝트-백엔드-상태)
4. [백엔드 셋팅 방법](#백엔드-셋팅-방법)
5. [추가할 백엔드 기능 추천](#추가할-백엔드-기능-추천)
6. [실전 예제 코드](#실전-예제-코드)
7. [최종 프롬프트](#최종-프롬프트)

---

## 🎯 프로젝트 성향 파악

### 현재 프로젝트는?
**"AI 감정 분석 일기 앱"** - Nuxt 3 + Vue 3 기반

### 기술 스택
- **프론트엔드**: Nuxt 3, Vue 3
- **데이터 저장**:
  - 일기 데이터 → `localStorage` (브라우저 저장소)
  - 이미지 → `IndexedDB` (브라우저 데이터베이스)
- **백엔드**: Nuxt의 `server/api` 폴더 사용 (서버리스 방식)
- **AI 기능**: Hugging Face API (이미 연동됨)

### 프로젝트 특징
✅ **프론트엔드 중심**: 대부분의 기능이 브라우저에서 동작
✅ **간단한 구조**: 별도 서버 없이 Nuxt 내장 API 사용
✅ **오프라인 가능**: localStorage/IndexedDB로 브라우저에 저장
✅ **AI 기능**: 감정 분석, 스마트 프롬프트 추천

### 현재 백엔드 상태
- ✅ `server/api/analyze.post.ts` - Hugging Face API 연동 (감정 분석)
- ❌ 데이터 저장/조회 API 없음 (프론트에서 localStorage 직접 사용)
- ❌ 통계 API 없음
- ❌ 백업/복구 API 없음

---

## 🤔 백엔드란? (초보자용 설명)

### 비유로 이해하기
**프론트엔드 = 식당의 홀 (손님이 보는 곳)**
- 사용자가 보는 화면
- 버튼 클릭, 입력 등 사용자와 상호작용

**백엔드 = 식당의 주방 (손님이 안 보는 곳)**
- 데이터 처리, 저장, 계산 등
- 사용자가 요청하면 결과를 만들어서 전달

### 실제 예시
1. **사용자가 일기 작성** (프론트엔드)
2. **"저장" 버튼 클릭** (프론트엔드)
3. **백엔드가 데이터 저장** (백엔드)
4. **"저장 완료!" 메시지 표시** (프론트엔드)

### 왜 백엔드가 필요한가?
- ✅ **보안**: API 키 같은 민감한 정보를 서버에서만 사용
- ✅ **데이터 관리**: 여러 사용자의 데이터를 체계적으로 관리
- ✅ **복잡한 계산**: 통계, 분석 등 무거운 작업 처리
- ✅ **외부 API 연동**: Hugging Face 같은 외부 서비스 호출

---

## 📊 현재 프로젝트 백엔드 상태

### ✅ 이미 있는 것
```
diary-app/
  └── server/
      └── api/
          └── analyze.post.ts  ← Hugging Face API 연동
```

**analyze.post.ts의 역할:**
- 프론트엔드에서 일기 텍스트를 보내면
- Hugging Face API를 호출해서 감정 분석
- 결과를 프론트엔드로 반환

### ❌ 없는 것 (추가 필요)
1. **일기 저장 API** - 현재는 localStorage 직접 사용
2. **일기 조회 API** - 현재는 localStorage 직접 사용
3. **통계 API** - 연속 작성일, 월별 통계 등
4. **백업/복구 API** - 데이터 내보내기/가져오기

---

## 🛠️ 백엔드 셋팅 방법

### 방법 1: Nuxt Server API 사용 (추천! ⭐)

**장점:**
- ✅ 별도 서버 설치 불필요
- ✅ 프론트엔드와 같은 프로젝트에 통합
- ✅ 배포가 간단함
- ✅ 이미 사용 중 (analyze.post.ts)

**작동 원리:**
```
프론트엔드 (브라우저)
    ↓ fetch('/api/hello')
Nuxt 서버 (server/api/hello.get.ts)
    ↓ 처리
프론트엔드로 결과 반환
```

### 방법 2: 별도 Express.js 서버 (나중에 필요하면)

**언제 사용?**
- 사용자가 많아질 때
- 복잡한 데이터베이스가 필요할 때
- 다른 서비스와 연동이 많을 때

**현재는 방법 1로 충분합니다!**

---

## 💡 추가할 백엔드 기능 추천

### 우선순위 1: 기본 CRUD API (필수)
일기 데이터를 백엔드에서 관리

1. **일기 저장 API** (`diaries.post.ts`)
   - 일기 내용을 받아서 저장
   - 현재: localStorage 직접 사용
   - 개선: 백엔드 API로 저장

2. **일기 조회 API** (`diaries.get.ts`)
   - 모든 일기 또는 특정 일기 조회
   - 현재: localStorage 직접 사용
   - 개선: 백엔드 API로 조회

3. **일기 수정 API** (`diaries/[id].put.ts`)
   - 특정 일기 수정
   - 현재: localStorage 직접 사용
   - 개선: 백엔드 API로 수정

4. **일기 삭제 API** (`diaries/[id].delete.ts`)
   - 특정 일기 삭제
   - 현재: localStorage 직접 사용
   - 개선: 백엔드 API로 삭제

### 우선순위 2: 통계 API (유용함)
데이터 분석 결과 제공

5. **통계 API** (`stats.get.ts`)
   - 연속 작성일 계산
   - 월별 일기 개수
   - 감정 분포 통계
   - 현재: 프론트엔드에서 계산
   - 개선: 백엔드에서 계산해서 반환

### 우선순위 3: 고급 기능 (선택)
필요하면 나중에 추가

6. **백업 API** (`backup.post.ts`)
   - 모든 데이터를 JSON으로 내보내기

7. **복구 API** (`restore.post.ts`)
   - JSON 파일을 받아서 데이터 복구

---

## 📝 실전 예제 코드

### 예제 1: 간단한 Hello API (테스트용)

**파일**: `server/api/hello.get.ts`
```typescript
export default defineEventHandler((event) => {
  return {
    message: '안녕하세요! 백엔드에서 보낸 메시지입니다.',
    timestamp: new Date().toISOString()
  }
})
```

**사용법 (프론트엔드)**:
```vue
<script setup>
const { data } = await useFetch('/api/hello')
console.log(data.value.message) // "안녕하세요! 백엔드에서 보낸 메시지입니다."
</script>
```

### 예제 2: 일기 저장 API

**파일**: `server/api/diaries.post.ts`
```typescript
export default defineEventHandler(async (event) => {
  // 요청에서 일기 데이터 가져오기
  const diary = await readBody(event)

  // 유효성 검사
  if (!diary.content || !diary.mood) {
    throw createError({
      statusCode: 400,
      message: '일기 내용과 기분은 필수입니다.'
    })
  }

  // 여기서 실제로는 데이터베이스에 저장
  // 지금은 간단하게 메모리에 저장 (나중에 DB로 변경)
  const diaries = []
  diaries.push({
    ...diary,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  })

  return {
    success: true,
    message: '일기가 저장되었습니다.',
    diary: diaries[0]
  }
})
```

**사용법 (프론트엔드)**:
```vue
<script setup>
const saveDiary = async () => {
  const diary = {
    content: '오늘 하루는...',
    mood: 'happy'
  }

  const { data } = await useFetch('/api/diaries', {
    method: 'POST',
    body: diary
  })

  console.log(data.value.message) // "일기가 저장되었습니다."
}
</script>
```

### 예제 3: 일기 조회 API

**파일**: `server/api/diaries.get.ts`
```typescript
export default defineEventHandler((event) => {
  // 쿼리 파라미터 가져오기 (예: /api/diaries?limit=10)
  const query = getQuery(event)
  const limit = query.limit ? parseInt(query.limit) : 10

  // 여기서 실제로는 데이터베이스에서 조회
  // 지금은 예시 데이터 반환
  const diaries = [
    {
      id: '1',
      content: '오늘은 좋은 하루였다.',
      mood: 'happy',
      date: '2025-01-15'
    }
  ]

  return {
    success: true,
    count: diaries.length,
    diaries: diaries.slice(0, limit)
  }
})
```

**사용법 (프론트엔드)**:
```vue
<script setup>
// 모든 일기 조회
const { data } = await useFetch('/api/diaries')

// 최근 5개만 조회
const { data: recentData } = await useFetch('/api/diaries?limit=5')
</script>
```

### 예제 4: 통계 API

**파일**: `server/api/stats.get.ts`
```typescript
export default defineEventHandler((event) => {
  // 여기서 실제로는 데이터베이스에서 데이터를 가져와서 계산
  // 지금은 예시 데이터

  const stats = {
    totalDiaries: 50,
    streak: 7, // 연속 작성일
    thisMonth: 15,
    achievement: 50, // 달성률 (%)
    moodDistribution: {
      happy: 20,
      calm: 15,
      sad: 10,
      angry: 3,
      tired: 2
    }
  }

  return {
    success: true,
    stats
  }
})
```

---

## 🎯 최종 프롬프트

### 프롬프트 1: 기본 API 엔드포인트 만들기

```
이 프로젝트에 기본적인 백엔드 API를 추가해줘.

1. server/api/hello.get.ts 파일 생성
   - 간단한 GET 요청 처리
   - { message: "Hello from backend!", timestamp: ... } 반환

2. server/api/diaries.post.ts 파일 생성
   - 일기 저장 API
   - 요청 body에서 { content, mood, date, images } 받기
   - 유효성 검사 (content, mood 필수)
   - ID 생성 및 저장 (지금은 메모리, 나중에 DB로 변경 가능하게)
   - { success: true, diary: {...} } 반환

3. server/api/diaries.get.ts 파일 생성
   - 모든 일기 조회 API
   - 쿼리 파라미터로 limit, mood 필터링 가능
   - { success: true, count: number, diaries: [...] } 반환

4. server/api/diaries/[id].get.ts 파일 생성
   - 특정 일기 1개 조회
   - URL 파라미터로 ID 받기
   - { success: true, diary: {...} } 반환

5. server/api/diaries/[id].delete.ts 파일 생성
   - 특정 일기 삭제
   - { success: true, message: "삭제되었습니다." } 반환

모든 API는:
- 에러 처리 추가 (try-catch)
- 적절한 HTTP 상태 코드 반환
- TypeScript 타입 정의
- 주석으로 설명 추가
```

### 프롬프트 2: 프론트엔드와 백엔드 연동하기

```
프론트엔드에서 백엔드 API를 사용하도록 수정해줘.

1. app/composables/useDiary.js 수정
   - 현재 localStorage 직접 사용하는 부분을 API 호출로 변경
   - save() 함수: POST /api/diaries 호출
   - getAll() 함수: GET /api/diaries 호출
   - getById(id) 함수: GET /api/diaries/[id] 호출
   - deleteDiary(id) 함수: DELETE /api/diaries/[id] 호출
   - update(id, data) 함수: PUT /api/diaries/[id] 호출

2. 에러 처리 추가
   - API 호출 실패 시 사용자에게 알림
   - 네트워크 오류 처리

3. 로딩 상태 관리
   - API 호출 중 로딩 표시

참고: 기존 localStorage 코드는 주석 처리하거나 백업용으로 남겨두기
```

### 프롬프트 3: 통계 API 추가하기

```
통계를 계산하는 백엔드 API를 만들어줘.

1. server/api/stats.get.ts 파일 생성
   - 연속 작성일 계산
   - 이번 달 일기 개수
   - 감정 분포 통계
   - 달성률 계산
   - { success: true, stats: {...} } 반환

2. app/pages/index.vue 수정
   - calculateStats() 함수를 API 호출로 변경
   - GET /api/stats 호출해서 통계 받아오기

3. 에러 처리 및 로딩 상태 추가
```

### 프롬프트 4: 데이터베이스 연동 (고급)

```
백엔드에 실제 데이터베이스를 연동해줘.

옵션 1: SQLite (간단함)
- npm install better-sqlite3
- 데이터베이스 파일로 저장
- 오프라인 작동 가능

옵션 2: PostgreSQL (프로덕션용)
- npm install pg
- 외부 데이터베이스 서버 필요

옵션 3: MongoDB (NoSQL)
- npm install mongodb
- JSON 형태로 저장

요구사항:
1. 데이터베이스 스키마 설계
2. 연결 설정
3. 기존 API를 DB 사용하도록 수정
4. 마이그레이션 스크립트 (선택)
```

---

## 📚 핵심 개념 정리

### 1. API 엔드포인트란?
**URL 주소**라고 생각하면 됩니다.
- `GET /api/hello` → "안녕하세요" 데이터 가져오기
- `POST /api/diaries` → 일기 저장하기
- `GET /api/diaries` → 일기 목록 가져오기

### 2. HTTP 메서드
- **GET**: 데이터 가져오기 (조회)
- **POST**: 데이터 생성하기 (저장)
- **PUT**: 데이터 수정하기
- **DELETE**: 데이터 삭제하기

### 3. 요청과 응답
```
프론트엔드 → 요청 (Request) → 백엔드
프론트엔드 ← 응답 (Response) ← 백엔드
```

### 4. Nuxt Server API 파일명 규칙
- `hello.get.ts` → GET /api/hello
- `diaries.post.ts` → POST /api/diaries
- `diaries/[id].get.ts` → GET /api/diaries/123
- `[id]`는 동적 파라미터 (실제 ID로 대체됨)

---

## ✅ 체크리스트

### 기본 셋팅
- [ ] `server/api/hello.get.ts` 생성 및 테스트
- [ ] 프론트엔드에서 API 호출 테스트
- [ ] 에러 처리 확인

### CRUD API
- [ ] 일기 저장 API (POST)
- [ ] 일기 조회 API (GET)
- [ ] 일기 수정 API (PUT)
- [ ] 일기 삭제 API (DELETE)

### 프론트엔드 연동
- [ ] useDiary.js를 API 사용하도록 수정
- [ ] 기존 기능이 정상 작동하는지 테스트
- [ ] 에러 처리 및 로딩 상태 추가

### 고급 기능 (선택)
- [ ] 통계 API
- [ ] 백업/복구 API
- [ ] 데이터베이스 연동

---

## 🎓 다음 단계

1. **지금 바로**: 프롬프트 1 실행 (기본 API 만들기)
2. **이번 주**: 프롬프트 2 실행 (프론트엔드 연동)
3. **다음 주**: 프롬프트 3 실행 (통계 API)
4. **나중에**: 프롬프트 4 실행 (데이터베이스)

---

## 💬 질문이 있으면?

이 가이드를 보면서 궁금한 점이 있으면 언제든 물어보세요!
백엔드는 처음에는 어려워 보이지만, 하나씩 만들어보면 금방 익숙해집니다. 💪
