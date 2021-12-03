<template>
  <v-list-item two-line>
    <v-list-item-action>
      <v-simple-checkbox :value="selected" @click="$emit('select')" />
    </v-list-item-action>
    <v-overlay absolute :value="state.actionPending">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-overlay>
    <v-tooltip top>
      Last update: {{ last }}
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
        <b>{{ state.name }} · {{ state.fqdn }} ·</b> {{ state.host }}
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
        ·
        <template v-if="state.os === OS.UBUNTU">
          Load: {{ state.loadAvg }}
        </template>
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
          @click="$emit('terminal')"
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
          @click="$emit('boot', OS.WINDOWS)"
        >
          <v-icon> mdi-microsoft-windows </v-icon>
        </v-btn>
        <v-btn
          v-if="!state.alive"
          title="Boot Ubuntu"
          fab
          small
          color="primary"
          class="ml-2"
          @click="$emit('boot', OS.UBUNTU)"
        >
          <v-icon> mdi-ubuntu </v-icon>
        </v-btn>
      </v-row>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@nuxtjs/composition-api'
import { NodeState, OS } from 'api'
import { DateTime } from 'luxon'
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
  emits: ['select', 'shutdown', 'boot', 'terminal'],
  setup(props) {
    return {
      OS,
      last: computed(() => {
        return DateTime.fromMillis(props.state.timestamp).toLocaleString(
          DateTime.DATETIME_MED_WITH_SECONDS
        )
      }),
    }
  },
})
</script>

<style scoped>
</style>
