<template>
  <v-menu
    ref="menu"
    v-model="menuV"
    :close-on-content-click="false"
    :return-value.sync="dateModel"
    transition="scale-transition"
    offset-y
    left
    min-width="auto"
    @close="date = value"
  >
    <template #activator="{ on, attrs }">
      <v-text-field
        :value="dateText"
        :label="label"
        :prepend-icon="prependIcon"
        readonly
        v-bind="{ ...attrs, ...$attrs }"
        :dense="dense"
        v-on="on"
      />
    </template>

    <v-date-picker
      v-model="date"
      v-bind="$attrs"
      :type="type"
      first-day-of-week="1"
      color="primary"
      @input="$refs.menu.save(date)"
    >
    </v-date-picker>
  </v-menu>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from '@nuxtjs/composition-api'
import { DateTime } from 'luxon'
export default defineComponent({
  props: {
    value: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: 'Date',
    },
    prependIcon: {
      type: String,
      default: 'mdi-calendar',
    },
    dense: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'date',
    },
  },
  setup(props, { emit }) {
    const menuV = ref(false)
    const date = ref('')
    const dateText = computed(() => {
      if (props.type === 'month')
        return DateTime.fromISO(date.value).toFormat('yyyy-MM')
      else return DateTime.fromISO(props.value).toISODate()
    })
    const dateModel = ref('')
    watch(dateModel, (n) => emit('input', n))
    watch(
      () => props.value,
      () => {
        if (props.value) {
          if (props.type === 'month')
            date.value = DateTime.fromISO(props.value).toFormat('yyyy-MM')
          else date.value = DateTime.fromISO(props.value).toISODate()
        } else date.value = ''
      },
      { immediate: true }
    )
    return { menuV, date, dateText, dateModel }
  },
})
</script>

<style scoped></style>
