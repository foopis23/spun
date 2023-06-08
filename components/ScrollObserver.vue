<script setup lang="ts">
import { NScrollbar } from 'naive-ui'

type ScrollState = 'top' | 'middle' | 'bottom'

interface Props {
  tolerance?: number
}

const props = withDefaults(defineProps<Props>(), {
  tolerance: 5
})

// eslint-disable-next-line func-call-spacing
const emits = defineEmits<{
  (e: 'change', current: ScrollState, previous: ScrollState): void
}>()

let scrollState : ScrollState = 'top'

// debounce scroll
const handleScroll = (e: Event) => {
  const el = e.target as HTMLElement
  let nextScrollState: ScrollState = 'middle'
  if (el.scrollTop <= props.tolerance) {
    nextScrollState = 'top'
  } else if (el.scrollTop + el.clientHeight >= el.scrollHeight - props.tolerance) {
    nextScrollState = 'bottom'
  }

  if (nextScrollState !== scrollState) {
    emits('change', nextScrollState, scrollState)
    scrollState = nextScrollState
  }
}
</script>

<template>
  <NScrollbar @scroll="handleScroll">
    <slot />
  </NScrollbar>
</template>

<style scoped>

</style>
