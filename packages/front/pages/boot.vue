<template>
  <v-row no-gutters>
    <v-col :cols="12" :sm="5" :order="1" :order-sm="0">
      <signin-sheet />
    </v-col>
    <v-col
      :cols="12"
      :sm="7"
      class="px-8 pa-sm-8 px-md-12 py-4"
      :order="0"
      :order-sm="1"
    >
      <p class="text-subtitle">Lab 229 Cluster Manager</p>
      <p class="text-h4 text-md-h3 mb-8 mt-n4">Token boot</p>
      <v-alert
        v-model="alertVisible"
        cy-data="login-alert"
        type="error"
        dismissible
        dense
      >
        {{ alertText }}
      </v-alert>
      <v-form @keydown.enter="submit">
        <v-textarea
          v-model="form.boot_token"
          outlined
          label="Token"
          :rows="6"
          :error-messages="$v.boot_token.$errors.map((e) => e.$message)"
          placeholder="Paste token here"
        />
        <v-expand-transition>
          <v-row v-if="state && !invalidToken" dense>
            <v-col :cols="12">Expires at: {{ expiresAt }}</v-col>
            <v-col :cols="12">
              <b>{{ state.name }} · </b> {{ state.host }} ·
              <template v-if="state.alive">
                <v-icon v-if="state.os === OS.UBUNTU"> mdi-ubuntu </v-icon>
                <v-icon v-if="state.os === OS.WINDOWS">
                  mdi-microsoft-windows
                </v-icon>
                Alive
              </template>
              <template v-else> Dead </template>
            </v-col>
            <v-col :cols="12">
              {{ state.fqdn }}
            </v-col>
          </v-row>
        </v-expand-transition>
        <v-row dense>
          <v-col cols="auto">
            <v-btn color="accent" @click="$router.back()">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              block
              :loading="loading"
              cy-data="login-button"
              color="primary"
              @click="submit"
            >
              Boot
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import {
  defineComponent,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  useContext,
  watch,
} from '@nuxtjs/composition-api'
import _ from 'lodash'
import jwtDecode from 'jwt-decode'
import { DateTime } from 'luxon'
import SigninSheet from '~/components/layout/SigninSheet.vue'
import { useSnackbarStore } from '~/store/snackbarStore'
import { NodeState, OS } from '~/../api/dist/types'

export default defineComponent({
  components: { SigninSheet },
  layout: 'guest',
  auth: 'guest',
  setup() {
    const { $axios } = useContext()
    const snackbarStore = useSnackbarStore()
    const loading = ref(false)
    const alertVisible = ref(false)
    const alertText = ref('')
    const invalidToken = ref(false)
    const expiresAt = ref('---')

    const form = reactive({
      boot_token: '',
    })

    const $v = useVuelidate(
      {
        boot_token: {
          required,
          valid: helpers.withMessage(
            'Invalid or expired token',
            () => !invalidToken.value
          ),
        },
      },
      form
    )

    watch(
      () => form.boot_token,
      (token) => {
        try {
          invalidToken.value = false
          const payload = jwtDecode<{ exp: number }>(token)
          expiresAt.value = DateTime.fromSeconds(payload.exp).toLocaleString(
            DateTime.DATETIME_SHORT_WITH_SECONDS
          )
        } catch (e) {
          invalidToken.value = true
          expiresAt.value = '---'
          $v.value.$touch()
        }
      }
    )

    const state = ref<NodeState | null>(null)
    async function fetchState() {
      if (form.boot_token) {
        form.boot_token = form.boot_token.trim()
        try {
          const response = await $axios.post<NodeState>(
            '/nodes/boot/state',
            form
          )
          state.value = response.data
          invalidToken.value = false
        } catch (e) {
          state.value = null
          invalidToken.value = true
        }
        $v.value.$touch()
      }
    }
    watch(() => form.boot_token, _.debounce(fetchState, 300))

    let stateInterval: ReturnType<typeof setInterval> | undefined
    onMounted(() => {
      stateInterval = setInterval(fetchState, 10000)
    })
    onUnmounted(() => (stateInterval ? clearInterval(stateInterval) : null))

    async function submit() {
      $v.value.$touch()
      if ($v.value.$error) return
      try {
        loading.value = true
        await $axios.post<NodeState>('/nodes/boot', form)
        snackbarStore.show('Boot request sent')
      } catch (e) {
        alertText.value = 'Server error'
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      $v,
      loading,
      submit,
      alertVisible,
      alertText,
      state,
      OS,
      invalidToken,
      expiresAt,
    }
  },
  head: {
    title: 'Sign in',
  },
})
</script>

<style scoped lang="scss"></style>
