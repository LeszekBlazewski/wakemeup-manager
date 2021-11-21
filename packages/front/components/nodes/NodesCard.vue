<template>
  <v-card>
    <v-card-title>
      <v-simple-checkbox class="ml-4 mr-6" />
      Nodes
      <v-spacer />
      <v-btn fab small color="primary" class="mr-2">
        <img
          class=""
          style="width: 20px"
          :src="require('@/assets/windows.png')"
        />
      </v-btn>
      <v-btn fab small color="primary">
        <v-icon> mdi-ubuntu </v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-list>
        <node-item />
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import NodeItem from './NodeItem.vue'

export default defineComponent({
  components: { NodeItem },
  setup() {
    return {}
  },
})
</script>

<style scoped>
</style>
