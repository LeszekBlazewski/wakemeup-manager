<template>
  <v-app>
    <v-main>
      <nuxt />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
  auth: 'guest',
  setup() {
    const { $auth, redirect } = useContext()
    if ($auth.loggedIn) redirect('/app')

    return {}
  },
})
</script>

<style scoped>
</style>
