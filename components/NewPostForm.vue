<script setup lang="ts">
import { NInput } from 'naive-ui'

const props = defineProps<{
  loading: boolean,
}>()

const contentInput = ref<InstanceType<typeof NInput> | null>(null)
const postContent = ref('')

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'submit', value: string): void,
}>()

function handleSubmit () {
  emit('submit', postContent.value)
  postContent.value = ''
  contentInput.value?.focus()
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
      :loading="props.loading"
      :disabled="props.loading"
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
