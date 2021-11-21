<template>
  <v-list-item two-line>
    <v-list-item-action> <v-simple-checkbox /> </v-list-item-action>
    <v-tooltip top>
      <template> Last update: 2005-04-02 21:37:00 </template>
      <template> Last seen: 2005-04-02 21:37:00 </template>
      <template #activator="{ attrs, on }">
        <v-list-item-avatar
          v-bind="attrs"
          size="48"
          color="primary"
          class="mr-2"
          style="overflow: visible; position: relative"
          v-on="on"
        >
          <v-icon> mdi-monitor </v-icon>
          <v-sheet
            color="green"
            rounded="circle"
            elevation="4"
            style="
              width: 15px;
              height: 15px;
              position: absolute;
              bottom: 0;
              right: 0;
            "
          />
        </v-list-item-avatar>
      </template>
    </v-tooltip>
    <v-list-item-content>
      <v-list-item-title> <b>Node 01</b> · 213.721.372.137 </v-list-item-title>
      <v-list-item-subtitle>
        <v-icon> mdi-ubuntu </v-icon>

        <img
          style="width: 20px; vertical-align: middle"
          :src="require('@/assets/windows.png')"
        />
        <span> Alive </span>
        <span> Dead </span>
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action>
      <v-row>
        <v-btn fab small color="primary" class="mr-2">
          <v-icon> mdi-console-line </v-icon>
        </v-btn>
        <v-btn fab small color="primary" class="mr-2">
          <v-icon> mdi-window-close </v-icon>
        </v-btn>
        <v-btn fab small color="primary" class="mr-2">
          <img style="width: 20px" :src="require('@/assets/windows.png')" />
        </v-btn>
        <v-btn fab small color="primary">
          <v-icon> mdi-ubuntu </v-icon>
        </v-btn>
      </v-row>
    </v-list-item-action>
  </v-list-item>
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
