import './env'
import { defineNuxtModule, addTemplate } from '@nuxt/kit'

// outputs tailwind.config.cjs so that tailwindcss intellisense works
const tailwindConfigModule = defineNuxtModule({
  setup (_, nuxt) {
    nuxt.hook('tailwindcss:resolvedConfig', (config) => {
      addTemplate({
        filename: 'tailwind.config.cjs', // gets prepended by .nuxt/
        getContents: () => `module.exports = ${JSON.stringify(config)}`,
        write: true
      })
    })
  }
})

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    tailwindConfigModule,
    '@sidebase/nuxt-auth',
    '@nuxtjs/tailwindcss',
    '@huntersofbook/naive-ui-nuxt',
    'nuxt-security'
  ],
  nitro: {
    preset: 'vercel'
  },
  build: {
    transpile: ['trpc-nuxt']
  },
  typescript: {
    shim: false
  },
  security: {
    basicAuth: false,
    csrf: false,
    hidePoweredBy: true,
    rateLimiter: {
      tokensPerInterval: 300,
      interval: 'minute'
    },
    headers: {
      contentSecurityPolicy: {
        'img-src': ['self', 'https:', 'data:']
      },
      crossOriginResourcePolicy: 'cross-origin',
      crossOriginEmbedderPolicy: 'unsafe-none'
    }
  },
  routeRules: {
    '/api/auth/signin': {
      security: {
        rateLimiter: {
          tokensPerInterval: 6,
          interval: 'minute'
        }
      }
    },
    '/api/auth/signup': {
      security: {
        rateLimiter: {
          tokensPerInterval: 6,
          interval: 'minute'
        }
      }
    },
    '/api/auth/signin/*': {
      security: {
        rateLimiter: {
          tokensPerInterval: 6,
          interval: 'minute'
        }
      }
    }
  }
})
