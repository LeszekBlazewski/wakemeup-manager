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
    Made with ❤️
  </v-footer>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    return {}
  },
})
</script>

<style scoped>
</style>
