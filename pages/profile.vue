<script setup lang="ts">
import ChevronLeft from '@vicons/fa/ArrowLeft'
import { FormInst, useMessage } from 'naive-ui'

type FormValue = {
  name: string | null
  email: string | null
}

definePageMeta({ middleware: 'auth', layout: false })

// composables
const { $client } = useNuxtApp()
const message = useMessage()
const loadingBar = useLoadingBar()

const rules = {
  name: {
    required: true,
    message: 'Name is required',
    trigger: 'blur'
  }
}
const form = ref<FormInst | null>(null)
const previousProfile = reactive<FormValue>({
  name: '',
  email: ''
})
const formValue = reactive<FormValue>({
  name: '',
  email: ''
})
const isDirty = computed(() => {
  return formValue.name !== previousProfile.name
})

function updateBaseValue (value: FormValue) {
  previousProfile.email = value.email
  previousProfile.name = value.name
  formValue.email = value.email
  formValue.name = value.name
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

  if (formValue.name === null) {
    return
  }

  loadingBar.start()
  const result = await $client.patchMyProfile.mutate({
    name: formValue.name
  })
  updateBaseValue({
    name: result.name,
    email: result.email
  })
  loadingBar.finish()

  message.success('Saved profile')
}

onMounted(() => {
  loadingBar.start()
  $client.getMyProfile.query().then((result) => {
    if (!result) {
      return
    }
    updateBaseValue({
      name: result.name,
      email: result.email
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
      <NuxtLink to="/" class="back-icon">
        <NIcon to="/" :size="24" class="mr-4">
          <ChevronLeft />
        </NIcon>
      </NuxtLink>
    </template>
    <template #title>
      Profile
    </template>
    <div class="p-6">
      <NForm ref="form" :model="formValue" size="medium" :rules="rules">
        <NFormItem label="Name" path="name">
          <NInput v-model:value="formValue.name" placeholder="John Doe" />
        </NFormItem>
        <NFormItem label="Email" path="email">
          <NInput v-model:value="formValue.email" placeholder="john.doe@example." disabled />
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

<style scoped>
.back-icon {
  line-height: 0;
}
</style>
