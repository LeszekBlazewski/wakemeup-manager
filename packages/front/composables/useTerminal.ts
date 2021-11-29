import { useRouter } from "@nuxtjs/composition-api";
import { NodeState } from "~/../api/dist/types";
import { useSnackbarStore } from "~/store/snackbarStore";

export function useTerminal() {
  const { show } = useSnackbarStore()
  const router = useRouter()

  function getSshCommand(state: NodeState) {
    return `clear; ssh ${state.username}@${state.host}`
  }
  async function runInTerminal(state: NodeState) {
    router.push('/app/terminal?host=' + state.host)

    const queryOpts = { name: 'clipboard-write', allowWithoutGesture: false };
    const result = await navigator.permissions.query(queryOpts as PermissionDescriptor);
    if (result.state === 'granted') {
      await navigator.clipboard.writeText(getSshCommand(state))
      show('SSH command was copied to clipboard just in case!')
    }
  }
  return { runInTerminal, getSshCommand }
}
