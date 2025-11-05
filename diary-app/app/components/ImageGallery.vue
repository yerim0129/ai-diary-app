<template>
  <div v-if="imageIds && imageIds.length > 0" class="image-gallery">
    <h3 class="gallery-title">📷 첨부된 사진 ({{ imageIds.length }}장)</h3>

    <!-- 이미지 그리드 -->
    <div class="gallery-grid">
      <div
        v-for="(url, index) in imageUrls"
        :key="index"
        class="gallery-item"
        @click="openLightbox(index)"
      >
        <img
          v-if="url"
          :src="url"
          :alt="`사진 ${index + 1}`"
          class="gallery-image"
        />
        <div v-else class="gallery-loading">
          <span>⏳</span>
        </div>
      </div>
    </div>

    <!-- 라이트박스 (이미지 확대 보기) -->
    <VueEasyLightbox
      :visible="lightboxVisible"
      :imgs="lightboxImages"
      :index="lightboxIndex"
      @hide="closeLightbox"
    />
  </div>
</template>

<script setup>
import VueEasyLightbox from 'vue-easy-lightbox'

const props = defineProps({
  imageIds: {
    type: Array,
    default: () => []
  }
})

const { loadImage } = useImageUpload()

const imageUrls = ref([])
const lightboxImages = ref([])
const lightboxVisible = ref(false)
const lightboxIndex = ref(0)

/**
 * 이미지 로드
 */
const loadImages = async () => {
  if (!props.imageIds || props.imageIds.length === 0) {
    imageUrls.value = []
    lightboxImages.value = []
    return
  }

  // 썸네일 로드 (그리드 표시용)
  const thumbnailPromises = props.imageIds.map(id => loadImage(id, 'thumbnail'))
  imageUrls.value = await Promise.all(thumbnailPromises)

  // 미리보기 이미지 로드 (라이트박스용)
  const previewPromises = props.imageIds.map(id => loadImage(id, 'preview'))
  lightboxImages.value = await Promise.all(previewPromises)
}

/**
 * 라이트박스 열기
 */
const openLightbox = (index) => {
  lightboxIndex.value = index
  lightboxVisible.value = true
}

/**
 * 라이트박스 닫기
 */
const closeLightbox = () => {
  lightboxVisible.value = false
}

// 컴포넌트 마운트 시 이미지 로드
onMounted(() => {
  loadImages()
})

// imageIds 변경 감지
watch(() => props.imageIds, () => {
  loadImages()
}, { deep: true })
</script>

<style scoped>
.image-gallery {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.gallery-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.gallery-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: var(--bg-hover);
  transition: all 0.2s;
}

.gallery-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px var(--shadow-hover);
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.gallery-item:hover .gallery-image {
  transform: scale(1.1);
}

.gallery-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

@media (max-width: 640px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }
}
</style>
