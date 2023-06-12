<script setup lang="ts">
import { ThumbsUp, ThumbsDown } from '@vicons/fa'
import { inferRouterOutputs } from '@trpc/server'
import { AppRouter } from '~/server/trpc/routers'

const { $client } = useNuxtApp()

const rotationNumber = Math.floor(Math.random() * 4) + 1
const props = defineProps<{
  post: inferRouterOutputs<AppRouter>['post']['getAll']['data'][0],
  userReaction: 'DISLIKE' | 'LIKE' | undefined,
}>()

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'reactionChange', reaction: 'DISLIKE' | 'LIKE' | undefined): void,
}>()

function formatDate (date: Date) {
  const d = new Date(date)
  // format 6/3/23 1:29 PM
  return d.toLocaleString('en-us', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }).replace(',', '')
}

async function handleReactionClick (type: 'LIKE' | 'DISLIKE') {
  if (props.userReaction === type) {
    await $client.post.removeReaction.mutate({ postId: props.post.id })
  } else {
    await $client.post.addReaction.mutate({ type, postId: props.post.id })
  }

  emit('reactionChange', props.userReaction === type ? undefined : type)
}
</script>

<template>
  <div
    class="post h-80 w-80 m-auto border border-gray-200 p-2 flex flex-col gap-2 break-words overflow-x-hidden overflow-y-hidden"
    :class="'rotate-' + rotationNumber"
  >
    <div class="scrollbar flex gap-2 flex-grow flex-shrink overflow-x-auto overflow-y-auto">
      <NuxtLink :to="`/profile/${post.author.id}`">
        <NAvatar class="flex-grow-0 flex-shrink-0" :src="post.author.image ?? ''" round />
      </NuxtLink>
      <div class="flex-grow flex-col">
        <span class="text-lg mb-1 flex-grow-0">
          <NuxtLink :to="`/profile/${post.author.id}`">
            <span class="mr-2">{{ post.author.name }}</span>
          </NuxtLink>
          <span class="text-gray-400 text-xs">
            {{ formatDate(post.createdAt) }}
          </span><br>
        </span>
        <p>
          {{ post.content }}
        </p>
      </div>
    </div>

    <div class="flex flex-grow-0 flex-shrink-0 gap-4">
      <div
        class="hover:cursor-pointer"
        :class="{ 'text-green-400': userReaction === 'LIKE', 'text-gray-500': userReaction !== 'LIKE', 'hover:text-gray-200': userReaction !== 'LIKE', 'hover:text-green-700': userReaction === 'LIKE'}"
        @click="handleReactionClick('LIKE')"
      >
        <NIcon size="large">
          <ThumbsUp />
        </NIcon> {{ post.likes }}
      </div>
      <div
        class="hover:cursor-pointer"
        :class="{'text-red-400': userReaction === 'DISLIKE', 'text-gray-500': userReaction !== 'DISLIKE', 'hover:text-gray-200': userReaction !== 'DISLIKE', 'hover:text-red-700': userReaction === 'DISLIKE'}"
        @click="handleReactionClick('DISLIKE')"
      >
        <NIcon size="large">
          <ThumbsDown class="" />
        </NIcon> {{ post.dislikes }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.post {
  --rotate-duration-1: 10s;
  --rotate-duration-2: 10s;
  --rotate-duration-3: 10s;
  --rotate-duration-4: 10s;
}

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

.scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.scrollbar::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.5);        /* color of the tracking area */
}

.scrollbar::-webkit-scrollbar-thumb {
  background-color: #555;    /* color of the scroll thumb */
  border-radius: 1000px;       /* roundness of the scroll thumb */
}
</style>
