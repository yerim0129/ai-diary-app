<template>
  <div class="mood-chart-container">
    <h3 class="chart-title">📊 기분 통계</h3>

    <!-- 차트가 렌더링될 캔버스 -->
    <div class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <!-- 범례 (커스텀) -->
    <div class="chart-legend">
      <div
        v-for="(item, index) in legendItems"
        :key="index"
        class="legend-item"
      >
        <span class="legend-color" :style="{ background: item.color }"></span>
        <span class="legend-emoji">{{ item.emoji }}</span>
        <span class="legend-label">{{ item.label }}</span>
        <span class="legend-count">{{ item.count }}회</span>
        <span class="legend-percent">({{ item.percent }}%)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'

// Chart.js 컴포넌트 등록
Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

// Props 정의
const props = defineProps({
  moodStats: {
    type: Object,
    required: true,
    default: () => ({
      happy: 0,
      calm: 0,
      sad: 0,
      angry: 0,
      tired: 0
    })
  }
})

// 기분별 설정
const moodConfig = {
  happy: { emoji: '😊', label: '행복', color: '#fbbf24' },
  calm: { emoji: '😌', label: '평온', color: '#60a5fa' },
  sad: { emoji: '😔', label: '우울', color: '#a78bfa' },
  angry: { emoji: '😤', label: '화남', color: '#f87171' },
  tired: { emoji: '😴', label: '피곤', color: '#9ca3af' }
}

// Refs
const chartCanvas = ref(null)
let chartInstance = null

// 범례 아이템 계산
const legendItems = ref([])

const updateLegendItems = () => {
  const total = Object.values(props.moodStats).reduce((sum, val) => sum + val, 0)

  legendItems.value = Object.entries(moodConfig).map(([mood, config]) => {
    const count = props.moodStats[mood] || 0
    const percent = total > 0 ? Math.round((count / total) * 100) : 0

    return {
      mood,
      emoji: config.emoji,
      label: config.label,
      color: config.color,
      count,
      percent
    }
  }).filter(item => item.count > 0)  // 0인 항목은 숨김

  // 데이터가 없으면 전체 표시
  if (legendItems.value.length === 0) {
    legendItems.value = Object.entries(moodConfig).map(([mood, config]) => ({
      mood,
      emoji: config.emoji,
      label: config.label,
      color: config.color,
      count: 0,
      percent: 0
    }))
  }
}

// 차트 생성/업데이트
const createChart = () => {
  if (!chartCanvas.value) return

  // 기존 차트 제거
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const total = Object.values(props.moodStats).reduce((sum, val) => sum + val, 0)

  // 데이터가 없으면 빈 차트 표시
  if (total === 0) {
    chartInstance = new Chart(chartCanvas.value, {
      type: 'doughnut',
      data: {
        labels: ['아직 일기가 없어요'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e5e7eb'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        cutout: '60%'
      }
    })
    return
  }

  // 데이터 준비 (0인 항목 제외)
  const labels = []
  const data = []
  const colors = []

  Object.entries(moodConfig).forEach(([mood, config]) => {
    const count = props.moodStats[mood] || 0
    if (count > 0) {
      labels.push(`${config.emoji} ${config.label}`)
      data.push(count)
      colors.push(config.color)
    }
  })

  // 차트 생성
  chartInstance = new Chart(chartCanvas.value, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverBorderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },  // 커스텀 범례 사용
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: { size: 14 },
          bodyFont: { size: 13 },
          callbacks: {
            label: (context) => {
              const value = context.raw
              const percent = Math.round((value / total) * 100)
              return ` ${value}회 (${percent}%)`
            }
          }
        }
      },
      cutout: '55%',
      animation: {
        animateRotate: true,
        animateScale: true
      }
    }
  })
}

// 마운트 시 차트 생성
onMounted(() => {
  console.log('📊 [MoodChart] 컴포넌트 마운트')
  updateLegendItems()

  // 약간의 지연 후 차트 생성 (DOM 렌더링 대기)
  setTimeout(() => {
    createChart()
  }, 100)
})

// Props 변경 감지
watch(() => props.moodStats, () => {
  console.log('📊 [MoodChart] 데이터 변경 감지')
  updateLegendItems()
  createChart()
}, { deep: true })

// 컴포넌트 해제 시 차트 정리
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<style scoped>
.mood-chart-container {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px var(--shadow);
}

.chart-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
  text-align: center;
}

.chart-wrapper {
  max-width: 280px;
  margin: 0 auto 24px;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--bg-hover);
  border-radius: 10px;
  transition: background 0.2s;
}

.legend-item:hover {
  background: var(--bg-hover-deep);
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-emoji {
  font-size: 1.3rem;
}

.legend-label {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-body);
}

.legend-count {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.legend-percent {
  font-size: 0.85rem;
  color: var(--text-secondary);
  min-width: 45px;
  text-align: right;
}

@media (max-width: 640px) {
  .mood-chart-container {
    padding: 20px;
  }

  .chart-wrapper {
    max-width: 220px;
  }

  .legend-item {
    padding: 8px 12px;
  }
}
</style>
