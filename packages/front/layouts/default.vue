<template>
  <v-app dark>
    <v-navigation-drawer v-model="drawer" clipped fixed app>
      <!--  <v-row v-if="user" dense class="mx-1 mt-4 text-center" justify="center">
        <v-col :cols="12">
          <v-avatar color="primary">
            <v-icon>mdi-account</v-icon>
          </v-avatar>
        </v-col>
        <v-col :cols="12">
          <h3>
            {{ user.name }}
          </h3>
        </v-col>
      </v-row>
 -->
      <!--       <v-divider /> -->

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
  </v-app>
</template>

<script lang='ts'>
import {
  computed,
  defineComponent,
  ref,
  useContext,
} from '@nuxtjs/composition-api'
import { useNavigationStore } from '@/store/navigationStore'
import GlobalFooter from '~/components/layout/GlobalFooter.vue'
export default defineComponent({
  components: { GlobalFooter },
  auth: true,
  setup() {
    const { $auth, redirect } = useContext()
    if (!$auth.loggedIn) redirect('/')

    const drawer = ref(true)
    const navigationStore = useNavigationStore()
    return {
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
