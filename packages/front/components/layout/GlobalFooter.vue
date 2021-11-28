<template>
  <v-footer app>
    <span>
      Copyright ©

      <a
        href="http://github.com/leszekblazewski"
        target="_blank"
        class="author"
      >
        @leszekblazewski</a
      >
      <a href="http://github.com/dex1g" target="_blank" class="author">
        @dex1g</a
      >
      <a href="http://github.com/damiankoper" target="_blank" class="author">
        @damiankoper</a
      >
      {{ new Date().getFullYear() }}
    </span>
    <v-spacer />
    <span title="Nodes heartbeat" style="cursor: pointer">
      Made with
      <template v-if="throttledHB">❤️</template>
      <template v-else>💚</template>
    </span>
  </v-footer>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from '@nuxtjs/composition-api'
import _ from 'lodash'
import { useNodesStore } from '~/store/nodesStore'
export default defineComponent({
  setup() {
    const throttledHB = ref(true)
    const { $state } = useNodesStore()
    watch(
      () => $state.heartbeat,
      _.throttle(() => {
        throttledHB.value = !throttledHB.value
      }, 50)
    )

    return { throttledHB }
  },
})
</script>

<style scoped>
</style>
