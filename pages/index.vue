<script setup lang="ts">
import { TRPCClientError } from '@trpc/client'
import { useMessage } from 'naive-ui'
import { useAccumulativeQuery } from '~/composables/useAccumulativeQuery'
import { formatDate } from '~/util/post'

definePageMeta({ middleware: 'auth' })

const cachedNumbers : Record<string, number> = {}
let fetchNewPostsInterval: number | NodeJS.Timer | undefined

const posting = ref(false)

const { $client } = useNuxtApp()
const message = useMessage()
const { data: posts, loadTail, loadHead, headCursor } = useAccumulativeQuery(
  async ({ cursor, direction, hasMore }) => {
    const res = await $client.getPosts.query({ cursor: cursor.value, limit: direction * 25 })

    // a bit hacky, but its fine :shrug:
    if (posts.value.length === 0 && res.data.length > 0) {
      headCursor.value = res.data[0].createdAt.toISOString()
    }

    if (res.cursor) {
      cursor.value = res.cursor
    } else {
      hasMore.value = false
    }
    return res.data
  }
)

const rotationNumbersByPostId = computed(() => {
  return posts.value.reduce((acc: Record<string, number>, post) => {
    if (cachedNumbers[post.id]) {
      acc[post.id] = cachedNumbers[post.id]
    } else {
      acc[post.id] = Math.floor(Math.random() * 4) + 1
      cachedNumbers[post.id] = acc[post.id]
    }
    return acc
  }, {})
})

const submitPost = async (content: string) => {
  if (!content) { return }
  try {
    posting.value = true
    await $client.createPost.mutate({ content })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)

    if (e instanceof TRPCClientError) {
      const errorMessage = JSON.parse(e.message)[0]

      switch (e.data.code) {
        case 'BAD_REQUEST':
          message.error(errorMessage.message.replace(errorMessage.type.charAt(0).toUpperCase() + errorMessage.type.substring(1), errorMessage.path.join('.')))
          break
        default:
          message.error('An unknown error occurred')
          break
      }
    }
  } finally {
    await loadHead()
    posting.value = false
  }
}

function handleScrollStateChange (state: string) {
  if (fetchNewPostsInterval) {
    clearInterval(fetchNewPostsInterval)
    fetchNewPostsInterval = undefined
  }

  switch (state) {
    case 'bottom':
      loadTail()
      break
    case 'top':
      fetchNewPostsInterval = setInterval(loadHead, 5000)
      loadHead()
      break
  }
}

onMounted(() => {
  fetchNewPostsInterval = setInterval(loadHead, 5000)
})
</script>

<template>
  <ScrollObserver class="max-h-full px-8 py-4" @change="handleScrollStateChange">
    <NewPostForm :loading="posting" @submit="submitPost" />
    <div
      v-for="(post, index) in posts"
      :id="`post-${index}`"
      :key="post.id"
      class="h-80 w-80 m-auto border border-gray-200 p-2 flex gap-2 break-all"
      :class="'rotate-' + rotationNumbersByPostId[post.id]"
    >
      <NAvatar class="flex-grow-0 flex-shrink-0" :src="post.author.image ?? ''" round />
      <div class="flex-grow-1">
        <span class="text-lg mb-1">
          <span class="mr-2">{{ post.author.name }}</span>
          <span class="text-gray-400 text-xs">
            {{ formatDate(post.createdAt) }}
          </span><br>
        </span>
        <p>
          {{ post.content }}
        </p>
      </div>
    </div>
  </ScrollObserver>
</template>

<style>
@keyframes rotate-1 {
  0% {
    -webkit-transform: rotate3d(0, 1, 1, 0deg);
    transform: rotate3d(0, 1, 1, 0deg);
  }
  25% {
    -webkit-transform: rotate3d(0, 1, 1, 90deg);
    transform: rotate3d(0, 1, 1, 90deg);
  }
  50% {
    -webkit-transform: rotate3d(0, 1, 1, 180deg);
    transform: rotate3d(0, 1, 1, 180deg);
  }
  75% {
    -webkit-transform: rotate3d(0, 1, 1, 270deg);
    transform: rotate3d(0, 1, 1, 270deg);
  }
  100% {
    -webkit-transform: rotate3d(0, 1, 1, 360deg);
    transform: rotate3d(0, 1, 1, 360deg);
  }
}

@keyframes rotate-2 {
  0% {
    -webkit-transform: rotate3d(0, 1, 1, 90deg);
    transform: rotate3d(0, 1, 1, 90deg);
  }

  25% {
    -webkit-transform: rotate3d(0, 1, 1, 180deg);
    transform: rotate3d(0, 1, 1, 180deg);
  }

  50% {
    -webkit-transform: rotate3d(0, 1, 1, 270deg);
    transform: rotate3d(0, 1, 1, 270deg);
  }

  75% {
    -webkit-transform: rotate3d(0, 1, 1, 360deg);
    transform: rotate3d(0, 1, 1, 360deg);
  }

  100% {
    -webkit-transform: rotate3d(0, 1, 1, 450deg);
    transform: rotate3d(0, 1, 1, 450deg);
  }
}

@keyframes rotate-3 {
  0% {
    -webkit-transform: rotate3d(0, 1, 1, 180deg);
    transform: rotate3d(0, 1, 1, 180deg);
  }

  25% {
    -webkit-transform: rotate3d(0, 1, 1, 270deg);
    transform: rotate3d(0, 1, 1, 270deg);
  }

  50% {
    -webkit-transform: rotate3d(0, 1, 1, 360deg);
    transform: rotate3d(0, 1, 1, 360deg);
  }

  75% {
    -webkit-transform: rotate3d(0, 1, 1, 450deg);
    transform: rotate3d(0, 1, 1, 450deg);
  }

  100% {
    -webkit-transform: rotate3d(0, 1, 1, 540deg);
    transform: rotate3d(0, 1, 1, 540deg);
  }
}

@keyframes rotate-4 {
  0% {
    -webkit-transform: rotate3d(0, 1, 1, 270deg);
    transform: rotate3d(0, 1, 1, 270deg);
  }

  25% {
    -webkit-transform: rotate3d(0, 1, 1, 360deg);
    transform: rotate3d(0, 1, 1, 360deg);
  }

  50% {
    -webkit-transform: rotate3d(0, 1, 1, 450deg);
    transform: rotate3d(0, 1, 1, 450deg);
  }

  75% {
    -webkit-transform: rotate3d(0, 1, 1, 540deg);
    transform: rotate3d(0, 1, 1, 540deg);
  }

  100% {
    -webkit-transform: rotate3d(0, 1, 1, 630deg);
    transform: rotate3d(0, 1, 1, 630deg);
  }
}

:root {
  --rotate-duration-1: 5s;
  --rotate-duration-2: 5s;
  --rotate-duration-3: 5s;
  --rotate-duration-4: 5s;
}

.rotate-1 {
  animation: rotate-1 var(--rotate-duration-1) normal linear infinite;
}

.rotate-2 {
  animation: rotate-2 var(--rotate-duration-2) normal linear infinite;
}

.rotate-3 {
  animation: rotate-3 var(--rotate-duration-3) normal linear infinite;
}

.rotate-4 {
  animation: rotate-4 var(--rotate-duration-4) normal linear infinite;
}
</style>
