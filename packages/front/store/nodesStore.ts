import { defineStore } from "pinia";
import { NodeState } from "~/../api/dist/types";

export const useNodesStore = defineStore('nodes', {
  state: () => ({
    states: [] as NodeState[]
  }),
})
