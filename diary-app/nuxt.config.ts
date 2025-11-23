// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // 런타임 설정: 환경 변수를 앱에서 사용할 수 있게 합니다
  runtimeConfig: {
    public: {
      // NUXT_PUBLIC_으로 시작하는 환경 변수는 자동으로 연결됩니다
      hfToken: process.env.NUXT_PUBLIC_HF_TOKEN || ''
    }
  }
})
