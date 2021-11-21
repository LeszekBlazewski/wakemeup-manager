<template>
  <div>xd</div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { useNavigationStore } from '~/store/navigationStore'

export default defineComponent({
  middleware() {
    useNavigationStore().title = 'Terminal'
  },
  setup() {
    return {}
  },
})
</script>

<style scoped>
</style>
