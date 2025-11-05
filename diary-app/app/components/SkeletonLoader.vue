<template>
  <div class="skeleton" :class="skeletonClass" :style="skeletonStyle"></div>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'text', // text, title, card, circle, button
    validator: (value) => ['text', 'title', 'card', 'circle', 'button', 'custom'].includes(value)
  },
  width: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: ''
  }
})

const skeletonClass = computed(() => {
  return `skeleton-${props.type}`
})

const skeletonStyle = computed(() => {
  const styles = {}
  if (props.width) styles.width = props.width
  if (props.height) styles.height = props.height
  return styles
})
</script>

<style scoped>
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-hover) 0%,
    var(--bg-hover-deep) 50%,
    var(--bg-hover) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 타입별 기본 스타일 */
.skeleton-text {
  height: 16px;
  width: 100%;
  margin-bottom: 8px;
}

.skeleton-title {
  height: 32px;
  width: 60%;
  margin-bottom: 16px;
}

.skeleton-card {
  height: 120px;
  width: 100%;
  border-radius: 16px;
}

.skeleton-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.skeleton-button {
  height: 48px;
  width: 100%;
  border-radius: 12px;
}
</style>
