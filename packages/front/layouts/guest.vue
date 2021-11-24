<template>
  <v-app>
    <v-main>
      <nuxt />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  auth: 'guest',
  setup() {
    return {}
  },
})
</script>

<style scoped>
</style>
