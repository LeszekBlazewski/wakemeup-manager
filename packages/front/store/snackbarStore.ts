import { defineStore } from "pinia";

export const useSnackbarStore = defineStore('snackbar', {
  state: () => ({
    visible: false,
    message:'',
    timeout: 10000,
    timeoutId: null as (null | ReturnType<typeof setTimeout>),
  }),
  actions: {
    show(message: string):void {
      if (this.timeoutId)
        clearTimeout(this.timeoutId)
      this.message = message
      this.visible = true
      this.timeoutId = setTimeout(() => {
        this.visible = false
      }, this.timeout)
    }
  }
})
