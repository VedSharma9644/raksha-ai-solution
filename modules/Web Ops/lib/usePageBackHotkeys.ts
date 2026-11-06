import { useEffect } from "react";

function isVisible(element: Element): boolean {
  if (!(element instanceof HTMLElement) || element.hidden) return false;
  return element.getClientRects().length > 0;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return Boolean(
    target.closest(
      "input, textarea, select, [contenteditable]:not([contenteditable='false'])"
    )
  );
}

function hasOpenOverlay(): boolean {
  const nodes = document.querySelectorAll(
    '[aria-modal="true"], [role="dialog"], [role="alertdialog"], [role="listbox"], [role="menu"]'
  );
  for (const node of nodes) {
    if (isVisible(node)) return true;
  }
  return false;
}

/** Escape and Backspace run the page header back action when it is safe to leave. */
export function usePageBackHotkeys(onBack?: () => void): void {
  useEffect(() => {
    if (!onBack) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key !== "Escape" && event.key !== "Backspace") return;
      if (hasOpenOverlay()) return;

      if (event.key === "Backspace" && isEditableTarget(event.target)) return;
      if (
        event.key === "Escape" &&
        event.target instanceof HTMLElement &&
        (event.target.tagName === "TEXTAREA" || event.target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      onBack();
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onBack]);
}
