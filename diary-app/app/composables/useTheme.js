/**
 * 테마(다크모드) 관리 Composable
 * localStorage를 통해 사용자의 테마 선택을 저장하고 관리합니다.
 */

export const useTheme = () => {
  const isDark = useState('isDark', () => false)

  /**
   * 테마 초기화
   * localStorage에서 저장된 테마 설정을 불러오고 적용합니다.
   */
  const initTheme = () => {
    if (typeof window === 'undefined') return

    // localStorage에서 테마 설정 불러오기
    const savedTheme = localStorage.getItem('theme')

    if (savedTheme) {
      // 저장된 설정이 있으면 사용
      isDark.value = savedTheme === 'dark'
    } else {
      // 저장된 설정이 없으면 시스템 설정 감지
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    // 테마 클래스 적용
    applyTheme()
  }

  /**
   * 테마 토글
   * 라이트모드 ↔ 다크모드 전환
   */
  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()

    // localStorage에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    }
  }

  /**
   * 테마 클래스 적용
   * document.documentElement에 'dark' 클래스를 추가/제거합니다.
   */
  const applyTheme = () => {
    if (typeof window === 'undefined') return

    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return {
    isDark: readonly(isDark),
    initTheme,
    toggleTheme
  }
}
