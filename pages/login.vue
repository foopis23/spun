<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/'
  },
  layout: false
})

const { signIn, getProviders, data: session } = useAuth()
const { data: providers } = useAsyncData(() => getProviders())
</script>

<template>
  <div class="flex flex-col justify-center min-h-screen">
    {{ session?.user }}
    <NCard class="max-w-screen-md m-auto flex flex-col items-center text-center">
      <h1 class="text-2xl font-bold mb-4">
        Login into Spun
      </h1>
      <p class="mb-2">
        Sign-In Options:
      </p>
      <NButton v-for="(provider, key) of providers" :key="key" size="large" icon @click="signIn(key)">
        {{ provider?.name }}
      </NButton>
    </NCard>
  </div>
</template>
