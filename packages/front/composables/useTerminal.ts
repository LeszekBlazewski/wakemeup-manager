import {  useRouter } from "@nuxtjs/composition-api";
import { NodeState } from "~/../api/dist/types";
import { useSnackbarStore } from "~/store/snackbarStore";

export function useTerminal() {
  const { show } = useSnackbarStore()
  const router = useRouter()

  function getSshCommand(state: NodeState) {
    return `clear; ssh ${state.username}@${state.host}`
  }
  async function runInTerminal(state: NodeState) {
    await navigator.clipboard.writeText(getSshCommand(state))
    router.push('/app/terminal?host='+state.host)
    show('SSH command was copied to clipboard just in case!')
  }
  return { runInTerminal, getSshCommand }
}
