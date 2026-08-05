import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * True only after client hydration — for components that read client-only
 * state (localStorage, a persisted zustand store) and must render a stable
 * server-matching shell first. Built on useSyncExternalStore rather than a
 * `useState` + `useEffect(() => setState(true), [])` pair: the latter is a
 * setState-during-effect anti-pattern that trips React Compiler lint rules,
 * even though the intent (delay until hydrated) is legitimate.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
