import { useRouter } from "@nuxtjs/composition-api";
import { NodeState, OS } from "~/../api/dist/types";
import { useSnackbarStore } from "~/store/snackbarStore";

export function useTerminal() {
  const { show } = useSnackbarStore()
  const router = useRouter()

  function getSshCommand(state: NodeState) {
    const username = state.os === OS.UBUNTU ? state.username : state.usernameWindows

    if (username)
      return `clear; ssh ${username}@${state.host}`
    else {
      const err = `No username found for OS: ${state.os}`
      show(err)
      throw new Error(err)
    }
  }

  async function runInTerminal(state: NodeState) {
    router.push('/app/terminal?host=' + state.host)

    const queryOpts = { name: 'clipboard-write', allowWithoutGesture: false };
    const result = await navigator.permissions.query(queryOpts as PermissionDescriptor);
    if (result.state === 'granted') {
      await navigator.clipboard.writeText(getSshCommand(state))
      show('SSH command copied to clipboard just in case')
    }
  }

  return { runInTerminal, getSshCommand }
}
