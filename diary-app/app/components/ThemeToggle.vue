<template>
  <button @click="toggleTheme" class="theme-toggle" :title="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'">
    <span class="icon">{{ isDark ? '☀️' : '🌙' }}</span>
  </button>
</template>

<script setup>
const { isDark, toggleTheme } = useTheme()
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 100;
}

.theme-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.icon {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.theme-toggle:hover .icon {
  transform: rotate(20deg);
}

/* 다크모드 스타일 */
:global(.dark) .theme-toggle {
  background: #374151;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@media (max-width: 640px) {
  .theme-toggle {
    width: 48px;
    height: 48px;
    top: 16px;
    right: 16px;
  }

  .icon {
    font-size: 1.3rem;
  }
}
</style>
