<template>
  <v-app dark style="margin-bottom: -48px">
    <v-main>
      <v-container style="position: relative" class="fill-height">
        <v-row align="center" justify="center" class="mb-2 mb-sm-0">
          <v-col :cols="12" :xl="6" :lg="8" :md="10" :sm="12">
            <v-sheet rounded="xl" style="overflow: hidden">
              <nuxt />
            </v-sheet>
          </v-col>
        </v-row>
        <a
          class="text-caption white--text text-center"
          style="
            width: 100%;
            position: absolute;
            bottom: 0;
            text-decoration: none;
          "
          href="https://www.freepik.com/vectors/data"
        >
          Data vector created by macrovector - www.freepik.com
        </a>
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

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import GlobalFooter from '~/components/layout/GlobalFooter.vue'
import { useSnackbarStore } from '~/store/snackbarStore'

export default defineComponent({
  components: { GlobalFooter },
  setup() {
    return {
      snackbar: useSnackbarStore(),
    }
  },
})
</script>

<style scoped>
</style>
