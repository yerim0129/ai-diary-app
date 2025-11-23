export const useDiary = () => {
  // 저장
  const save = (diary) => {
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
  const getAll = () => {
    if (typeof window === 'undefined') return []

    try {
      return JSON.parse(localStorage.getItem('diaries') || '[]')
    } catch (error) {
      console.error('일기 불러오기 실패:', error)
      return []
    }
  }

  // ID로 일기 1개 조회
  const getById = (id) => {
    if (typeof window === 'undefined') return null

    try {
      const diaries = getAll()
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
  const deleteDiary = (id) => {
    if (typeof window === 'undefined') return false

    try {
      const diaries = getAll()
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
  const update = (id, updatedDiary) => {
    if (typeof window === 'undefined') return false

    try {
      const diaries = getAll()
      const index = diaries.findIndex(d => d.id === id)

      if (index === -1) {
        console.warn(`수정할 일기를 찾을 수 없습니다. ID: ${id}`)
        return false
      }

      // 기존 데이터와 병합 (ID와 생성일은 유지)
      diaries[index] = {
        ...diaries[index],
        ...updatedDiary,
        id: diaries[index].id, // ID는 변경 불가
        updatedAt: new Date().toISOString() // 수정 시간 추가
      }

      localStorage.setItem('diaries', JSON.stringify(diaries))
      return true
    } catch (error) {
      console.error('일기 수정 실패:', error)
      throw new Error('일기를 수정하는 중 오류가 발생했습니다.')
    }
  }

  return {
    save,
    getAll,
    getById,
    deleteDiary,
    update
  }
}
