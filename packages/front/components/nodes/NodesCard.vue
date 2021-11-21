<template>
  <v-card :loading="awaitingFirstState">
    <v-card-title>
      <v-simple-checkbox
        :indeterminate="indeterminate"
        :value="allSelected"
        class="ml-4 mr-6"
        @click="selectAll"
      />
      Nodes
      <v-spacer />
      <v-btn
        :disabled="!selectedStates.length"
        fab
        small
        color="primary"
        class="mr-2"
        title="Boot Windows on selected"
      >
        <v-icon> mdi-microsoft-windows </v-icon>
      </v-btn>
      <v-btn
        :disabled="!selectedStates.length"
        fab
        small
        color="primary"
        class="mr-1"
        title="Boot Ubuntu on selected"
      >
        <v-icon> mdi-ubuntu </v-icon>
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
  onMounted,
  onUnmounted,
  ref,
  useContext,
} from '@nuxtjs/composition-api'
import { NodeState } from 'api'
import Vue from 'vue'
import NodeItem from './NodeItem.vue'

export default defineComponent({
  components: { NodeItem },
  setup() {
    const states = ref<NodeState[]>([])
    const selectedStates = ref<NodeState[]>([])
    const awaitingFirstState = ref(true)
    const ctx = useContext()
    const { $auth } = ctx
    // @ts-ignore
    ctx.onUnmounted = onUnmounted
    onMounted(() => {
      const socket: any = ctx.$nuxtSocket({
        auth: { token: ($auth.strategy as any).token.get() },
      } as any)
      socket.on('node/state', (data: NodeState) => {
        const i = states.value?.findIndex((s) => s.host === data.host)
        if (i > -1) Vue.set(states.value as Object, i, data)
        else states.value.push(data)
        awaitingFirstState.value = false
      })
    })

    const pendingCount = computed(
      () => states.value.filter((s) => !s.actionPending).length
    )

    return {
      states,
      awaitingFirstState,
      selectedStates,
      indeterminate: computed(() => {
        return (
          selectedStates.value.length > 0 &&
          selectedStates.value.length < states.value.length
        )
      }),
      allSelected: computed(
        () =>
          selectedStates.value.length ===
          states.value.length - pendingCount.value
      ),
      isSelected(state: NodeState) {
        return selectedStates.value.findIndex((s) => s === state) !== -1
      },
      select(state: NodeState) {
        const i = selectedStates.value?.findIndex((s) => s === state)
        if (i > -1) Vue.delete(selectedStates.value as Object, i)
        else selectedStates.value.push(state)
      },
      selectAll() {
        if (
          selectedStates.value.length <
          states.value.length - pendingCount.value
        )
          selectedStates.value = [...states.value].filter(
            (s) => !s.actionPending
          )
        else selectedStates.value = []
      },
    }
  },
})
</script>

<style scoped>
</style>
