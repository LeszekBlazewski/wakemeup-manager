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
  onMounted,
  ref,
  useContext,
  watch,
} from '@nuxtjs/composition-api'
import { NodeState, OS } from '~/../api/dist/types'
import { useTerminal } from '~/composables/useTerminal'
import { useNavigationStore } from '~/store/navigationStore'
import { useNodesStore } from '~/store/nodesStore'
export default defineComponent({
  auth: true,
  middleware() {
    useNavigationStore().title = 'Terminal'
  },
  setup(_props, { refs }) {
    const masterNode: Partial<NodeState> = {
      host: '',
      name: 'Master',
      os: OS.UBUNTU,
      username: 'lab',
    }
    const { runInTerminal, getSshCommand } = useTerminal()
    const nodesStore = useNodesStore()
    const { $axios, $auth, route } = useContext()
    const key = ref(0)
    const src = computed(() => {
      const token = ($auth.strategy as any).token.get() as string
      return `${$axios.defaults.baseURL}wetty?token=${token?.substr(7)}`
    })

    const selectedState = computed<Partial<NodeState>>(() => {
      return (
        nodesStore.states.find(
          (s) => s.host === route.value.query?.host || ''
        ) || masterNode
      )
    })

    const stateItems = computed<Partial<NodeState>[]>(() => {
      return [
        masterNode,
        ...nodesStore.states.filter((s) => s.alive && !s.actionPending),
      ]
    })

    watch(selectedState, (n, o) => {
      if (n.host !== o.host) {
        textareaObserver.disconnect()
        key.value++
      }
    })

    function enterCommand() {
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

    let textareaObserver: MutationObserver
    let iframeObserver: MutationObserver
    if (process.client) {
      textareaObserver = new MutationObserver((changes) => {
        if (selectedState.value?.host)
          for (const c of changes) {
            if (!(c.target as HTMLElement).style.left.startsWith('0')) {
              enterCommand()
              textareaObserver.disconnect()
              break
            }
          }
      })
      iframeObserver = new MutationObserver((change) => {
        const iframe = refs.iframe as HTMLIFrameElement
        const textarea = iframe?.contentDocument?.querySelector(
          '.xterm-helper-textarea'
        )
        if (textarea) {
          textareaObserver.observe(textarea, { attributes: true })
          iframeObserver.disconnect()
        }
      })
    }

    onMounted(() => {})

    return {
      OS,
      src,
      key,
      selectedState,
      runInTerminal,
      stateItems,
      select(state: NodeState) {
        runInTerminal(state)
      },
      onLoad() {
        const iframe = refs.iframe as HTMLIFrameElement
        if (iframe.contentDocument) {
          const textarea = iframe?.contentDocument?.querySelector(
            '.xterm-helper-textarea'
          )
          if (textarea) {
            textareaObserver.observe(textarea, { attributes: true })
          } else {
            iframeObserver.observe(iframe.contentDocument.body, {
              subtree: true,
              childList: true,
            })
          }
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
