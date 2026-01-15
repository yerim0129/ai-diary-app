<template>
  <NuxtLink
    to="/write"
    class="fab"
    :class="{ visible: isVisible, hidden: !isVisible }"
    aria-label="새 일기 쓰기"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
    <span class="fab-tooltip">새 일기 쓰기</span>
  </NuxtLink>
</template>

<script setup>
const isVisible = ref(true)
let lastScrollY = 0
const scrollThreshold = 50

const handleScroll = () => {
  const currentScrollY = window.scrollY

  if (currentScrollY < scrollThreshold) {
    isVisible.value = true
  } else if (currentScrollY > lastScrollY) {
    // Scrolling down
    isVisible.value = false
  } else {
    // Scrolling up
    isVisible.value = true
  }

  lastScrollY = currentScrollY
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.fab {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg), 0 0 20px var(--accent-glow);
  cursor: pointer;
  text-decoration: none;
  z-index: 100;
  transition:
    transform var(--duration-normal) var(--ease-spring),
    opacity var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out),
    background var(--duration-fast) var(--ease-out);
}

.fab.visible {
  transform: translateY(0) scale(1);
  opacity: 1;
}

.fab.hidden {
  transform: translateY(80px) scale(0.8);
  opacity: 0;
  pointer-events: none;
}

.fab:hover {
  transform: translateY(-4px) scale(1.05);
  background: var(--accent-hover);
  box-shadow: var(--shadow-xl), 0 0 30px var(--accent-glow);
}

.fab:active {
  transform: translateY(0) scale(0.95);
}

/* Tooltip */
.fab-tooltip {
  position: absolute;
  right: calc(100% + var(--space-3));
  white-space: nowrap;
  background: var(--bg-card);
  color: var(--text-primary);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  box-shadow: var(--shadow-md);
  opacity: 0;
  transform: translateX(8px);
  transition:
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
  pointer-events: none;
}

.fab:hover .fab-tooltip {
  opacity: 1;
  transform: translateX(0);
}

/* Responsive */
@media (max-width: 640px) {
  .fab {
    bottom: var(--space-5);
    right: var(--space-5);
    width: 52px;
    height: 52px;
  }

  .fab svg {
    width: 22px;
    height: 22px;
  }

  .fab-tooltip {
    display: none;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .fab {
    transition: opacity var(--duration-fast) var(--ease-out);
  }

  .fab.hidden {
    transform: translateY(0) scale(1);
  }
}
</style>
