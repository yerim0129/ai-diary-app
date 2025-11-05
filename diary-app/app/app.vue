<template>
  <div>
    <ThemeToggle />
    <NuxtPage />
  </div>
</template>

<script setup>
const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<style>
/* CSS 변수로 테마 색상 정의 */
:root {
  /* 라이트 모드 색상 */
  --bg-primary: #f5f7fa;
  --bg-secondary: #e8ecf3;
  --bg-card: #ffffff;
  --bg-hover: #f9fafb;
  --bg-hover-deep: #f3f4f6;

  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --text-body: #374151;

  --border-color: #e5e7eb;
  --shadow: rgba(0, 0, 0, 0.05);
  --shadow-hover: rgba(0, 0, 0, 0.1);
  --shadow-modal: rgba(0, 0, 0, 0.3);

  --accent-primary: #8b5cf6;
  --accent-secondary: #7c3aed;
  --accent-shadow: rgba(139, 92, 246, 0.3);

  --delete-bg: #fee2e2;
  --delete-bg-hover: #fecaca;
  --delete-text: #dc2626;
}

/* 다크 모드 색상 */
.dark {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --bg-card: #1f2937;
  --bg-hover: #374151;
  --bg-hover-deep: #4b5563;

  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --text-tertiary: #9ca3af;
  --text-body: #e5e7eb;

  --border-color: #374151;
  --shadow: rgba(0, 0, 0, 0.3);
  --shadow-hover: rgba(0, 0, 0, 0.5);
  --shadow-modal: rgba(0, 0, 0, 0.7);

  --accent-primary: #a78bfa;
  --accent-secondary: #8b5cf6;
  --accent-shadow: rgba(167, 139, 250, 0.4);

  --delete-bg: #7f1d1d;
  --delete-bg-hover: #991b1b;
  --delete-text: #fca5a5;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color 0.3s ease, color 0.3s ease;
}

button {
  font-family: inherit;
}
</style>
