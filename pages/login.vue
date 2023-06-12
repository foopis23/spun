<script setup lang="ts">
import Github from '@vicons/fa/Github'
import Discord from '@vicons/fa/Discord'
import Twitter from '@vicons/fa/Twitter'

useHead({
  title: 'Spun - Login'
})

definePageMeta({
  middleware: ['auth'],
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/'
  },
  layout: false
})

const { signIn, getProviders, data: session } = useAuth()
const { data: providers } = useAsyncData(() => getProviders())

function getProviderIcon (key: string) {
  switch (key) {
    case 'github':
      return Github
    case 'discord':
      return Discord
    case 'twitter':
      return Twitter
    default:
      return 'div'
  }
}
</script>

<template>
  <div class="flex flex-col justify-center min-h-screen">
    {{ session?.user }}
    <NCard class="max-w-screen-md m-auto flex flex-col items-center text-center p-6">
      <h1 class="text-2xl font-bold mb-4">
        Login into Spun
      </h1>
      <p class="mb-2">
        Sign-In Options:
      </p>
      <div class="flex flex-col gap-3 pt-4">
        <NButton v-for="(provider, key) of providers" :key="key" size="large" icon @click="signIn(key)">
          <template #icon>
            <component :is="getProviderIcon(key)" />
          </template>
          {{ provider?.name }}
        </NButton>
      </div>
    </NCard>
  </div>
</template>
