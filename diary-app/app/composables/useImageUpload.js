/**
 * 이미지 업로드 및 압축 관리
 * 사용자가 선택한 이미지를 압축하고 저장합니다.
 */

import imageCompression from 'browser-image-compression'

/**
 * 이미지 업로드 Composable
 */
export const useImageUpload = () => {
  const { saveImage, getImage, deleteImage, blobToDataURL } = useImageDB()

  // 업로드 상태
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const uploadError = ref(null)

  /**
   * 파일 유효성 검사
   * @param {File} file - 검사할 파일
   * @returns {Object} { valid: boolean, error: string }
   */
  const validateFile = (file) => {
    // 파일 타입 검사 (이미지만 허용)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: '지원하지 않는 파일 형식입니다. (JPG, PNG, WEBP만 가능)'
      }
    }

    // 파일 크기 검사 (10MB 이하)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: '파일 크기가 너무 큽니다. (최대 10MB)'
      }
    }

    return { valid: true, error: null }
  }

  /**
   * 이미지 압축
   * @param {File} file - 원본 파일
   * @param {Object} options - 압축 옵션
   * @returns {Promise<Blob>} 압축된 이미지 Blob
   */
  const compressImage = async (file, options) => {
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: options.maxSizeMB || 1,
        maxWidthOrHeight: options.maxWidthOrHeight || 1920,
        useWebWorker: true, // 백그라운드에서 처리 (UI 멈춤 방지)
        fileType: 'image/jpeg', // JPEG로 변환 (용량 효율적)
        initialQuality: options.quality || 0.8
      })
      return compressed
    } catch (error) {
      console.error('이미지 압축 실패:', error)
      throw new Error('이미지 압축 중 오류가 발생했습니다.')
    }
  }

  /**
   * 이미지를 3가지 크기로 생성
   * @param {File} file - 원본 파일
   * @returns {Promise<Object>} { thumbnail, preview, fullSize }
   */
  const createImageSizes = async (file) => {
    uploadProgress.value = 10

    // 1. 썸네일 생성 (작은 크기, 목록용)
    const thumbnail = await compressImage(file, {
      maxSizeMB: 0.05, // 50KB
      maxWidthOrHeight: 200,
      quality: 0.7
    })
    uploadProgress.value = 40

    // 2. 미리보기 생성 (중간 크기, 일기 보기용)
    const preview = await compressImage(file, {
      maxSizeMB: 0.3, // 300KB
      maxWidthOrHeight: 800,
      quality: 0.8
    })
    uploadProgress.value = 70

    // 3. 원본 크기 (확대 보기용, 적당히 압축)
    const fullSize = await compressImage(file, {
      maxSizeMB: 1.5, // 1.5MB
      maxWidthOrHeight: 1920,
      quality: 0.85
    })
    uploadProgress.value = 90

    return { thumbnail, preview, fullSize }
  }

  /**
   * 이미지 업로드 및 저장
   * @param {File} file - 업로드할 파일
   * @returns {Promise<Object>} 저장된 이미지 정보
   */
  const uploadImage = async (file) => {
    // 초기화
    isUploading.value = true
    uploadProgress.value = 0
    uploadError.value = null

    try {
      // 1. 파일 유효성 검사
      const validation = validateFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // 2. 고유 ID 생성
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // 3. 3가지 크기 생성
      const { thumbnail, preview, fullSize } = await createImageSizes(file)

      // 4. IndexedDB에 저장
      const imageData = {
        id: imageId,
        thumbnailBlob: thumbnail,
        previewBlob: preview,
        fullSizeBlob: fullSize,
        fileName: file.name,
        originalSize: file.size,
        compressedSize: fullSize.size,
        uploadedAt: Date.now()
      }

      await saveImage(imageData)

      uploadProgress.value = 100

      // 5. 썸네일 Data URL 생성 (화면 표시용)
      const thumbnailURL = await blobToDataURL(thumbnail)

      return {
        id: imageId,
        thumbnailURL,
        fileName: file.name,
        size: fullSize.size,
        uploadedAt: imageData.uploadedAt
      }
    } catch (error) {
      uploadError.value = error.message
      throw error
    } finally {
      isUploading.value = false
    }
  }

  /**
   * 여러 이미지 동시 업로드
   * @param {FileList|Array} files - 파일 목록
   * @returns {Promise<Array>} 업로드된 이미지 정보 배열
   */
  const uploadMultipleImages = async (files) => {
    const fileArray = Array.from(files)
    const results = []
    const errors = []

    for (let i = 0; i < fileArray.length; i++) {
      try {
        const result = await uploadImage(fileArray[i])
        results.push(result)
      } catch (error) {
        errors.push({
          fileName: fileArray[i].name,
          error: error.message
        })
      }
    }

    return { results, errors }
  }

  /**
   * 이미지 불러오기 (Data URL로 변환)
   * @param {string} imageId - 이미지 ID
   * @param {string} size - 'thumbnail' | 'preview' | 'fullSize'
   * @returns {Promise<string>} Data URL
   */
  const loadImage = async (imageId, size = 'preview') => {
    try {
      const imageData = await getImage(imageId)
      if (!imageData) {
        throw new Error('이미지를 찾을 수 없습니다.')
      }

      let blob
      if (size === 'thumbnail') {
        blob = imageData.thumbnailBlob
      } else if (size === 'preview') {
        blob = imageData.previewBlob
      } else {
        blob = imageData.fullSizeBlob
      }

      return await blobToDataURL(blob)
    } catch (error) {
      console.error('이미지 불러오기 실패:', error)
      return null
    }
  }

  /**
   * 여러 이미지 불러오기
   * @param {Array} imageIds - 이미지 ID 배열
   * @param {string} size - 크기
   * @returns {Promise<Array>} Data URL 배열
   */
  const loadMultipleImages = async (imageIds, size = 'thumbnail') => {
    const promises = imageIds.map(id => loadImage(id, size))
    return await Promise.all(promises)
  }

  /**
   * 드래그 앤 드롭 이벤트 핸들러
   */
  const isDragging = ref(false)

  const onDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    isDragging.value = true
  }

  const onDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    isDragging.value = false
  }

  const onDrop = async (e, callback) => {
    e.preventDefault()
    e.stopPropagation()
    isDragging.value = false

    const files = e.dataTransfer.files
    if (files.length > 0 && callback) {
      const { results, errors } = await uploadMultipleImages(files)
      callback({ results, errors })
    }
  }

  return {
    // 상태
    isUploading,
    uploadProgress,
    uploadError,
    isDragging,

    // 업로드 함수
    uploadImage,
    uploadMultipleImages,

    // 불러오기 함수
    loadImage,
    loadMultipleImages,

    // 드래그 앤 드롭
    onDragOver,
    onDragLeave,
    onDrop,

    // 이미지 삭제
    deleteImage
  }
}
