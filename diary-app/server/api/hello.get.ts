/**
 * 🚀 간단한 Hello API 엔드포인트
 * GET /api/hello
 *
 * 백엔드가 제대로 작동하는지 테스트하는 용도
 */

export default defineEventHandler((event) => {
  return {
    message: '안녕하세요! 백엔드에서 보낸 메시지입니다. 🎉',
    timestamp: new Date().toISOString(),
    status: 'success'
  }
})
