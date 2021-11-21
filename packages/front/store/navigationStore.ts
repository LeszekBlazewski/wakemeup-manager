import { defineStore } from "pinia";

export const useNavigationStore = defineStore('navigation', {
  state: () => ({
    title:'Dashboard'
  }),
})
