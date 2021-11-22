<template>
  <v-list-item two-line>
    <v-list-item-action>
      <v-simple-checkbox :value="selected" @click="$emit('select')" />
    </v-list-item-action>
    <v-overlay absolute :value="state.actionPending">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-overlay>
    <v-tooltip top>
      <template v-if="state.alive"> Last update: 2005-04-02 21:37:00 </template>
      <template v-else> Last seen: 2005-04-02 21:37:00 </template>
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
            :color="state.alive ? 'green' : 'red'"
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
      <v-list-item-title>
        <b>{{ state.name }} ·</b> {{ state.host }}
      </v-list-item-title>
      <v-list-item-subtitle>
        <v-icon v-if="state.alive && state.os === OS.UBUNTU">
          mdi-ubuntu
        </v-icon>
        <v-icon v-if="state.alive && state.os === OS.WINDOWS">
          mdi-microsoft-windows
        </v-icon>
        <span v-if="state.alive"> Alive </span>
        <span v-else> Dead </span>
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action>
      <v-row>
        <v-btn
          v-if="state.alive"
          title="Run in terminal"
          fab
          small
          color="primary"
          class="ml-2"
        >
          <v-icon> mdi-console-line </v-icon>
        </v-btn>
        <v-btn
          v-if="state.alive"
          title="Shutdown"
          fab
          small
          color="primary"
          class="ml-2"
          @click="$emit('shutdown')"
        >
          <v-icon> mdi-window-close </v-icon>
        </v-btn>
        <v-btn
          v-if="!state.alive"
          title="Boot Windows"
          fab
          small
          color="primary"
          class="ml-2"
        >
          <img style="width: 20px" :src="require('@/assets/windows.png')" />
        </v-btn>
        <v-btn
          v-if="!state.alive"
          title="Boot Ubuntu"
          fab
          small
          color="primary"
          class="ml-2"
        >
          <v-icon> mdi-ubuntu </v-icon>
        </v-btn>
      </v-row>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { NodeState, OS } from 'api'

export default defineComponent({
  props: {
    state: {
      type: Object as PropType<NodeState>,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['select', 'shutdown'],
  setup() {
    return { OS }
  },
})
</script>

<style scoped>
</style>
