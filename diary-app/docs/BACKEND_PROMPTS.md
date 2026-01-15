# 🎯 백엔드 개발 프롬프트 모음

> 각 프롬프트를 복사해서 AI에게 붙여넣으면 됩니다!

---

## 📌 프롬프트 1: 기본 API 엔드포인트 만들기

```
이 프로젝트에 기본적인 백엔드 API를 추가해줘.

## 1단계: Hello API (이미 있지만 확인용)
- server/api/hello.get.ts 파일이 있는지 확인
- GET /api/hello 요청 시 { message, timestamp, status } 반환

## 2단계: 일기 저장 API 만들기
파일: server/api/diaries.post.ts

요구사항:
- POST 요청으로 일기 데이터 받기
- 요청 body 형식: { content: string, mood: string, date: string, images?: string[], prompt?: string }
- 유효성 검사: content와 mood는 필수
- ID 자동 생성 (Date.now().toString() 사용)
- createdAt 자동 추가
- 반환 형식: { success: true, message: string, diary: {...} }
- 에러 처리: try-catch로 감싸고 적절한 HTTP 상태 코드 반환

참고: 지금은 메모리에 저장 (나중에 데이터베이스로 변경 가능하게 구조화)

## 3단계: 일기 조회 API 만들기
파일: server/api/diaries.get.ts

요구사항:
- GET 요청으로 모든 일기 조회
- 쿼리 파라미터 지원:
  * limit: 최대 개수 (예: ?limit=10)
  * mood: 기분 필터 (예: ?mood=happy)
- 반환 형식: { success: true, count: number, diaries: [...] }
- 에러 처리 추가

## 4단계: 특정 일기 조회 API
파일: server/api/diaries/[id].get.ts

요구사항:
- GET 요청으로 특정 일기 1개 조회
- URL 파라미터로 ID 받기 (예: /api/diaries/123)
- 일기가 없으면 404 에러 반환
- 반환 형식: { success: true, diary: {...} }

## 5단계: 일기 삭제 API
파일: server/api/diaries/[id].delete.ts

요구사항:
- DELETE 요청으로 특정 일기 삭제
- URL 파라미터로 ID 받기
- 일기가 없으면 404 에러 반환
- 반환 형식: { success: true, message: "일기가 삭제되었습니다." }

## 6단계: 일기 수정 API
파일: server/api/diaries/[id].put.ts

요구사항:
- PUT 요청으로 특정 일기 수정
- URL 파라미터로 ID 받기
- 요청 body로 수정할 데이터 받기
- updatedAt 자동 추가
- 반환 형식: { success: true, message: string, diary: {...} }

모든 API는:
- TypeScript 타입 정의
- 주석으로 설명 추가
- 에러 처리 (try-catch)
- 적절한 HTTP 상태 코드 (200, 400, 404, 500)
- console.log로 디버깅 정보 출력

작성 순서:
1. 각 파일을 하나씩 만들기
2. 간단한 테스트 데이터로 동작 확인
3. 에러 케이스도 테스트
```

---

## 📌 프롬프트 2: 프론트엔드와 백엔드 연동하기

```
프론트엔드에서 백엔드 API를 사용하도록 수정해줘.

## 현재 상황
- app/composables/useDiary.js에서 localStorage를 직접 사용 중
- 백엔드 API는 이미 만들어져 있음 (diaries.post.ts, diaries.get.ts 등)

## 작업 내용

### 1단계: useDiary.js 수정
파일: app/composables/useDiary.js

기존 함수들을 API 호출로 변경:

1. save(diary) 함수:
   - 기존: localStorage에 직접 저장
   - 변경: POST /api/diaries 호출
   - useFetch 사용
   - 에러 처리 추가
   - 성공 시 반환된 diary 객체 반환

2. getAll() 함수:
   - 기존: localStorage에서 직접 조회
   - 변경: GET /api/diaries 호출
   - useFetch 사용
   - 에러 시 빈 배열 반환

3. getById(id) 함수:
   - 기존: localStorage에서 찾기
   - 변경: GET /api/diaries/[id] 호출
   - useFetch 사용
   - 에러 시 null 반환

4. deleteDiary(id) 함수:
   - 기존: localStorage에서 직접 삭제
   - 변경: DELETE /api/diaries/[id] 호출
   - useFetch 사용
   - 에러 처리 추가

5. update(id, updatedDiary) 함수:
   - 기존: localStorage에서 직접 수정
   - 변경: PUT /api/diaries/[id] 호출
   - useFetch 사용
   - 에러 처리 추가

### 2단계: 에러 처리
- API 호출 실패 시 사용자에게 알림 (alert 또는 console.error)
- 네트워크 오류 처리
- 404, 500 등 HTTP 상태 코드별 처리

### 3단계: 기존 코드 백업
- 기존 localStorage 코드는 주석 처리하거나
- 백업용으로 별도 함수로 분리 (예: saveToLocalStorage)

### 4단계: 테스트
- 일기 작성 → 저장 확인
- 일기 목록 조회 확인
- 일기 삭제 확인
- 에러 케이스 테스트

주의사항:
- SSR 대응 (typeof window 체크는 유지)
- 기존 기능이 정상 작동하는지 확인
- 점진적으로 변경 (하나씩 테스트)
```

