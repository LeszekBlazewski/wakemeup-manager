import { useRouter } from "@nuxtjs/composition-api";
import { NodeState, OS } from "~/../api/dist/types";
import { useSnackbarStore } from "~/store/snackbarStore";

export function useTerminal() {
  const { show } = useSnackbarStore()
  const router = useRouter()

  function getSshCommand(state: NodeState) {
    if (state.os === OS.UBUNTU)
      return `clear; ssh ${state.username}@${state.host}`
    else
      return `clear; ssh ${state.usernameWindows}@${state.host}`
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
