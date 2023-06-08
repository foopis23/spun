<script setup lang="ts">
const { data: session, signOut } = useAuth()
const router = useRouter()

const userDropdownOptions = computed(() => [
  {
    label: `Logged in as ${session.value?.user?.name ?? ''}`,
    key: 'logged-in-as',
    disabled: true
  },
  {
    label: 'Profile',
    key: 'profile'
  },
  {
    label: 'Logout',
    key: 'logout'
  }
])

function handleSelect (value: string) {
  switch (value) {
    case 'logout':
      signOut({
        callbackUrl: '/login'
      })
      break
    case 'profile':
      router.push('/profile')
      break
  }
}
</script>

<template>
  <div v-cloak class="flex flex-col max-w-screen-md mx-auto border-x border-gray-500 h-screen bg-[#1b1b21]">
    <div class="flex-grow-0 px-8 border-b border-gray-500">
      <div class="title-bar flex justify-between py-5">
        <div class="flex items-center">
          <slot name="preTitle" />
          <h1 class="text-3xl font-bold">
            <slot name="title">
              Home
            </slot>
          </h1>
        </div>
        <NDropdown trigger="hover" :options="userDropdownOptions" @select="handleSelect">
          <NAvatar
            class="flex-grow-0 flex-shrink-0 hover:cursor-pointer"
            :src="session?.user?.image ?? ''"
            round
            size="large"
          />
        </NDropdown>
      </div>
    </div>
    <div class="flex-grow overflow-hidden pb-1">
      <slot />
    </div>
  </div>
</template>

<style scoped>

</style>
