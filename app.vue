<script setup lang="ts">
import { darkTheme } from 'naive-ui'
</script>

<template>
  <NConfigProvider :theme="darkTheme">
    <NMessageProvider>
      <NLoadingBarProvider>
        <div class="min-h-screen bg-[#101014] text-grey-200">
          <NuxtLayout>
            <NuxtPage />
          </NuxtLayout>
        </div>
      </NLoadingBarProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<style>
:root, html, body {
 background-color: #101014;
}

html {
  @apply text-gray-200
}

[v-cloak] {display: none}
</style>
