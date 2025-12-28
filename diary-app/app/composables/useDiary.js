/**
 * 📔 일기 관리 Composable
 *
 * 백엔드 API를 통해 일기 CRUD 작업을 수행합니다.
 * - save: 새 일기 저장 (POST /api/diaries)
 * - getAll: 전체 일기 조회 (GET /api/diaries)
 * - getById: 특정 일기 조회 (GET /api/diaries/:id)
 * - deleteDiary: 일기 삭제 (DELETE /api/diaries/:id)
 * - update: 일기 수정 (PUT /api/diaries/:id)
 */

export const useDiary = () => {

  // ============================================
  // 🔧 헬퍼 함수: API 에러 처리
  // ============================================

  /**
   * API 에러를 처리하는 헬퍼 함수
   * @param {Error} error - 발생한 에러
   * @param {string} action - 수행 중이던 작업명
   */
  const handleApiError = (error, action) => {
    // 📌 에러 객체 전체 출력 (디버깅용)
    console.error(`❌ [useDiary] ${action} 실패:`, error)

    // 📌 HTTP 상태 코드별 처리
    if (error.statusCode) {
      switch (error.statusCode) {
        case 400:
          console.error(`⚠️ 잘못된 요청입니다. 입력 데이터를 확인하세요.`)
          break
        case 404:
          console.error(`⚠️ 요청한 데이터를 찾을 수 없습니다.`)
          break
        case 500:
          console.error(`⚠️ 서버 오류가 발생했습니다. 잠시 후 다시 시도하세요.`)
          break
        default:
          console.error(`⚠️ 알 수 없는 오류 (상태 코드: ${error.statusCode})`)
      }
    }

    // 📌 네트워크 오류 체크
    if (error.message?.includes('fetch')) {
      console.error(`🌐 네트워크 연결을 확인하세요.`)
    }
  }

  // ============================================
  // 📝 새 일기 저장 (POST /api/diaries)
  // ============================================

  /**
   * 새 일기를 저장합니다.
   * @param {Object} diary - 저장할 일기 데이터
   * @param {string} diary.content - 일기 내용 (필수)
   * @param {string} diary.mood - 기분 (필수)
   * @param {string} diary.date - 날짜 (필수)
   * @param {string[]} diary.images - 이미지 URL 배열 (선택)
   * @param {string} diary.prompt - AI 프롬프트 (선택)
   * @returns {Object|null} 저장된 일기 객체 또는 null
   */
  const save = async (diary) => {
    console.log('📝 [useDiary.save] 일기 저장 시작...')
    console.log('📝 [useDiary.save] 저장할 데이터:', diary)

    try {
      // 📌 $fetch를 사용하여 POST 요청
      // $fetch는 Nuxt에서 제공하는 HTTP 클라이언트입니다
      const response = await $fetch('/api/diaries', {
        method: 'POST',
        body: {
          content: diary.content,
          mood: diary.mood,
          date: diary.date,
          images: diary.images || [],
          prompt: diary.prompt,
          // AI 분석 결과
          emotion: diary.emotion,
          emotionScore: diary.emotionScore,
          keywords: diary.keywords || [],
          feedback: diary.feedback,
          advice: diary.advice,
          aiSource: diary.aiSource
        }
      })

      console.log('✅ [useDiary.save] 저장 성공!')
      console.log('✅ [useDiary.save] 서버 응답:', response)

      // 📌 서버에서 반환한 diary 객체 반환 (ID, createdAt 포함)
      return response.diary

    } catch (error) {
      handleApiError(error, '일기 저장')
      throw new Error('일기를 저장하는 중 오류가 발생했습니다.')
    }
  }

  // ============================================
  // 📋 전체 일기 조회 (GET /api/diaries)
  // ============================================

  /**
   * 모든 일기를 조회합니다.
   * @param {Object} options - 조회 옵션
   * @param {number} options.limit - 최대 조회 개수
   * @param {string} options.mood - 기분 필터
   * @param {string} options.search - 🔍 검색어 (일기 내용, 프롬프트, 날짜에서 검색)
   * @returns {Array} 일기 배열 (에러 시 빈 배열)
   */
  const getAll = async (options = {}) => {
    console.log('📋 [useDiary.getAll] 전체 일기 조회 시작...')
    console.log('📋 [useDiary.getAll] 옵션:', options)

    try {
      // 📌 쿼리 파라미터 구성
      const queryParams = new URLSearchParams()
      if (options.limit) queryParams.append('limit', options.limit)
      if (options.mood) queryParams.append('mood', options.mood)
      if (options.search) queryParams.append('search', options.search)  // 🔍 검색어 추가

      const queryString = queryParams.toString()
      const url = queryString ? `/api/diaries?${queryString}` : '/api/diaries'

      console.log('📋 [useDiary.getAll] 요청 URL:', url)

      // 📌 $fetch를 사용하여 GET 요청
      const response = await $fetch(url)

      console.log('✅ [useDiary.getAll] 조회 성공!')
      console.log(`✅ [useDiary.getAll] 총 ${response.count}개의 일기 조회됨`)
      console.log('✅ [useDiary.getAll] 일기 목록:', response.diaries)

      return response.diaries || []

    } catch (error) {
      handleApiError(error, '일기 목록 조회')
      // 📌 에러 시 빈 배열 반환 (UI가 깨지지 않도록)
      return []
    }
  }

  // ============================================
  // 🔍 특정 일기 조회 (GET /api/diaries/:id)
  // ============================================

  /**
   * ID로 특정 일기를 조회합니다.
   * @param {string} id - 조회할 일기 ID
   * @returns {Object|null} 일기 객체 또는 null
   */
  const getById = async (id) => {
    console.log(`🔍 [useDiary.getById] 일기 조회 시작... ID: ${id}`)

    if (!id) {
      console.warn('⚠️ [useDiary.getById] ID가 제공되지 않았습니다.')
      return null
    }

    try {
      // 📌 $fetch를 사용하여 GET 요청
      const response = await $fetch(`/api/diaries/${id}`)

      console.log('✅ [useDiary.getById] 조회 성공!')
      console.log('✅ [useDiary.getById] 조회된 일기:', response.diary)

      return response.diary

    } catch (error) {
      handleApiError(error, '일기 조회')
      // 📌 404 에러 등에서는 null 반환
      return null
    }
  }

  // ============================================
  // 🗑️ 일기 삭제 (DELETE /api/diaries/:id)
  // ============================================

  /**
   * 특정 일기를 삭제합니다.
   * @param {string} id - 삭제할 일기 ID
   * @returns {boolean} 삭제 성공 여부
   */
  const deleteDiary = async (id) => {
    console.log(`🗑️ [useDiary.deleteDiary] 일기 삭제 시작... ID: ${id}`)

    if (!id) {
      console.warn('⚠️ [useDiary.deleteDiary] ID가 제공되지 않았습니다.')
      return false
    }

    try {
      // 📌 $fetch를 사용하여 DELETE 요청
      const response = await $fetch(`/api/diaries/${id}`, {
        method: 'DELETE'
      })

      console.log('✅ [useDiary.deleteDiary] 삭제 성공!')
      console.log('✅ [useDiary.deleteDiary] 서버 응답:', response)

      return true

    } catch (error) {
      handleApiError(error, '일기 삭제')
      throw new Error('일기를 삭제하는 중 오류가 발생했습니다.')
    }
  }

  // ============================================
  // ✏️ 일기 수정 (PUT /api/diaries/:id)
  // ============================================

  /**
   * 특정 일기를 수정합니다.
   * @param {string} id - 수정할 일기 ID
   * @param {Object} updatedDiary - 수정할 데이터
   * @returns {Object|null} 수정된 일기 객체 또는 null
   */
  const update = async (id, updatedDiary) => {
    console.log(`✏️ [useDiary.update] 일기 수정 시작... ID: ${id}`)
    console.log('✏️ [useDiary.update] 수정할 데이터:', updatedDiary)

    if (!id) {
      console.warn('⚠️ [useDiary.update] ID가 제공되지 않았습니다.')
      return null
    }

    try {
      // 📌 $fetch를 사용하여 PUT 요청
      const response = await $fetch(`/api/diaries/${id}`, {
        method: 'PUT',
        body: updatedDiary
      })

      console.log('✅ [useDiary.update] 수정 성공!')
      console.log('✅ [useDiary.update] 수정된 일기:', response.diary)

      return response.diary

    } catch (error) {
      handleApiError(error, '일기 수정')
      throw new Error('일기를 수정하는 중 오류가 발생했습니다.')
    }
  }

  // ============================================
  // 📦 반환: 모든 함수들 내보내기
  // ============================================

  return {
    save,       // 새 일기 저장
    getAll,     // 전체 일기 조회
    getById,    // 특정 일기 조회
    deleteDiary, // 일기 삭제
    update      // 일기 수정
  }
}

