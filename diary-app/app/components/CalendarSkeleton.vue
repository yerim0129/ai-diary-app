<template>
  <div class="container">
    <div class="content">
      <!-- 헤더 -->
      <header class="header">
        <SkeletonLoader type="title" width="180px" />
        <SkeletonLoader type="text" width="120px" />
      </header>

      <!-- 캘린더 카드 -->
      <div class="calendar-card">
        <!-- 월 선택기 -->
        <div class="month-selector">
          <SkeletonLoader type="custom" width="40px" height="40px" />
          <SkeletonLoader type="text" width="100px" height="24px" />
          <SkeletonLoader type="custom" width="40px" height="40px" />
        </div>

        <!-- 요일 헤더 -->
        <div class="weekdays">
          <SkeletonLoader v-for="i in 7" :key="i" type="text" width="30px" height="16px" />
        </div>

        <!-- 날짜 그리드 -->
        <div class="calendar-grid">
          <div v-for="i in 35" :key="i" class="calendar-day-skeleton">
            <SkeletonLoader type="custom" width="32px" height="32px" />
          </div>
        </div>

        <!-- 통계 -->
        <div class="month-stats">
          <SkeletonLoader type="text" width="150px" height="20px" />
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
  max-width: 800px;
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

.calendar-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px var(--shadow);
  margin-bottom: 24px;
}

.month-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 12px;
  text-align: center;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}

.calendar-day-skeleton {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.month-stats {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: center;
}

.action-section {
  display: flex;
  justify-content: center;
}
</style>
