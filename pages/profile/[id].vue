<script setup lang="ts">
import ChevronLeft from '@vicons/fa/ArrowLeft'

const { $client } = useNuxtApp()
const { params } = useRoute()

const { data: user } = $client.user.getUser.useQuery({
  id: (typeof params.id === 'string') ? params.id : params.id[0]
})

const title = computed(() => {
  if (!user.value) {
    return 'Profile'
  }

  return `Spun - ${user.value.name}'s Profile`
})

const description = computed(() => {
  if (!user.value) {
    return ''
  }

  return `${user.value.bio}`
})

useHead({
  title,
  meta: [
    {
      hid: 'description',
      name: 'description',
      content: description
    }
  ]
})
definePageMeta({ layout: false })
</script>

<template>
  <NuxtLayout name="default">
    <template #preTitle>
      <NuxtLink to="/" class="leading-[0]">
        <NIcon to="/" :size="24" class="mr-4">
          <ChevronLeft />
        </NIcon>
      </NuxtLink>
    </template>
    <template #title>
      {{ user?.name }}
    </template>
    <div class="p-6 border-b border-gray-500 flex items-start gap-4 flex-grow-0">
      <NAvatar class="profile-avatar flex-grow-0 flex-shrink-0 block" :src="user?.image ?? ''" round />
      <div>
        <span class="text-2xl font-bold">{{ user?.name }}</span>
        <p>{{ user?.bio }}</p>
      </div>
    </div>
    <PostList v-if="typeof params?.id === 'string'" :author-id="params?.id" />
  </NuxtLayout>
</template>

<style scoped>
.profile-avatar {
  width: 84px;
  height: 84px;
}
</style>
