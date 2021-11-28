import { defineStore } from "pinia";
import { NodeState } from "~/../api/dist/types";

export const useNodesStore = defineStore('nodes', {
  state: () => ({
    states: [] as NodeState[],
    heartbeat: 0
  }),
  actions: {
    beat() {
      this.heartbeat = (this.heartbeat+1)%2
    }
  }
})
