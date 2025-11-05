/**
 * IndexedDB를 사용한 이미지 저장소 관리
 * 브라우저 내장 데이터베이스로 대용량 이미지를 저장합니다.
 */

import { openDB } from 'idb'

// 데이터베이스 이름과 버전
const DB_NAME = 'aiDiary'
const DB_VERSION = 1
const STORE_NAME = 'images'

/**
 * IndexedDB 초기화 및 연결
 * 앱이 처음 실행될 때 데이터베이스를 생성합니다.
 */
const getDB = async () => {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 'images' 저장소가 없으면 생성
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

/**
 * 이미지 저장소 관리 Composable
 */
export const useImageDB = () => {
  /**
   * 이미지 저장
   * @param {Object} imageData - 저장할 이미지 데이터
   * @param {string} imageData.id - 고유 ID
   * @param {Blob} imageData.blob - 이미지 파일 (Blob 형식)
   * @param {string} imageData.fileName - 파일 이름
   * @param {number} imageData.size - 파일 크기 (bytes)
   * @param {number} imageData.uploadedAt - 업로드 시간 (timestamp)
   * @returns {Promise<string>} 저장된 이미지 ID
   */
  const saveImage = async (imageData) => {
    try {
      const db = await getDB()
      await db.put(STORE_NAME, imageData)
      return imageData.id
    } catch (error) {
      console.error('이미지 저장 실패:', error)
      throw new Error('이미지를 저장하는 중 오류가 발생했습니다.')
    }
  }

  /**
   * 이미지 가져오기
   * @param {string} id - 이미지 ID
   * @returns {Promise<Object|undefined>} 이미지 데이터 또는 undefined
   */
  const getImage = async (id) => {
    try {
      const db = await getDB()
      return await db.get(STORE_NAME, id)
    } catch (error) {
      console.error('이미지 가져오기 실패:', error)
      return undefined
    }
  }

  /**
   * 이미지 삭제
   * @param {string} id - 이미지 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  const deleteImage = async (id) => {
    try {
      const db = await getDB()
      await db.delete(STORE_NAME, id)
      return true
    } catch (error) {
      console.error('이미지 삭제 실패:', error)
      return false
    }
  }

  /**
   * 여러 이미지 삭제
   * @param {string[]} ids - 이미지 ID 배열
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  const deleteImages = async (ids) => {
    try {
      const db = await getDB()
      const tx = db.transaction(STORE_NAME, 'readwrite')

      // 모든 이미지 삭제
      await Promise.all(ids.map(id => tx.store.delete(id)))
      await tx.done

      return true
    } catch (error) {
      console.error('이미지 일괄 삭제 실패:', error)
      return false
    }
  }

  /**
   * 모든 이미지 목록 가져오기
   * @returns {Promise<Array>} 이미지 목록
   */
  const getAllImages = async () => {
    try {
      const db = await getDB()
      return await db.getAll(STORE_NAME)
    } catch (error) {
      console.error('이미지 목록 가져오기 실패:', error)
      return []
    }
  }

  /**
   * 이미지 개수 가져오기
   * @returns {Promise<number>} 저장된 이미지 개수
   */
  const getImageCount = async () => {
    try {
      const db = await getDB()
      return await db.count(STORE_NAME)
    } catch (error) {
      console.error('이미지 개수 가져오기 실패:', error)
      return 0
    }
  }

  /**
   * Blob을 Data URL로 변환
   * 이미지를 화면에 표시할 때 사용합니다.
   * @param {Blob} blob - 변환할 Blob 객체
   * @returns {Promise<string>} Data URL (base64)
   */
  const blobToDataURL = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  return {
    saveImage,
    getImage,
    deleteImage,
    deleteImages,
    getAllImages,
    getImageCount,
    blobToDataURL
  }
}
