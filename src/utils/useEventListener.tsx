import * as React from "react";

export const isRef = (e: any): e is React.RefObject<any> => {
    return (e as React.RefObject<any>).current !== undefined;
};

export default function useEventListener<K extends keyof GlobalEventHandlersEventMap>(
    node: HTMLElement | Document | Window | null | undefined,
    event: K,
    listener: (event: GlobalEventHandlersEventMap[K]) => void,
    options?: boolean | (AddEventListenerOptions & { useWindow?: boolean })
) {
    React.useEffect(() => {
        if (!node) {
            return;
        }

        const listenerWrapper = ((e: GlobalEventHandlersEventMap[K]) =>
            listener(e)) as EventListener;

        node.addEventListener(event, listenerWrapper, options);

        return () => node.removeEventListener(event, listenerWrapper);
    }, [event, listener, node, options]);
}
