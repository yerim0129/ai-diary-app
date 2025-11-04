export const useDiary = () => {
  // 저장
  const save = (diary) => {
    if (typeof window === 'undefined') return

    const diaries = JSON.parse(localStorage.getItem('diaries') || '[]')
    diaries.unshift(diary)
    localStorage.setItem('diaries', JSON.stringify(diaries))
  }

  // 불러오기
  const getAll = () => {
    if (typeof window === 'undefined') return []

    return JSON.parse(localStorage.getItem('diaries') || '[]')
  }

  return { save, getAll }
}
