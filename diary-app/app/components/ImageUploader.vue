<template>
  <div class="image-uploader">
    <!-- 업로드 영역 (드래그 앤 드롭) -->
    <div
      class="upload-zone"
      :class="{
        'dragging': isDragging,
        'has-images': images.length > 0
      }"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="handleDrop"
      @click="triggerFileInput"
    >
      <div v-if="!isUploading" class="upload-content">
        <div class="upload-icon">📷</div>
        <p class="upload-title">사진 추가하기</p>
        <p class="upload-subtitle">
          여기에 이미지를 드래그하거나 클릭하세요
        </p>
        <p class="upload-limit">최대 {{ maxImages }}장까지 첨부 가능 (현재 {{ images.length }}장)</p>
      </div>

      <!-- 업로드 중 -->
      <div v-else class="upload-progress">
        <div class="progress-icon">⏳</div>
        <p class="progress-text">업로드 중... {{ uploadProgress }}%</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
      </div>

      <!-- 숨겨진 파일 input -->
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        @change="handleFileSelect"
        style="display: none"
      />
    </div>

    <!-- 에러 메시지 -->
    <div v-if="uploadError" class="error-message">
      ⚠️ {{ uploadError }}
    </div>

    <!-- 업로드된 이미지 목록 -->
    <div v-if="images.length > 0" class="image-grid">
      <div
        v-for="(image, index) in images"
        :key="image.id"
        class="image-item"
      >
        <img :src="image.thumbnailURL" :alt="image.fileName" />
        <button
          @click.stop="removeImage(index)"
          class="remove-btn"
          :title="`${image.fileName} 삭제`"
        >
          ✕
        </button>
        <div class="image-info">
          <span class="image-size">{{ formatFileSize(image.size) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxImages: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['update:modelValue'])

const {
  isUploading,
  uploadProgress,
  uploadError,
  isDragging,
  uploadMultipleImages,
  onDragOver,
  onDragLeave,
  onDrop,
  deleteImage
} = useImageUpload()

const fileInput = ref(null)
const images = ref([...props.modelValue])

// 파일 input 트리거
const triggerFileInput = () => {
  if (images.value.length >= props.maxImages) {
    alert(`최대 ${props.maxImages}장까지만 첨부할 수 있습니다.`)
    return
  }
  fileInput.value?.click()
}

// 파일 선택 처리
const handleFileSelect = async (e) => {
  const files = e.target.files
  if (!files || files.length === 0) return

  await processFiles(files)

  // input 초기화 (같은 파일 다시 선택 가능하게)
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 드롭 처리
const handleDrop = async (e) => {
  onDrop(e, async ({ results, errors }) => {
    if (results.length > 0) {
      addImages(results)
    }
    if (errors.length > 0) {
      console.error('업로드 실패:', errors)
    }
  })
}

// 파일 처리
const processFiles = async (files) => {
  // 남은 슬롯 계산
  const remainingSlots = props.maxImages - images.value.length
  if (remainingSlots <= 0) {
    alert(`최대 ${props.maxImages}장까지만 첨부할 수 있습니다.`)
    return
  }

  // 제한된 개수만 처리
  const filesToProcess = Array.from(files).slice(0, remainingSlots)

  const { results, errors } = await uploadMultipleImages(filesToProcess)

  if (results.length > 0) {
    addImages(results)
  }

  if (errors.length > 0) {
    console.error('업로드 실패:', errors)
    alert(`${errors.length}개 파일 업로드 실패: ${errors[0].error}`)
  }
}

// 이미지 추가
const addImages = (newImages) => {
  images.value.push(...newImages)
  emit('update:modelValue', images.value)
}

// 이미지 제거
const removeImage = async (index) => {
  if (!confirm('이 이미지를 삭제하시겠습니까?')) return

  const image = images.value[index]

  // IndexedDB에서 삭제
  await deleteImage(image.id)

  // 배열에서 제거
  images.value.splice(index, 1)
  emit('update:modelValue', images.value)
}

// 파일 크기 포맷팅
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// props 변경 감지
watch(() => props.modelValue, (newVal) => {
  images.value = [...newVal]
})
</script>

<style scoped>
.image-uploader {
  margin: 20px 0;
}

.upload-zone {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-hover);
}

.upload-zone:hover {
  border-color: var(--accent-primary);
  background: var(--bg-card);
}

.upload-zone.dragging {
  border-color: var(--accent-primary);
  background: var(--bg-card);
  transform: scale(1.02);
}

.upload-zone.has-images {
  padding: 20px;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 8px;
}

.upload-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.upload-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.upload-limit {
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-top: 8px;
}

/* 업로드 진행 */
.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.progress-icon {
  font-size: 2.5rem;
}

.progress-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.progress-bar {
  width: 100%;
  max-width: 300px;
  height: 8px;
  background: var(--bg-hover-deep);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  transition: width 0.3s ease;
}

/* 에러 메시지 */
.error-message {
  margin-top: 12px;
  padding: 12px 16px;
  background: var(--delete-bg);
  color: var(--delete-text);
  border-radius: 8px;
  font-size: 0.9rem;
}

/* 이미지 그리드 */
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-hover-deep);
  transition: all 0.2s;
}

.image-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-hover);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
}

.image-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: var(--delete-text);
  transform: scale(1.1);
}

.image-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.image-size {
  font-size: 0.7rem;
  color: white;
}

@media (max-width: 640px) {
  .upload-zone {
    padding: 30px 16px;
  }

  .upload-icon {
    font-size: 2.5rem;
  }

  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }
}
</style>
