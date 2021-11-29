<template>
  <v-app dark style="margin-bottom: -48px">
    <v-main>
      <v-container style="position: relative" class="fill-height">
        <v-row align="center" justify="center" class="mb-2 mb-sm-0">
          <v-col :cols="12" :xl="6" :lg="8" :md="10" :sm="12">
            <v-sheet rounded="xl" style="overflow: hidden">
              <v-row no-gutters>
                <v-col :cols="12" :sm="6" :order="1" :order-sm="0">
                  <signin-sheet />
                </v-col>
                <v-col
                  :cols="12"
                  :sm="6"
                  class="pa-8 pa-sm-8 pa-md-12"
                  :order="0"
                  :order-sm="1"
                >
                  <p class="text-subtitle">Lab 229 Cluster Manager</p>
                  <p class="text-h4 text-md-h3 mb-8 mt-n4">Sign in</p>
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
                    <v-text-field
                      v-model="form.username"
                      label="Username"
                      name="username"
                      prepend-icon="mdi-account"
                      type="text"
                      :error-messages="
                        $v.username.$errors.map((e) => e.$message)
                      "
                      :disabled="loading"
                      autocomplete="username"
                      @keydown.enter="submit"
                    ></v-text-field>

                    <v-text-field
                      v-model="form.password"
                      label="Password"
                      name="password"
                      prepend-icon="mdi-lock"
                      type="password"
                      :error-messages="
                        $v.password.$errors.map((e) => e.$message)
                      "
                      :disabled="loading"
                      autocomplete="password"
                      @keydown.enter="submit"
                    ></v-text-field>
                    <v-checkbox
                      v-model="form.rememberMe"
                      label="Remember me"
                      name="rememberMe"
                      :disabled="loading"
                      @keydown.enter="submit"
                    ></v-checkbox>
                    <v-btn
                      block
                      :loading="loading"
                      cy-data="login-button"
                      color="primary"
                      @click="submit"
                    >
                      Sign in
                    </v-btn>
                  </v-form>
                </v-col>
              </v-row>
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
  </v-app>
</template>

<script lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { AxiosError } from 'axios'
import { required } from '@vuelidate/validators'
import {
  defineComponent,
  reactive,
  ref,
  useContext,
} from '@nuxtjs/composition-api'
import SigninSheet from '~/components/layout/SigninSheet.vue'
import GlobalFooter from '~/components/layout/GlobalFooter.vue'
export default defineComponent({
  components: { SigninSheet, GlobalFooter },
  layout: 'guest',
  auth: 'guest',
  setup() {
    const { $auth } = useContext()

    const loading = ref(false)
    const alertVisible = ref(false)
    const alertText = ref('')
    const form = reactive({
      username: '',
      password: '',
      rememberMe: false,
    })

    const $v = useVuelidate(
      {
        username: { required },
        password: { required },
      },
      form
    )

    async function submit() {
      $v.value.$touch()
      if ($v.value.$error) return
      try {
        loading.value = true
        await $auth.loginWith('local', { data: form })
      } catch (e) {
        const err = e as AxiosError
        alertVisible.value = true
        if (err.response?.status === 404) {
          alertText.value = 'Invalid username or password'
        } else {
          alertText.value = 'Server error'
        }
      } finally {
        loading.value = false
      }
    }

    return { form, $v, loading, submit, alertVisible, alertText }
  },
  head: {
    title: 'Sign in',
  },
})
</script>

<style scoped lang="scss"></style>
