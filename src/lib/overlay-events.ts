export const OPEN_COMMAND_MENU_EVENT = "ya:open-command-menu";

export function requestCommandMenu(): void {
  window.dispatchEvent(new CustomEvent(OPEN_COMMAND_MENU_EVENT));
}

export const OPEN_TERMINAL_EVENT = "ya:open-terminal";

export function requestTerminal(): void {
  window.dispatchEvent(new CustomEvent(OPEN_TERMINAL_EVENT));
}
