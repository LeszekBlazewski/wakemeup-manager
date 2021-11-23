<template>
  <v-card>
    <v-card-title>
      <v-row justify="space-between" align="center">
        <v-col cols="auto"> Master terminal </v-col>
        <v-col cols="auto" :md="4">
          <v-select
            v-model="selectedState"
            hide-details
            outlined
            dense
            :items="states.filter((s) => s.alive)"
            item-text="name"
            return-object
            label="Choose an alive node to connect to"
            prepend-inner-icon="mdi-monitor"
          >
            <template #item="{ item }">
              <span class="mr-2">
                <v-icon v-if="item.os === OS.UBUNTU"> mdi-ubuntu </v-icon>
                <v-icon v-if="item.os === OS.WINDOWS">
                  mdi-microsoft-windows
                </v-icon>
              </span>
              {{ item.name }}
            </template>
          </v-select>
        </v-col>
        {{ selectedState }}
      </v-row>
    </v-card-title>
    <v-card-text>
      <iframe :key="key" ref="iframe" :src="src" width="100%" height="600px">
      </iframe>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  useContext,
  watch,
} from '@nuxtjs/composition-api'
import { OS } from '~/../api/dist/types'
import { useTerminal } from '~/composables/useTerminal'
import { useNavigationStore } from '~/store/navigationStore'
import { useNodesStore } from '~/store/nodesStore'

export default defineComponent({
  middleware() {
    useNavigationStore().title = 'Terminal'
  },
  setup() {
    const { runInTerminal } = useTerminal()
    const selectedState = ref(null)
    const { states } = useNodesStore()
    const { $axios, $auth } = useContext()
    const key = ref(0)
    const src = computed(() => {
      const token = ($auth.strategy as any).token.get() as string
      return `${$axios.defaults.baseURL}/wetty?token=${token?.substr(7)}`
    })

    watch(selectedState, () => {
      if (selectedState.value) {
        runInTerminal(selectedState.value)
        key.value++
        selectedState.value = null
      }
    })

    return { OS, src, states, key, selectedState, runInTerminal }
  },
})
</script>

<style scoped lang="scss">
iframe {
  border: none;
  border-radius: 4px;
  padding: 16px;
  background-color: black;
}
</style>
