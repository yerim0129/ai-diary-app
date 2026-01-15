<template>
  <button
    @click="handleToggle"
    class="theme-toggle"
    :class="{ 'is-dark': isDark }"
    :title="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'"
    :aria-label="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'"
  >
    <div class="toggle-track">
      <div class="toggle-thumb">
        <svg v-if="isDark" class="icon icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg v-else class="icon icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </div>
    </div>
  </button>
</template>

<script setup>
const { isDark, toggleTheme } = useTheme()

const handleToggle = () => {
  toggleTheme()
}
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  top: var(--space-5);
  right: var(--space-5);
  width: 52px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  z-index: 100;
  -webkit-tap-highlight-color: transparent;
}

.toggle-track {
  width: 100%;
  height: 100%;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  position: relative;
  transition:
    background var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  background: var(--bg-card);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  transition:
    transform var(--duration-normal) var(--ease-spring),
    background var(--duration-normal) var(--ease-out);
}

/* Dark mode */
.is-dark .toggle-track {
  background: var(--accent-subtle);
  border-color: var(--accent)40;
}

.is-dark .toggle-thumb {
  transform: translateX(24px);
  background: var(--accent);
}

.is-dark .icon {
  color: var(--text-inverse);
}

/* Icons */
.icon {
  width: 14px;
  height: 14px;
  color: var(--accent);
  transition:
    transform var(--duration-normal) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
}

.icon-sun {
  animation: sunRise var(--duration-normal) var(--ease-out);
}

.icon-moon {
  animation: moonRise var(--duration-normal) var(--ease-out);
}

/* Hover effects */
.theme-toggle:hover .toggle-track {
  border-color: var(--accent);
}

.theme-toggle:hover .toggle-thumb {
  box-shadow: var(--shadow-md);
}

.theme-toggle:active .toggle-thumb {
  transform: scale(0.95);
}

.is-dark.theme-toggle:active .toggle-thumb {
  transform: translateX(24px) scale(0.95);
}

/* Focus state */
.theme-toggle:focus-visible .toggle-track {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Animations */
@keyframes sunRise {
  from {
    opacity: 0;
    transform: rotate(-90deg) scale(0.5);
  }
  to {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
}

@keyframes moonRise {
  from {
    opacity: 0;
    transform: rotate(90deg) scale(0.5);
  }
  to {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .theme-toggle {
    top: var(--space-4);
    right: var(--space-4);
    width: 48px;
    height: 26px;
  }

  .toggle-thumb {
    width: 20px;
    height: 20px;
  }

  .is-dark .toggle-thumb {
    transform: translateX(22px);
  }

  .is-dark.theme-toggle:active .toggle-thumb {
    transform: translateX(22px) scale(0.95);
  }

  .icon {
    width: 12px;
    height: 12px;
  }
}
</style>
