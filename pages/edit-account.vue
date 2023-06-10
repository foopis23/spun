<script setup lang="ts">
import ChevronLeft from '@vicons/fa/ArrowLeft'
import { FormInst, useMessage } from 'naive-ui'

type FormValue = {
  name: string | null
  email: string | null
  bio: string | null
}

definePageMeta({ middleware: 'auth', layout: false })

// composables
const { $client } = useNuxtApp()
const message = useMessage()
const loadingBar = useLoadingBar()

const form = ref<FormInst | null>(null)
const previousProfile = reactive<FormValue>({
  name: '',
  email: '',
  bio: ''
})
const formValue = reactive<FormValue>({
  name: '',
  email: '',
  bio: ''
})
const isDirty = computed(() => {
  return formValue.name !== previousProfile.name ||
    formValue.email !== previousProfile.email ||
    formValue.bio !== previousProfile.bio
})

function updateBaseValue (value: FormValue) {
  previousProfile.email = value.email
  previousProfile.name = value.name
  previousProfile.bio = value.bio
  formValue.email = value.email
  formValue.name = value.name
  formValue.bio = value.bio
}

async function handleSubmit (e: MouseEvent) {
  e.preventDefault()

  if (e.target instanceof HTMLButtonElement && e.target.disabled) {
    return
  }

  const errors = await new Promise((resolve) => {
    form.value?.validate(resolve)
  })

  if (errors) {
    message.error('Failed to save profile')
    return
  }

  if (formValue.name === null || formValue.bio === null) {
    return
  }

  loadingBar.start()
  const result = await $client.my.patchProfile.mutate({
    name: formValue.name,
    bio: formValue.bio
  })
  updateBaseValue({
    name: result.name,
    email: result.email,
    bio: result.bio
  })
  loadingBar.finish()

  message.success('Saved profile')
}

onMounted(() => {
  loadingBar.start()
  $client.my.getProfile.query().then((result) => {
    if (!result) {
      return
    }
    updateBaseValue({
      name: result.name,
      email: result.email,
      bio: result.bio
    })
  }).finally(() => {
    loadingBar.finish()
  }).catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e)
    message.error('Failed to load profile')
  })
})
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
      Edit Account
    </template>
    <div class="p-6">
      <NForm ref="form" :model="formValue" size="medium">
        <NFormItem label="Name" path="name">
          <NInput v-model:value="formValue.name" placeholder="John Doe" :minlength="1" :maxlength="255" required />
        </NFormItem>
        <NFormItem label="Email" path="email">
          <NInput v-model:value="formValue.email" placeholder="john.doe@example.com" disabled />
        </NFormItem>
        <NFormItem label="Bio" path="bio">
          <NInput v-model:value="formValue.bio" type="textarea" placeholder="I'm so silly" :maxlength="255" />
        </NFormItem>
        <NFormItem>
          <NButton type="primary" ghost :disabled="!isDirty" @click="handleSubmit">
            Save
          </NButton>
        </NFormItem>
      </NForm>
    </div>
  </NuxtLayout>
</template>
