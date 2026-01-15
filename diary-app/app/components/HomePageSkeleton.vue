<template>
  <div class="skeleton-container">
    <div class="skeleton-content">
      <!-- 헤더 스켈레톤 -->
      <header class="skeleton-header">
        <div class="skeleton-line skeleton-sm animate-shimmer"></div>
        <div class="skeleton-line skeleton-lg animate-shimmer"></div>
        <div class="skeleton-line skeleton-md animate-shimmer"></div>
      </header>

      <!-- Bento Grid 스켈레톤 -->
      <div class="skeleton-bento">
        <!-- 메인 CTA -->
        <div class="skeleton-card skeleton-main animate-shimmer"></div>

        <!-- 통계 카드 2개 -->
        <div class="skeleton-card skeleton-stat animate-shimmer">
          <div class="skeleton-icon"></div>
          <div class="skeleton-stat-content">
            <div class="skeleton-line skeleton-value"></div>
            <div class="skeleton-line skeleton-label"></div>
          </div>
        </div>
        <div class="skeleton-card skeleton-stat animate-shimmer">
          <div class="skeleton-icon"></div>
          <div class="skeleton-stat-content">
            <div class="skeleton-line skeleton-value"></div>
            <div class="skeleton-line skeleton-label"></div>
          </div>
        </div>

        <!-- 최근 일기 -->
        <div class="skeleton-card skeleton-recent">
          <div class="skeleton-recent-header">
            <div class="skeleton-line" style="width: 80px; height: 20px;"></div>
            <div class="skeleton-line" style="width: 60px; height: 16px;"></div>
          </div>
          <div class="skeleton-diary-list">
            <div v-for="i in 3" :key="i" class="skeleton-diary-item animate-shimmer">
              <div class="skeleton-emoji"></div>
              <div class="skeleton-diary-content">
                <div class="skeleton-line" style="width: 60px; height: 12px;"></div>
                <div class="skeleton-line" style="width: 100%; height: 14px;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 리포트 -->
        <div class="skeleton-card skeleton-report animate-shimmer">
          <div class="skeleton-icon"></div>
          <div class="skeleton-stat-content">
            <div class="skeleton-line skeleton-label"></div>
            <div class="skeleton-line skeleton-value"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-container {
  min-height: 100vh;
  padding: var(--space-5);
}

.skeleton-content {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
}

/* Header */
.skeleton-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-10);
}

.skeleton-line {
  background: var(--bg-subtle);
  border-radius: var(--radius-md);
}

.skeleton-sm {
  width: 80px;
  height: 16px;
}

.skeleton-md {
  width: 200px;
  height: 16px;
}

.skeleton-lg {
  width: 280px;
  height: 36px;
}

/* Bento Grid */
.skeleton-bento {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.skeleton-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-subtle);
}

.skeleton-main {
  grid-column: span 2;
  height: 100px;
}

.skeleton-stat {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  height: 140px;
}

.skeleton-icon {
  width: 48px;
  height: 48px;
  background: var(--bg-subtle);
  border-radius: var(--radius-md);
}

.skeleton-stat-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skeleton-value {
  width: 80px;
  height: 32px;
}

.skeleton-label {
  width: 60px;
  height: 14px;
}

.skeleton-recent {
  grid-column: span 2;
  padding: var(--space-6);
}

.skeleton-recent-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-5);
}

.skeleton-diary-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.skeleton-diary-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-subtle);
  border-radius: var(--radius-lg);
}

.skeleton-emoji {
  width: 48px;
  height: 48px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.skeleton-diary-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skeleton-report {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Shimmer animation */
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

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 640px) {
  .skeleton-bento {
    grid-template-columns: 1fr;
  }

  .skeleton-main,
  .skeleton-recent {
    grid-column: span 1;
  }

  .skeleton-lg {
    width: 200px;
    height: 28px;
  }
}
</style>
