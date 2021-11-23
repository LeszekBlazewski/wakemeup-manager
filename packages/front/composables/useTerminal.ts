import {  useRouter } from "@nuxtjs/composition-api";
import { NodeState } from "~/../api/dist/types";
import { useSnackbarStore } from "~/store/snackbarStore";

export function useTerminal() {
  const { show } = useSnackbarStore()
  const router = useRouter()
  async function runInTerminal(state: NodeState) {
    await navigator.clipboard.writeText(
    `ssh ${state.username}@${state.host}`
    )
    router.push('/app/terminal')
    show('SSH command was copied to clipboard! Paste it in the terminal using CTRL+SHIFT+V')
  }
  return {runInTerminal}
}
