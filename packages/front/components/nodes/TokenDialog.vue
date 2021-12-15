<template>
  <v-dialog
    persistent
    :value="value"
    :max-width="600"
    @input="(v) => $emit('input', v)"
  >
    <v-card :loading="loading">
      <v-card-title>Generate wake-up token</v-card-title>
      <template v-if="!token">
        <v-card-text>
          This utility will generate wake-up token to boot
          <b>{{ state.name }} [{{ state.host }}]</b> with chosen OS. It is
          possible to change the student's account password alongside this
          process.
          <v-row dense>
            <v-col :cols="12">
              <v-alert
                v-model="alertVisible"
                class="mt-4"
                type="error"
                dismissible
                dense
              >
                {{ alertText }}
              </v-alert>
            </v-col>
            <v-col :cols="6">
              <v-select v-model="form.os" :items="osOptions">
                <template #item="{ item }">
                  <span class="mr-2">
                    <v-icon v-if="item.value === OS.UBUNTU">
                      mdi-ubuntu
                    </v-icon>
                    <v-icon v-if="item.value === OS.WINDOWS">
                      mdi-microsoft-windows
                    </v-icon>
                  </span>
                  {{ item.text }}
                </template>
                <template #selection="{ item }">
                  <span class="mr-2">
                    <v-icon v-if="item.value === OS.UBUNTU">
                      mdi-ubuntu
                    </v-icon>
                    <v-icon v-if="item.value === OS.WINDOWS">
                      mdi-microsoft-windows
                    </v-icon>
                  </span>
                  {{ item.text }}
                </template>
              </v-select>
            </v-col>
            <v-col :cols="6">
              <date-picker v-model="form.expiresAt" label="Expires at" />
            </v-col>
            <v-col :cols="6">
              <v-checkbox
                v-model="form.changePassword"
                label="Change password"
              />
            </v-col>
            <v-col :cols="6">
              <v-text-field
                v-model="form.password"
                prepend-icon="mdi-lock"
                label="New student's password"
                type="password"
                :disabled="!form.changePassword"
                :error-messages="$v.password.$errors.map((e) => e.$message)"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="onClose">Cancel</v-btn>
          <v-btn color="primary" @click="submit">Generate</v-btn>
        </v-card-actions>
      </template>
      <template v-else>
        <v-card-text>
          <v-textarea
            readonly
            rows="8"
            label="Token message"
            :value="tokenMessage"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="onClose">Close</v-btn>
        </v-card-actions>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  defineComponent,
  nextTick,
  PropType,
  reactive,
  ref,
  useContext,
} from '@nuxtjs/composition-api'
import { useVuelidate } from '@vuelidate/core'
import { requiredIf, minLength } from '@vuelidate/validators'
import { DateTime } from 'luxon'
import _ from 'lodash'
import DatePicker from '../form/DatePicker.vue'
import { NodeState, OS } from '~/../api/dist/types'
import { useSnackbarStore } from '~/store/snackbarStore'
interface TokenResponse {
  // eslint-disable-next-line camelcase
  boot_token: string
}

export default defineComponent({
  components: { DatePicker },
  props: {
    value: { type: Boolean, required: true },
    state: { type: Object as PropType<NodeState>, required: true },
  },
  setup(props, { emit }) {
    const { show } = useSnackbarStore()

    const { $axios } = useContext()
    const loading = ref(false)

    const formDefault = {
      os: OS.UBUNTU,
      changePassword: false,
      password: '',
      expiresAt: DateTime.now().plus({ months: 6 }).toISO(),
    }
    const form = reactive(Object.assign({}, formDefault))
    const alertVisible = ref(false)
    const alertText = ref('')
    const token = ref('')
    const $v = useVuelidate(
      {
        changePassword: {},
        password: {
          requiredIf: requiredIf(() => form.changePassword),
          minLength: minLength(8),
        },
      },
      form
    )

    const tokenMessage = ref('')
    return {
      form,
      OS,
      $v,
      osOptions: [
        { value: OS.UBUNTU, text: 'Ubuntu' },
        { value: OS.WINDOWS, text: 'Windows' },
      ],
      loading,
      token,
      alertVisible,
      alertText,
      tokenMessage,
      async submit() {
        $v.value.$touch()
        if ($v.value.$error) return
        try {
          loading.value = true
          const response = await $axios.post<TokenResponse>(
            '/nodes/boot-tokens',
            {
              ...form,
              host: props.state.host,
            }
          )
          token.value = response.data.boot_token
          const queryOpts = {
            name: 'clipboard-write',
            allowWithoutGesture: false,
          }
          const result = await navigator.permissions.query(
            queryOpts as PermissionDescriptor
          )
          if (result.state === 'granted') {
            await nextTick()
            await navigator.clipboard.writeText(token.value)
            show('Wake-up token copied to clipboard')
          }

          tokenMessage.value = ''
          tokenMessage.value += `A new token was generated on ${DateTime.now().toLocaleString(
            DateTime.DATETIME_SHORT_WITH_SECONDS
          )}\n`
          tokenMessage.value += `Expires at: ${DateTime.fromISO(
            form.expiresAt
          ).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}\n`
          tokenMessage.value += `Host: ${props.state.host}\n`
          tokenMessage.value += `OS: ${_.capitalize(form.os)}\n`
          if (form.changePassword) tokenMessage.value += `Password changed`
          tokenMessage.value += `Token: ${token.value}`
        } catch (e) {
          alertVisible.value = true
          alertText.value = 'Server error'
        } finally {
          loading.value = false
          Object.assign(form, formDefault)
        }
      },
      onClose() {
        emit('input', false)
        setTimeout(() => {
          token.value = ''
        }, 300)
      },
    }
  },
})
</script>

<style scoped lang="scss">
</style>
