<script setup lang="ts">
import { TRPCClientError } from '@trpc/client'
import { NInput } from 'naive-ui'

const { $client } = useNuxtApp()
const message = useMessage()

const loading = ref(false)
const contentInput = ref<InstanceType<typeof NInput> | null>(null)
const postContent = ref('')

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'submit', value: string): void,
}>()

function handleSubmit () {
  submitPost(postContent.value).then(() => {
    emit('submit', postContent.value)
    postContent.value = ''
    contentInput.value?.focus()
  })
}

const submitPost = async (content: string) => {
  if (!content) { return }
  try {
    loading.value = true
    await $client.post.create.mutate({ content })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)

    if (e instanceof TRPCClientError) {
      switch (e.data.code) {
        case 'BAD_REQUEST':
          message.error(e.message)
          break
        default:
          message.error('An unknown error occurred')
          break
      }
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="new-post-container">
    <NInput
      id="content"
      ref="contentInput"
      v-model:value="postContent"
      maxlength="280"
      show-count
      name="content"
      type="textarea"
      placeholder="Whats on your mind?"
      size="large"
      :loading="loading"
      :disabled="loading"
    />
    <div class="flex justify-end pt-3 pb-5">
      <NButton size="large" type="primary" ghost @click="handleSubmit">
        Post
      </NButton>
    </div>
  </div>
</template>

<style scoped>

</style>