---

## 📌 프롬프트 3: 통계 API 추가하기

```
통계를 계산하는 백엔드 API를 만들어줘.

## 파일: server/api/stats.get.ts

## 요구사항

### 1단계: 통계 계산 로직
다음 통계를 계산해서 반환:

1. **totalDiaries**: 전체 일기 개수
2. **streak**: 연속 작성일 (오늘 포함)
3. **thisMonth**: 이번 달 일기 개수
4. **achievement**: 달성률 (이번 달 일기 수 / 이번 달 일수 * 100)
5. **moodDistribution**: 감정별 분포
   - happy, calm, sad, angry, tired 각각의 개수

### 2단계: 연속 작성일 계산 로직
- 오늘 일기가 있으면 streak 시작
- 어제, 그저께... 순서대로 확인
- 하루라도 빠지면 streak 종료

### 3단계: 반환 형식
```typescript
{
  success: true,
  stats: {
    totalDiaries: number,
    streak: number,
    thisMonth: number,
    achievement: number,
    moodDistribution: {
      happy: number,
      calm: number,
      sad: number,
      angry: number,
      tired: number
    }
  }
}
```

### 4단계: 프론트엔드 연동
파일: app/pages/index.vue

- calculateStats() 함수를 API 호출로 변경
- GET /api/stats 호출
- 받은 데이터로 stats.value 업데이트
- 에러 처리 추가
- 로딩 상태 관리

### 5단계: 에러 처리
- 데이터가 없을 때 기본값 반환
- 계산 오류 처리
- 적절한 HTTP 상태 코드

참고:
- 현재는 메모리에서 계산 (나중에 DB로 변경 가능하게)
- 기존 calculateStats() 로직을 참고하되 백엔드로 이동
```

---

## 📌 프롬프트 4: 데이터베이스 연동 (고급)

```
백엔드에 실제 데이터베이스를 연동해줘.

## 옵션 선택
다음 중 하나를 선택해서 구현:

### 옵션 1: SQLite (추천 - 간단함)
- npm install better-sqlite3
- 파일 기반 데이터베이스 (오프라인 작동)
- 별도 서버 불필요

### 옵션 2: PostgreSQL (프로덕션용)
- npm install pg
- 외부 데이터베이스 서버 필요
- 확장성 좋음

### 옵션 3: MongoDB (NoSQL)
- npm install mongodb
- JSON 형태로 저장
- 유연한 스키마

## 작업 내용

### 1단계: 데이터베이스 설치 및 설정
- 선택한 DB 패키지 설치
- 연결 설정 파일 생성
- 환경 변수 설정 (.env)

### 2단계: 스키마 설계
일기 테이블/컬렉션:
- id (Primary Key)
- content (텍스트)
- mood (문자열)
- date (날짜)
- images (배열)
- prompt (텍스트, 선택)
- emotion (객체, 선택)
- createdAt (타임스탬프)
- updatedAt (타임스탬프)

### 3단계: 기존 API 수정
- diaries.post.ts: DB에 저장
- diaries.get.ts: DB에서 조회
- diaries/[id].get.ts: DB에서 1개 조회
- diaries/[id].put.ts: DB에서 수정
- diaries/[id].delete.ts: DB에서 삭제
- stats.get.ts: DB에서 통계 계산

### 4단계: 마이그레이션 (선택)
- 기존 localStorage 데이터를 DB로 이전하는 스크립트
- server/api/migrate.post.ts 생성

### 5단계: 에러 처리
- DB 연결 오류 처리
- 쿼리 오류 처리
- 트랜잭션 처리 (필요시)

참고:
- 기존 메모리 기반 코드는 주석 처리
- 점진적으로 마이그레이션
- 백업 전략 수립
```

