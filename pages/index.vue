<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>

<template>
  <PostList :allow-new-posts="true" :refresh-interval="10000" />
</template>
