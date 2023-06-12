<script setup lang="ts">
useHead({
  title: 'Spun - Home',
  meta: [
    {
      hid: 'description',
      name: 'description',
      content: 'Spun revolutionizes social media with mesmerizing 3D rotation. Engage, explore, and experience posts in a visually captivating new dimension.'
    }
  ]
})
</script>

<template>
  <PostList :allow-new-posts="true" :refresh-interval="10000" />
</template>
