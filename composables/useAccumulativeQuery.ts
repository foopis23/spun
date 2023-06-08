export type AccumulativeQueryHandler<T> = (opts: { cursor: Ref<string | undefined>, hasMore: Ref<boolean>, direction: -1 | 1}) =>
  Promise<T[]>

export const useAccumulativeQuery = <T>(handler: AccumulativeQueryHandler<T>) => {
  const data = ref<T[]>([]) as Ref<T[]> // I don't know why as Ref<T[]> is needed here... seems to be a problem with generics and refs
  const pending = ref(false)

  const headCursor = ref<string | undefined>(undefined)
  const tailCursor = ref<string | undefined>(undefined)
  const headHasMore = ref<boolean>(false)
  const tailHasMore = ref<boolean>(true)

  // TODO: implement way to poke head to see if more data is available

  const loadTail = async () => {
    if (pending.value) {
      return
    }

    pending.value = true
    const res = await handler({ direction: 1, cursor: tailCursor, hasMore: tailHasMore })
    data.value = data.value.concat(res)

    pending.value = false
  }

  const loadHead = async () => {
    if (pending.value) {
      return
    }

    pending.value = true
    const res = await handler({ direction: -1, cursor: headCursor, hasMore: headHasMore })
    data.value = res.concat(data.value)

    pending.value = false
  }

  onMounted(loadTail)

  return {
    data,
    pending,
    headCursor,
    tailCursor,
    headHasMore,
    tailHasMore,
    loadHead,
    loadTail
  }
}
