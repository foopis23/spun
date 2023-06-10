<script setup lang="ts">
import { useAccumulativeQuery } from '~/composables/useAccumulativeQuery'

const props = defineProps<{
  authorId?: string
  allowNewPosts?: boolean,
  refreshInterval?: number
}>()

let fetchNewPostsInterval: number | NodeJS.Timer | undefined
const { $client } = useNuxtApp()
const userReactions = reactive<Record<string, 'LIKE' | 'DISLIKE'>>({})

async function loadUserReactionsFor (postIds: string[]) {
  const reactions = await $client.my.getReactions.query({ postIds })
  for (const [postId, reaction] of Object.entries(reactions)) {
    userReactions[postId] = reaction
  }
}

async function refreshOne (postId: string) {
  await Promise.all([
    loadUserReactionsFor([postId]),
    $client.post.get.query({ id: postId }).then((post) => {
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
    const res = await $client.post.getAll.query({
      cursor: cursor.value,
      limit: direction * 25,
      authorId: props.authorId
    })

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
      if (props.refreshInterval) {
        fetchNewPostsInterval = setInterval(loadHead, 5000)
      }
      loadHead()
      break
  }
}

onMounted(() => {
  if (props.refreshInterval) {
    fetchNewPostsInterval = setInterval(loadHead, props.refreshInterval)
  }
})
</script>

<template>
  <ScrollObserver class="px-8" @change="handleScrollStateChange">
    <NewPostForm v-if="allowNewPosts" @submit="loadHead()" />
    <template v-if="posts.length > 0">
      <PostCard
        v-for="(post, index) in posts"
        :id="`post-${index}`"
        :key="post.id"
        :post="post"
        :user-reaction="userReactions[post.id]"
        @reaction-change="refreshOne(post.id)"
      />
    </template>
    <template v-else>
      <p class="text-xl py-8 text-center text-gray-400">
        No Post Here.
      </p>
    </template>
  </ScrollObserver>
</template>
