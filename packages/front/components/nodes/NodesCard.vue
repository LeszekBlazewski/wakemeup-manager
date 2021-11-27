<template>
  <v-card :loading="!states.length">
    <v-card-title>
      <v-simple-checkbox
        :indeterminate="indeterminate"
        :value="allSelected"
        class="ml-4 mr-6"
        @click="selectAll"
      />
      Nodes
      <v-spacer />

      <v-btn fab small color="primary" title="Check states" @click="refresh">
        <v-icon> mdi-refresh </v-icon>
      </v-btn>
      <v-divider class="ml-2" vertical />
      <v-btn
        :disabled="
          !selectedStates.length || !selectedStates.some((s) => !s.alive)
        "
        fab
        small
        color="primary"
        class="ml-2"
        title="Boot Windows on selected"
        @click="boot(OS.WINDOWS, selectedStates)"
      >
        <v-icon> mdi-microsoft-windows </v-icon>
      </v-btn>
      <v-btn
        :disabled="
          !selectedStates.length || !selectedStates.some((s) => !s.alive)
        "
        fab
        small
        color="primary"
        class="ml-2"
        title="Boot Ubuntu on selected"
        @click="boot(OS.UBUNTU, selectedStates)"
      >
        <v-icon> mdi-ubuntu </v-icon>
      </v-btn>
      <v-btn
        :disabled="
          !selectedStates.length || !selectedStates.some((s) => s.alive)
        "
        title="Shutdown selected"
        fab
        small
        color="primary"
        class="ml-2 mr-1"
        @click="shutdown(selectedStates)"
      >
        <v-icon> mdi-window-close </v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-list>
        <node-item
          v-for="state in states"
          :key="state.host"
          :state="state"
          :selected="isSelected(state)"
          @select="select(state)"
          @shutdown="shutdown(state)"
          @boot="(os) => boot(os, state)"
          @terminal="runInTerminal(state)"
        />
        <v-list-item v-if="!states.length">
          <v-list-item-content class="justify-center">
            No hosts defined in the inventory
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  inject,
  ref,
  useContext,
  watch,
} from '@nuxtjs/composition-api'
import { AnsibleHost, NodeState, OS } from 'api'
import Vue from 'vue'
import _ from 'lodash'
import NodeItem from './NodeItem.vue'
import { useNodesStore } from '~/store/nodesStore'
import { useTerminal } from '@/composables/useTerminal'
import { useSnackbarStore } from '~/store/snackbarStore'
export default defineComponent({
  components: { NodeItem },
  setup() {
    const { $axios } = useContext()
    const { runInTerminal } = useTerminal()
    const { states } = useNodesStore()
    const { show } = useSnackbarStore()
    const socket = inject<any>('socket', ref(null))
    const selectedHosts = ref<AnsibleHost[]>([])
    const selectedStates = computed<NodeState[]>(() =>
      states.filter((s) => selectedHosts.value.includes(s.host))
    )

    const pendingCount = computed(
      () => states.filter((s) => s.actionPending).length
    )

    watch(
      states,
      () => {
        states.forEach((state) => {
          if (state.actionPending) {
            const i = selectedHosts.value?.findIndex((s) => s === state.host)
            if (i > -1) Vue.delete(selectedHosts.value as Object, i)
          }
        })
      },
      { deep: true }
    )

    return {
      OS,
      states,
      selectedStates,
      runInTerminal,
      indeterminate: computed(() => {
        return (
          selectedHosts.value.length > 0 &&
          selectedHosts.value.length < states.length - pendingCount.value
        )
      }),
      allSelected: computed(() => {
        return selectedHosts.value.length === states.length - pendingCount.value
      }),
      isSelected(state: NodeState) {
        return (
          selectedStates.value.findIndex((s) => s.host === state.host) !== -1
        )
      },
      select(state: NodeState) {
        const i = selectedHosts.value?.findIndex((s) => s === state.host)
        if (i > -1) Vue.delete(selectedHosts.value as Object, i)
        else selectedHosts.value.push(state.host)
      },
      selectAll() {
        if (selectedHosts.value.length < states.length - pendingCount.value)
          selectedHosts.value = [...states]
            .filter((s) => !s.actionPending)
            .map((s) => s.host)
        else selectedHosts.value = []
      },
      shutdown: _.throttle((...states: NodeState[]) => {
        states.forEach((state) => {
          if (socket.value) socket.value.emit('node/shutdown', state)
        })
      }, 1000),
      boot: _.throttle((os: OS, ...states: NodeState[]) => {
        states.forEach((state) => {
          if (socket.value) socket.value.emit(`node/boot/${os}`, state)
        })
      }, 1000),
      refresh: _.throttle(() => {
        $axios.get('nodes/check-states')
        show('Refresh request sent. It happens automatically every 10s.')
      }, 1000),
    }
  },
})
</script>
