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
    label: 'Edit Account',
    key: 'edit-account'
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
      router.push(`/profile/${(session.value?.user as any)?.id}`)
      break
    case 'edit-account':
      router.push('/edit-account')
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
          <h1 class="text-2xl font-bold">
            <slot name="title">
              Home
            </slot>
          </h1>
        </div>
        <NDropdown v-if="session?.user" trigger="hover" :options="userDropdownOptions" @select="handleSelect">
          <NAvatar
            class="flex-grow-0 flex-shrink-0 hover:cursor-pointer"
            :src="session?.user?.image ?? ''"
            round
            size="large"
          />
        </NDropdown>
        <div v-else>
          <NButton type="primary" ghost @click="router.push('/login')">
            Login
          </NButton>
        </div>
      </div>
    </div>
    <div class="flex-grow overflow-hidden pb-1 flex flex-col">
      <slot />
    </div>
  </div>
</template>
