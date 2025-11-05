<template>
  <div class="container">
    <div class="content">
      <!-- 헤더 -->
      <header class="header">
        <SkeletonLoader type="title" width="200px" />
        <SkeletonLoader type="text" width="180px" />
      </header>

      <!-- 통계 그리드 -->
      <div class="stats-grid">
        <div v-for="i in 3" :key="i" class="stat-card-skeleton">
          <SkeletonLoader type="circle" width="48px" height="48px" />
          <SkeletonLoader type="text" width="80px" height="14px" />
          <SkeletonLoader type="text" width="60px" height="28px" />
        </div>
      </div>

      <!-- 감정 분석 -->
      <div class="mood-section">
        <SkeletonLoader type="text" width="120px" height="20px" />
        <div class="mood-bars">
          <div v-for="i in 5" :key="i" class="mood-bar-skeleton">
            <SkeletonLoader type="custom" width="40px" height="40px" />
            <div class="bar-info">
              <SkeletonLoader type="text" width="60px" height="16px" />
              <SkeletonLoader type="custom" width="100%" height="24px" />
            </div>
          </div>
        </div>
      </div>

      <!-- 일기 리스트 -->
      <div class="diaries-section">
        <SkeletonLoader type="text" width="100px" height="20px" />
        <div class="diary-list">
          <div v-for="i in 3" :key="i" class="diary-card-skeleton">
            <div class="diary-header-skeleton">
              <SkeletonLoader type="circle" width="36px" height="36px" />
              <SkeletonLoader type="text" width="100px" height="16px" />
            </div>
            <SkeletonLoader type="text" width="100%" height="16px" />
            <SkeletonLoader type="text" width="80%" height="16px" />
          </div>
        </div>
      </div>

      <!-- 뒤로가기 버튼 -->
      <div class="action-section">
        <SkeletonLoader type="button" width="200px" />
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

.mood-section {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px var(--shadow);
}

.mood-bars {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mood-bar-skeleton {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.diaries-section {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px var(--shadow);
}

.diary-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.diary-card-skeleton {
  padding: 16px;
  border-radius: 12px;
  background: var(--bg-hover);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.diary-header-skeleton {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.action-section {
  display: flex;
  justify-content: center;
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
