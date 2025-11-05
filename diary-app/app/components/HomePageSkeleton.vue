<template>
  <div class="container">
    <div class="content">
      <!-- 헤더 스켈레톤 -->
      <header class="header">
        <SkeletonLoader type="title" width="200px" />
        <SkeletonLoader type="text" width="150px" />
      </header>

      <!-- 통계 카드 스켈레톤 -->
      <div class="stats-grid">
        <div v-for="i in 3" :key="i" class="stat-card-skeleton">
          <SkeletonLoader type="circle" width="48px" height="48px" />
          <SkeletonLoader type="text" width="80px" height="14px" />
          <SkeletonLoader type="text" width="60px" height="28px" />
        </div>
      </div>

      <!-- 최근 일기 스켈레톤 -->
      <div class="recent-section">
        <div class="section-header">
          <SkeletonLoader type="text" width="100px" height="20px" />
          <SkeletonLoader type="text" width="80px" height="16px" />
        </div>
        <div class="recent-list">
          <div v-for="i in 3" :key="i" class="recent-item-skeleton">
            <SkeletonLoader type="circle" width="48px" height="48px" />
            <div class="recent-info-skeleton">
              <SkeletonLoader type="text" width="100px" height="14px" />
              <SkeletonLoader type="text" width="200px" height="16px" />
            </div>
          </div>
        </div>
      </div>

      <!-- 액션 버튼 스켈레톤 -->
      <div class="action-section">
        <SkeletonLoader type="button" width="400px" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}

.content {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header {
  text-align: center;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card-skeleton {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px var(--shadow);
}

.recent-section {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px var(--shadow);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-item-skeleton {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 8px;
  background: var(--bg-hover);
}

.recent-info-skeleton {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-section {
  display: flex;
  justify-content: center;
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .action-section {
    width: 100%;
  }
}
</style>
