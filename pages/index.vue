<script setup lang="ts">
import { useAccumulativeQuery } from '~/composables/useAccumulativeQuery'

definePageMeta({ middleware: 'auth' })

let fetchNewPostsInterval: number | NodeJS.Timer | undefined
const { $client } = useNuxtApp()
const userReactions = reactive<Record<string, 'LIKE' | 'DISLIKE'>>({})

async function loadUserReactionsFor (postIds: string[]) {
  const reactions = await $client.getUserReactions.query({ postIds })
  for (const [postId, reaction] of Object.entries(reactions)) {
    userReactions[postId] = reaction
  }
}

async function refreshOne (postId: string) {
  await Promise.all([
    loadUserReactionsFor([postId]),
    $client.getPost.query({ id: postId }).then((post) => {
      const index = posts.value.findIndex(p => p.id === postId)
      if (index === -1) {
        posts.value.unshift(post)
      } else {
        posts.value[index] = post
      }
    })
  ])
}

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

    loadUserReactionsFor(res.data.map(post => post.id))

    return res.data
  }
)

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
    <NewPostForm @submit="loadHead()" />
    <PostCard
      v-for="(post, index) in posts"
      :id="`post-${index}`"
      :key="post.id"
      :post="post"
      :user-reaction="userReactions[post.id]"
      @reaction-change="refreshOne(post.id)"
    />
  </ScrollObserver>
</template>