---

## 📌 프롬프트 5: 백업/복구 API

```
데이터 백업 및 복구 기능을 백엔드 API로 만들어줘.

## 1단계: 백업 API
파일: server/api/backup.post.ts

요구사항:
- POST 요청 시 모든 일기 데이터 가져오기
- 이미지도 포함 (Base64로 인코딩)
- JSON 파일로 변환
- 파일명: diary-backup-YYYY-MM-DD.json
- 다운로드 링크 반환 또는 직접 파일 반환

반환 형식:
```typescript
{
  success: true,
  filename: string,
  data: {
    diaries: [...],
    images: [...], // Base64 인코딩
    exportedAt: string
  }
}
```

## 2단계: 복구 API
파일: server/api/restore.post.ts

요구사항:
- POST 요청으로 JSON 파일 받기
- 파일 형식 검증
- 기존 데이터 처리 옵션:
  * merge: 기존 데이터와 병합
  * replace: 기존 데이터 삭제 후 새 데이터로 교체
- Base64 이미지를 IndexedDB에 저장
- 일기 데이터 저장
- 진행 상황 반환

반환 형식:
```typescript
{
  success: true,
  message: string,
  imported: {
    diaries: number,
    images: number
  }
}
```

## 3단계: 프론트엔드 연동
파일: app/pages/settings.vue (새로 생성)

요구사항:
- "백업하기" 버튼
- "복구하기" 버튼 (파일 선택)
- 진행 상황 표시
- 경고 메시지 (데이터 손실 주의)
- confirm으로 한 번 더 확인

## 4단계: 에러 처리
- 파일 형식 오류
- 용량 초과
- 저장 실패
- 네트워크 오류
```

---

## 📌 프롬프트 6: 전체 백엔드 구조 정리

```
현재 백엔드 구조를 정리하고 개선해줘.

## 작업 내용

### 1단계: 현재 상태 파악
- server/api 폴더의 모든 파일 확인
- 각 API의 기능 정리
- 중복 코드 확인
- 에러 처리 일관성 확인

### 2단계: 공통 유틸리티 만들기
파일: server/utils/diary.ts

공통 함수:
- validateDiary(diary): 일기 데이터 유효성 검사
- generateId(): ID 생성
- formatDate(date): 날짜 포맷팅
- calculateStats(diaries): 통계 계산

### 3단계: 에러 처리 표준화
파일: server/utils/errors.ts

공통 에러:
- createNotFoundError(message)
- createValidationError(message)
- createServerError(message)

### 4단계: 타입 정의
파일: server/types/diary.ts

타입 정의:
- Diary 인터페이스
- CreateDiaryDto
- UpdateDiaryDto
- Stats 인터페이스

### 5단계: API 문서화
- 각 API의 설명 추가
- 파라미터 설명
- 반환 형식 설명
- 예제 추가

### 6단계: 테스트
- 각 API 개별 테스트
- 통합 테스트
- 에러 케이스 테스트
```

---

## 💡 사용 방법

1. **원하는 프롬프트를 복사**
2. **AI에게 붙여넣기**
3. **결과 확인 후 다음 단계 진행**

## 📝 순서 추천

1. **프롬프트 1** → 기본 API 만들기
2. **프롬프트 2** → 프론트엔드 연동
3. **프롬프트 3** → 통계 API
4. **프롬프트 5** → 백업/복구 (선택)
5. **프롬프트 4** → 데이터베이스 (고급)
6. **프롬프트 6** → 구조 정리

---

## 🎯 핵심 개념 (각 프롬프트마다 참고)

### API 엔드포인트
- `GET /api/hello` → 데이터 가져오기
- `POST /api/diaries` → 데이터 생성하기
- `PUT /api/diaries/123` → 데이터 수정하기
- `DELETE /api/diaries/123` → 데이터 삭제하기

### Nuxt Server API 파일명 규칙
- `hello.get.ts` → GET /api/hello
- `diaries.post.ts` → POST /api/diaries
- `diaries/[id].get.ts` → GET /api/diaries/123

### 프론트엔드에서 사용
```javascript
// GET 요청
const { data } = await useFetch('/api/hello')

// POST 요청
const { data } = await useFetch('/api/diaries', {
  method: 'POST',
  body: { content: '...', mood: 'happy' }
})
```

---

> 💬 각 프롬프트를 실행한 후 결과를 확인하고, 다음 단계로 진행하세요!




