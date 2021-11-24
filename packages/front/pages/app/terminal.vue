<template>
  <v-card>
    <v-card-title>
      <v-row justify="space-between" align="center">
        <v-col cols="auto"> Terminal </v-col>
        <v-col cols="auto" :md="4">
          <v-select
            :value="selectedState"
            hide-details
            outlined
            dense
            :items="stateItems"
            item-text="name"
            return-object
            label="Current node"
            prepend-inner-icon="mdi-monitor"
            @input="select"
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
      </v-row>
    </v-card-title>
    <v-card-text>
      <iframe
        :key="key"
        ref="iframe"
        :src="src"
        width="100%"
        height="600px"
        @load="onLoad"
      >
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
import wait from 'wait'
import { NodeState, OS } from '~/../api/dist/types'
import { useTerminal } from '~/composables/useTerminal'
import { useNavigationStore } from '~/store/navigationStore'
import { useNodesStore } from '~/store/nodesStore'

export default defineComponent({
  middleware() {
    useNavigationStore().title = 'Terminal'
  },
  setup(_props, { refs }) {
    const masterNode: Partial<NodeState> = {
      host: '',
      name: 'Master',
      os: OS.UBUNTU,
    }
    const { runInTerminal, getSshCommand } = useTerminal()
    const { states } = useNodesStore()
    const { $axios, $auth, route } = useContext()
    const key = ref(0)
    const src = computed(() => {
      const token = ($auth.strategy as any).token.get() as string
      return `${$axios.defaults.baseURL}wetty?token=${token?.substr(7)}`
    })

    const selectedState = ref<Partial<NodeState> | null>(masterNode)

    const stateItems = ref<Partial<NodeState>[]>([masterNode])
    watch(
      states,
      () => {
        stateItems.value = [
          masterNode,
          ...states.filter((s) => s.alive && !s.actionPending),
        ]
      },
      { deep: true, immediate: true }
    )
    watch(
      () => route.value.query.host,
      () => {
        selectedState.value =
          states.find((s) => s.host === route.value.query?.host || '') ||
          masterNode
      },
      { deep: true, immediate: true }
    )

    watch(selectedState, () => {
      observer.disconnect()
      key.value++
    })

    async function enterCommand() {
      if (selectedState.value) {
        const iframe = refs.iframe as HTMLIFrameElement
        const command = getSshCommand(selectedState.value as NodeState)
        const textarea = iframe?.contentDocument?.querySelector(
          '.xterm-helper-textarea'
        ) as HTMLTextAreaElement | null
        if (textarea) {
          const dto = new DataTransfer()
          dto.setData('text/plain', command)
          textarea.dispatchEvent(
            new ClipboardEvent('paste', { clipboardData: dto })
          )
          textarea.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'enter', keyCode: 13 })
          )
        }
      }
    }

    let observer: MutationObserver
    if (process.client) {
      observer = new MutationObserver((changes) => {
        if (selectedState.value?.host)
          for (const c of changes) {
            if (!(c.target as HTMLElement).style.left.startsWith('0')) {
              enterCommand()
              observer.disconnect()
              break
            }
          }
      })
    }

    return {
      OS,
      src,
      states,
      key,
      selectedState,
      runInTerminal,
      stateItems,
      select(state: NodeState) {
        runInTerminal(state)
      },
      onLoad() {
        const iframe = refs.iframe as HTMLIFrameElement
        const textarea = iframe?.contentDocument?.querySelector(
          '.xterm-helper-textarea'
        )
        if (textarea && observer) {
          observer.observe(textarea, { attributes: true })
        }
      },
    }
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
