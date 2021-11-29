<template>
  <v-app dark>
    <v-navigation-drawer v-model="drawer" clipped fixed app>
      <v-list>
        <v-list-item v-if="user" two-line>
          <v-list-item-avatar color="primary">
            <v-icon>mdi-account</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title> Lab 229 </v-list-item-title>
            <v-list-item-subtitle> Cluster Manager </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
          @click="item.click && item.click()"
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar clipped-left app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />

      <v-toolbar-title v-text="title" />
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <global-footer />

    <v-snackbar v-model="snackbar.visible">
      {{ snackbar.message }}
      <template #action="{ attrs }">
        <v-btn
          color="primary"
          text
          v-bind="attrs"
          @click="snackbar.visible = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script lang='ts'>
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  provide,
  ref,
  useContext,
} from '@nuxtjs/composition-api'
import Vue from 'vue'
import { useNavigationStore } from '@/store/navigationStore'
import GlobalFooter from '~/components/layout/GlobalFooter.vue'
import { useNodesStore } from '~/store/nodesStore'
import { useSnackbarStore } from '~/store/snackbarStore'
import { NodeState } from '~/../api/dist/types'
export default defineComponent({
  components: { GlobalFooter },
  setup() {
    const { $auth } = useContext()

    const drawer = ref(true)
    const navigationStore = useNavigationStore()

    if (process.client) {
      const { states, beat } = useNodesStore()
      const ctx = useContext()
      // @ts-ignore
      ctx.onUnmounted = onUnmounted
      const socket = ref<any | null>(null)
      provide('socket', socket)
      onMounted(() => {
        socket.value = ctx.$nuxtSocket({
          auth: { token: ($auth.strategy as any).token.get() },
          path: '/api/cluster/socket.io',
          autoConnect: false,
        } as any)
        socket.value.on('node/state', (data: NodeState) => {
          const i = states.findIndex((s) => s.host === data.host)
          if (i > -1) Vue.set(states as Object, i, data)
          else states.push(data)
          beat()
        })

        socket.value.connect()
      })
    }

    return {
      snackbar: useSnackbarStore(),
      drawer,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Dashboard',
          to: '/app',
        },
        {
          icon: 'mdi-console-line',
          title: 'Terminal',
          to: '/app/terminal',
        },
        {
          icon: 'mdi-logout',
          title: 'Sign out',
          click: () => $auth.logout(),
        },
      ],
      title: computed(() => navigationStore.title),
      user: computed(() => $auth.user),
    }
  },
  head() {
    const navigationStore = useNavigationStore()
    return { title: navigationStore.title }
  },
})
</script>
