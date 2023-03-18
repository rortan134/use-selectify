import * as React from "react";

function getDelta(
  pointA: { x: number; y: number },
  pointB: { x: number; y: number }
) {
  return {
    x: pointA.x - pointB.x,
    y: pointA.y - pointB.y,
  };
}

function sum(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: a.x + b.x, y: a.y + b.y };
}

const ORIGIN: { x: number; y: number } = Object.freeze({ x: 0, y: 0 });

export default function usePan(
  ref: React.RefObject<HTMLElement | null>
): [{ x: number; y: number }, (e: React.PointerEvent) => void] {
  const [panState, setPanState] = React.useState<{ x: number; y: number }>(
    ORIGIN
  );

  const lastPointRef = React.useRef(ORIGIN); // last observed mouse position on pan.

  const pan = React.useCallback((e: MouseEvent | TouchEvent) => {
    if (e.cancelable) {
      e.preventDefault();
    }

    const lastPoint = lastPointRef.current;
    const point = { x: (e as MouseEvent).pageX, y: (e as MouseEvent).pageY };
    lastPointRef.current = point;

    setPanState((panState) => {
      const delta = getDelta(lastPoint, point);
      const offset = sum(panState, delta);

      return offset;
    });
  }, []);

  const endPan = React.useCallback(() => {
    document.removeEventListener("pointermove", pan);
    document.removeEventListener("pointerup", endPan);
    document.removeEventListener("pointercancel", endPan);
  }, [pan]);

  const startPan = React.useCallback(
    (event: React.PointerEvent<Element>) => {
      if (!ref.current) return;

      document.addEventListener("pointermove", pan);
      document.addEventListener("pointerup", endPan);
      document.addEventListener("pointercancel", endPan);

      lastPointRef.current = { x: event.pageX, y: event.pageY };
    },
    [endPan, pan, ref]
  );

  return [panState, startPan];
}
