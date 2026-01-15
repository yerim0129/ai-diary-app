<template>
  <div class="skeleton-page">
    <div class="skeleton-content">
      <!-- 헤더 -->
      <header class="skeleton-header">
        <div class="skeleton-back animate-shimmer"></div>
        <div class="skeleton-header-text">
          <div class="skeleton-label animate-shimmer"></div>
          <div class="skeleton-title animate-shimmer"></div>
          <div class="skeleton-subtitle animate-shimmer"></div>
        </div>
      </header>

      <!-- 검색창 -->
      <div class="skeleton-search animate-shimmer"></div>

      <!-- 통계 그리드 -->
      <div class="skeleton-stats-row">
        <div v-for="i in 3" :key="i" class="skeleton-stat-card animate-shimmer">
          <div class="skeleton-stat-icon"></div>
          <div class="skeleton-stat-info">
            <div class="skeleton-stat-value"></div>
            <div class="skeleton-stat-label"></div>
          </div>
        </div>
      </div>

      <!-- 감정 분포 카드 -->
      <div class="skeleton-card animate-shimmer">
        <div class="skeleton-card-header">
          <div class="skeleton-card-title"></div>
          <div class="skeleton-card-badge"></div>
        </div>
        <div class="skeleton-mood-list">
          <div v-for="i in 5" :key="i" class="skeleton-mood-item">
            <div class="skeleton-mood-emoji"></div>
            <div class="skeleton-mood-info">
              <div class="skeleton-mood-header">
                <div class="skeleton-mood-name"></div>
                <div class="skeleton-mood-count"></div>
              </div>
              <div class="skeleton-mood-bar"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 일기 리스트 카드 -->
      <div class="skeleton-card animate-shimmer">
        <div class="skeleton-card-header">
          <div class="skeleton-card-title"></div>
          <div class="skeleton-card-badge"></div>
        </div>
        <div class="skeleton-diary-list">
          <div v-for="i in 4" :key="i" class="skeleton-diary-item">
            <div class="skeleton-diary-emoji"></div>
            <div class="skeleton-diary-info">
              <div class="skeleton-diary-date"></div>
              <div class="skeleton-diary-prompt"></div>
            </div>
            <div class="skeleton-diary-btn"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-page {
  min-height: 100vh;
  padding: var(--space-5);
}

.skeleton-content {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

/* Header */
.skeleton-header {
  margin-bottom: var(--space-8);
}

.skeleton-back {
  width: 100px;
  height: 36px;
  background: var(--bg-subtle);
  border-radius: var(--radius-full);
  margin-bottom: var(--space-6);
}

.skeleton-header-text {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.skeleton-label {
  width: 60px;
  height: 14px;
  background: var(--bg-subtle);
  border-radius: var(--radius-sm);
}

.skeleton-title {
  width: 200px;
  height: 36px;
  background: var(--bg-subtle);
  border-radius: var(--radius-md);
}

.skeleton-subtitle {
  width: 160px;
  height: 18px;
  background: var(--bg-subtle);
  border-radius: var(--radius-sm);
}

/* Search */
.skeleton-search {
  height: 56px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-6);
}

/* Stats Row */
.skeleton-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.skeleton-stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.skeleton-stat-icon {
  width: 48px;
  height: 48px;
  background: var(--bg-subtle);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.skeleton-stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skeleton-stat-value {
  width: 60px;
  height: 24px;
  background: var(--bg-subtle);
  border-radius: var(--radius-sm);
}

.skeleton-stat-label {
  width: 50px;
  height: 14px;
  background: var(--bg-subtle);
  border-radius: var(--radius-sm);
}

/* Card */
.skeleton-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  margin-bottom: var(--space-5);
}

.skeleton-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-5);
}

.skeleton-card-title {
  width: 100px;
  height: 22px;
  background: var(--bg-subtle);
  border-radius: var(--radius-sm);
}

.skeleton-card-badge {
  width: 60px;
  height: 24px;
  background: var(--bg-subtle);
  border-radius: var(--radius-full);
}

/* Mood List */
.skeleton-mood-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.skeleton-mood-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-subtle);
  border-radius: var(--radius-xl);
}

.skeleton-mood-emoji {
  width: 48px;
  height: 48px;
  background: var(--bg-hover);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.skeleton-mood-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skeleton-mood-header {
  display: flex;
  justify-content: space-between;
}

.skeleton-mood-name {
  width: 50px;
  height: 16px;
  background: var(--bg-hover);
  border-radius: var(--radius-sm);
}

.skeleton-mood-count {
  width: 30px;
  height: 16px;
  background: var(--bg-hover);
  border-radius: var(--radius-sm);
}

.skeleton-mood-bar {
  height: 8px;
  background: var(--bg-hover);
  border-radius: var(--radius-full);
}

/* Diary List */
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
  border-radius: var(--radius-xl);
}

.skeleton-diary-emoji {
  width: 48px;
  height: 48px;
  background: var(--bg-hover);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.skeleton-diary-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skeleton-diary-date {
  width: 80px;
  height: 12px;
  background: var(--bg-hover);
  border-radius: var(--radius-sm);
}

.skeleton-diary-prompt {
  width: 160px;
  height: 16px;
  background: var(--bg-hover);
  border-radius: var(--radius-sm);
}

.skeleton-diary-btn {
  width: 36px;
  height: 36px;
  background: var(--bg-hover);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

/* Shimmer Animation */
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

/* Responsive */
@media (max-width: 640px) {
  .skeleton-stats-row {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .skeleton-stat-card {
    padding: var(--space-4);
  }

  .skeleton-card {
    padding: var(--space-4);
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .animate-shimmer {
    animation: none;
  }
}
</style>
