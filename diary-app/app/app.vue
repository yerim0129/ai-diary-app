<template>
  <div class="app-wrapper">
    <!-- Scroll Progress Indicator -->
    <ScrollProgress />

    <!-- Theme Toggle -->
    <ThemeToggle />

    <!-- Page Content with Transition -->
    <NuxtPage />

    <!-- Floating Action Button (shown on non-write pages) -->
    <FloatingActionButton v-if="!isWritePage" />
  </div>
</template>

<script setup>
const { initTheme } = useTheme()
const route = useRoute()

const isWritePage = computed(() => route.path === '/write')

onMounted(() => {
  initTheme()
})
</script>

<style>
/* ============================================
   AI DIARY - Design System 2025
   Warm, Human, Portfolio-Quality
   ============================================ */

/* Pretendard 폰트 */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');

:root {
  /* ============================================
     COLOR TOKENS - Light Mode
     Warm & Muted 다이어리 감성
     ============================================ */

  /* Background */
  --bg-base: #FAFAF8;
  --bg-subtle: #F5F3EF;
  --bg-card: #FFFFFF;
  --bg-elevated: #FFFFFF;
  --bg-hover: #F0EDE8;
  --bg-active: #E8E4DD;

  /* Text */
  --text-primary: #1C1917;
  --text-secondary: #57534E;
  --text-tertiary: #A8A29E;
  --text-muted: #D6D3D1;
  --text-inverse: #FAFAF8;

  /* Accent - Warm Terracotta */
  --accent: #D4956A;
  --accent-hover: #C4855A;
  --accent-active: #B4754A;
  --accent-subtle: rgba(212, 149, 106, 0.12);
  --accent-glow: rgba(212, 149, 106, 0.25);

  /* Border */
  --border-default: #E7E5E4;
  --border-subtle: #F5F5F4;
  --border-strong: #D6D3D1;

  /* Semantic - Muted tones */
  --success: #6B9B7A;
  --success-subtle: rgba(107, 155, 122, 0.12);
  --warning: #C9A856;
  --warning-subtle: rgba(201, 168, 86, 0.12);
  --error: #C17272;
  --error-subtle: rgba(193, 114, 114, 0.12);

  /* Emotion Colors - Muted & Warm */
  --emotion-happy: #E8B87D;
  --emotion-happy-subtle: rgba(232, 184, 125, 0.15);
  --emotion-happy-bg: rgba(232, 184, 125, 0.12);
  --emotion-calm: #7EB8A0;
  --emotion-calm-subtle: rgba(126, 184, 160, 0.15);
  --emotion-calm-bg: rgba(126, 184, 160, 0.12);
  --emotion-sad: #8BA5C4;
  --emotion-sad-subtle: rgba(139, 165, 196, 0.15);
  --emotion-sad-bg: rgba(139, 165, 196, 0.12);
  --emotion-angry: #D49090;
  --emotion-angry-subtle: rgba(212, 144, 144, 0.15);
  --emotion-angry-bg: rgba(212, 144, 144, 0.12);
  --emotion-tired: #B0A8B8;
  --emotion-tired-subtle: rgba(176, 168, 184, 0.15);
  --emotion-tired-bg: rgba(176, 168, 184, 0.12);

  /* ============================================
     SHADOW TOKENS
     Subtle & Layered
     ============================================ */
  --shadow-xs: 0 1px 2px rgba(28, 25, 23, 0.03);
  --shadow-sm: 0 2px 4px rgba(28, 25, 23, 0.04), 0 1px 2px rgba(28, 25, 23, 0.02);
  --shadow-md: 0 4px 12px rgba(28, 25, 23, 0.06), 0 2px 4px rgba(28, 25, 23, 0.03);
  --shadow-lg: 0 12px 24px rgba(28, 25, 23, 0.08), 0 4px 8px rgba(28, 25, 23, 0.04);
  --shadow-xl: 0 20px 40px rgba(28, 25, 23, 0.10), 0 8px 16px rgba(28, 25, 23, 0.05);
  --shadow-glow: 0 0 24px var(--accent-glow);
  --shadow-card-hover: 0 16px 32px rgba(28, 25, 23, 0.08), 0 6px 12px rgba(28, 25, 23, 0.04);

  /* ============================================
     MOTION TOKENS
     Natural & Refined
     ============================================ */
  --duration-instant: 100ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --duration-slower: 600ms;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-bounce: cubic-bezier(0.68, -0.6, 0.32, 1.6);

  /* ============================================
     SPACING TOKENS
     Consistent rhythm
     ============================================ */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;

  /* ============================================
     RADIUS TOKENS
     Soft & Organic
     ============================================ */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-2xl: 32px;
  --radius-full: 9999px;

  /* ============================================
     TYPOGRAPHY TOKENS
     ============================================ */
  --font-sans: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;

  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.01em;

  /* Legacy support (기존 변수 호환) */
  --bg-primary: var(--bg-base);
  --bg-secondary: var(--bg-subtle);
  --text-body: var(--text-secondary);
  --border-color: var(--border-default);
  --accent-primary: var(--accent);
  --accent-secondary: var(--accent-hover);
  --accent-shadow: var(--accent-glow);
  --shadow: var(--shadow-sm);
  --shadow-hover: var(--shadow-md);
  --shadow-modal: rgba(0, 0, 0, 0.4);
  --delete-bg: var(--error-subtle);
  --delete-bg-hover: rgba(193, 114, 114, 0.2);
  --delete-text: var(--error);
}