// ============================================
// 💾 [백업] 기존 localStorage 코드
// 필요 시 오프라인 모드나 폴백용으로 사용 가능
// ============================================

/*
export const useDiaryLocalStorage = () => {
  // 저장
  const saveToLocalStorage = (diary) => {
    if (typeof window === 'undefined') return

    try {
      const diaries = JSON.parse(localStorage.getItem('diaries') || '[]')
      diaries.unshift(diary)
      localStorage.setItem('diaries', JSON.stringify(diaries))
    } catch (error) {
      console.error('일기 저장 실패:', error)
      throw new Error('일기를 저장하는 중 오류가 발생했습니다.')
    }
  }

  // 전체 불러오기
  const getAllFromLocalStorage = () => {
    if (typeof window === 'undefined') return []

    try {
      return JSON.parse(localStorage.getItem('diaries') || '[]')
    } catch (error) {
      console.error('일기 불러오기 실패:', error)
      return []
    }
  }

  // ID로 일기 1개 조회
  const getByIdFromLocalStorage = (id) => {
    if (typeof window === 'undefined') return null

    try {
      const diaries = getAllFromLocalStorage()
      const diary = diaries.find(d => d.id === id)

      if (!diary) {
        console.warn(`일기를 찾을 수 없습니다. ID: ${id}`)
        return null
      }

      return diary
    } catch (error) {
      console.error('일기 조회 실패:', error)
      return null
    }
  }

  // 일기 삭제
  const deleteFromLocalStorage = (id) => {
    if (typeof window === 'undefined') return false

    try {
      const diaries = getAllFromLocalStorage()
      const index = diaries.findIndex(d => d.id === id)

      if (index === -1) {
        console.warn(`삭제할 일기를 찾을 수 없습니다. ID: ${id}`)
        return false
      }

      const filteredDiaries = diaries.filter(d => d.id !== id)
      localStorage.setItem('diaries', JSON.stringify(filteredDiaries))
      return true
    } catch (error) {
      console.error('일기 삭제 실패:', error)
      throw new Error('일기를 삭제하는 중 오류가 발생했습니다.')
    }
  }

  // 일기 수정
  const updateInLocalStorage = (id, updatedDiary) => {
    if (typeof window === 'undefined') return false

    try {
      const diaries = getAllFromLocalStorage()
      const index = diaries.findIndex(d => d.id === id)

      if (index === -1) {
        console.warn(`수정할 일기를 찾을 수 없습니다. ID: ${id}`)
        return false
      }

      diaries[index] = {
        ...diaries[index],
        ...updatedDiary,
        id: diaries[index].id,
        updatedAt: new Date().toISOString()
      }

      localStorage.setItem('diaries', JSON.stringify(diaries))
      return true
    } catch (error) {
      console.error('일기 수정 실패:', error)
      throw new Error('일기를 수정하는 중 오류가 발생했습니다.')
    }
  }

  return {
    save: saveToLocalStorage,
    getAll: getAllFromLocalStorage,
    getById: getByIdFromLocalStorage,
    deleteDiary: deleteFromLocalStorage,
    update: updateInLocalStorage
  }
}
*/
