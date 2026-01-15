<template>
  <Transition
    :name="transitionName"
    mode="out-in"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @leave="onLeave"
  >
    <slot />
  </Transition>
</template>

<script setup>
defineProps({
  transitionName: {
    type: String,
    default: 'page-fade'
  }
})

const onBeforeEnter = (el) => {
  el.style.opacity = '0'
  el.style.transform = 'translateY(16px)'
}

const onEnter = (el, done) => {
  el.offsetHeight // Force reflow
  el.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out'
  el.style.opacity = '1'
  el.style.transform = 'translateY(0)'
  el.addEventListener('transitionend', done, { once: true })
}

const onLeave = (el, done) => {
  el.style.transition = 'opacity 0.15s ease-out, transform 0.15s ease-out'
  el.style.opacity = '0'
  el.style.transform = 'translateY(-8px)'
  el.addEventListener('transitionend', done, { once: true })
}
</script>

<style>
/* Page fade transition */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Page slide transition */
.page-slide-enter-active,
.page-slide-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

/* Page scale transition */
.page-scale-enter-active,
.page-scale-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.page-scale-enter-from {
  opacity: 0;
  transform: scale(0.96);
}

.page-scale-leave-to {
  opacity: 0;
  transform: scale(1.02);
}
</style>