/* ============================================
   DARK MODE
   Deep & Calm
   ============================================ */
.dark {
  /* Background */
  --bg-base: #0F0F0F;
  --bg-subtle: #1A1A1A;
  --bg-card: #1F1F1F;
  --bg-elevated: #262626;
  --bg-hover: #2A2A2A;
  --bg-active: #333333;

  /* Text */
  --text-primary: #FAFAF8;
  --text-secondary: #A8A29E;
  --text-tertiary: #6B6B6B;
  --text-muted: #404040;
  --text-inverse: #1C1917;

  /* Accent */
  --accent: #E8B07D;
  --accent-hover: #F0C090;
  --accent-active: #D4A06D;
  --accent-subtle: rgba(232, 176, 125, 0.15);
  --accent-glow: rgba(232, 176, 125, 0.20);

  /* Border */
  --border-default: #2A2A2A;
  --border-subtle: #222222;
  --border-strong: #404040;

  /* Semantic */
  --success: #7DAF8C;
  --success-subtle: rgba(125, 175, 140, 0.15);
  --warning: #D4B86A;
  --warning-subtle: rgba(212, 184, 106, 0.15);
  --error: #D49090;
  --error-subtle: rgba(212, 144, 144, 0.15);

  /* Emotion Colors - Slightly brighter for dark mode */
  --emotion-happy: #F0C48D;
  --emotion-happy-subtle: rgba(240, 196, 141, 0.12);
  --emotion-happy-bg: rgba(240, 196, 141, 0.15);
  --emotion-calm: #8CC4AC;
  --emotion-calm-subtle: rgba(140, 196, 172, 0.12);
  --emotion-calm-bg: rgba(140, 196, 172, 0.15);
  --emotion-sad: #9BB5D0;
  --emotion-sad-subtle: rgba(155, 181, 208, 0.12);
  --emotion-sad-bg: rgba(155, 181, 208, 0.15);
  --emotion-angry: #E0A0A0;
  --emotion-angry-subtle: rgba(224, 160, 160, 0.12);
  --emotion-angry-bg: rgba(224, 160, 160, 0.15);
  --emotion-tired: #C0B8C8;
  --emotion-tired-subtle: rgba(192, 184, 200, 0.12);
  --emotion-tired-bg: rgba(192, 184, 200, 0.15);

  /* Shadow - More pronounced for dark */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.25);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 12px 24px rgba(0, 0, 0, 0.35);
  --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.4);
  --shadow-card-hover: 0 16px 32px rgba(0, 0, 0, 0.35);

  /* Legacy support */
  --bg-primary: var(--bg-base);
  --bg-secondary: var(--bg-subtle);
  --bg-hover-deep: var(--bg-active);
  --shadow-modal: rgba(0, 0, 0, 0.7);
}

/* ============================================
   BASE STYLES
   ============================================ */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--text-primary);
  background-color: var(--bg-base);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition:
    background-color var(--duration-slow) var(--ease-out),
    color var(--duration-slow) var(--ease-out);
}

/* Focus visible for accessibility */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Selection color */
::selection {
  background-color: var(--accent-subtle);
  color: var(--text-primary);
}

button, input, textarea, select {
  font-family: inherit;
  font-size: inherit;
}

a {
  color: var(--accent);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out);
}

a:hover {
  color: var(--accent-hover);
}

/* ============================================
   UTILITY CLASSES
   ============================================ */
.app-wrapper {
  min-height: 100vh;
  background-color: var(--bg-base);
}

/* Smooth transitions for interactive elements */
.interactive {
  transition:
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

/* Card base style */
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-sm);
  transition:
    transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
  border-color: var(--border-default);
}

/* Button base */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition:
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.btn:hover {
  transform: translateY(-1px) scale(1.02);
}

.btn:active {
  transform: translateY(0) scale(0.98);
}

.btn-primary {
  background: var(--accent);
  color: var(--text-inverse);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background: var(--accent-hover);
  box-shadow: var(--shadow-md), var(--shadow-glow);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  html {
    scroll-behavior: auto;
  }
}

/* ============================================
   ANIMATIONS
   ============================================ */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* Animation utilities */
.animate-fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-out) forwards;
}

.animate-fade-in-up {
  animation: fadeInUp var(--duration-normal) var(--ease-out) forwards;
}

.animate-scale-in {
  animation: scaleIn var(--duration-normal) var(--ease-out) forwards;
}

.animate-pulse {
  animation: pulse 2s var(--ease-in-out) infinite;
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    var(--bg-subtle) 0%,
    var(--bg-hover) 50%,
    var(--bg-subtle) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-float {
  animation: float 3s var(--ease-in-out) infinite;
}

/* Stagger animation delays */
.stagger-1 { animation-delay: 0.05s; }
.stagger-2 { animation-delay: 0.1s; }
.stagger-3 { animation-delay: 0.15s; }
.stagger-4 { animation-delay: 0.2s; }
.stagger-5 { animation-delay: 0.25s; }
.stagger-6 { animation-delay: 0.3s; }
</style>
