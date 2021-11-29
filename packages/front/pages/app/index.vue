<template>
  <v-row>
    <v-col :cols="12">
      <nodes-card />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import NodesCard from '~/components/nodes/NodesCard.vue'
import { useNavigationStore } from '~/store/navigationStore'

export default defineComponent({
  auth: true,
  components: { NodesCard },
  middleware() {
    useNavigationStore().title = 'Dashboard'
  },
  setup() {
    return {}
  },
})
</script>

<style scoped>
</style>
