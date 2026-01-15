<template>
  <div class="scroll-progress-container">
    <div
      class="scroll-progress-bar"
      :style="{ transform: `scaleX(${progress})` }"
    ></div>
  </div>
</template>

<script setup>
const progress = ref(0)

const updateProgress = () => {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight

  if (docHeight > 0) {
    progress.value = Math.min(scrollTop / docHeight, 1)
  }
}

onMounted(() => {
  window.addEventListener('scroll', updateProgress, { passive: true })
  updateProgress()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress)
})
</script>

<style scoped>
.scroll-progress-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 1000;
  background: transparent;
  pointer-events: none;
}

.scroll-progress-bar {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--accent) 0%,
    var(--emotion-happy) 50%,
    var(--accent-hover) 100%
  );
  transform-origin: left center;
  transition: transform 0.1s linear;
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
  box-shadow: 0 0 8px var(--accent-glow);
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .scroll-progress-bar {
    transition: none;
  }
}
</style>
