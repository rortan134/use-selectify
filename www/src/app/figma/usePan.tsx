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

// TS Type Guard
export const isTouchEvent = (e: any): e is React.TouchEvent => {
  return (e as React.TouchEvent).touches !== undefined;
};

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

    if (isTouchEvent(e) && e.touches.length > 1) {
      return;
    }

    const lastPoint = lastPointRef.current;
    const point = isTouchEvent(e)
      ? { x: e.touches[0].pageX, y: e.touches[0].pageY }
      : { x: (e as MouseEvent).pageX, y: (e as MouseEvent).pageY };

    lastPointRef.current = point;

    setPanState((panState) => {
      const delta = getDelta(lastPoint, point);
      const offset = sum(panState, delta);

      return offset;
    });
  }, []);

  const endPan = React.useCallback(() => {
    document.removeEventListener("mousemove", pan);
    document.removeEventListener("mouseup", endPan);
  }, [pan]);

  const startSwipe = React.useCallback(
    (e: TouchEvent) => {
      if (!ref.current) return;
      ref.current.addEventListener("touchmove", pan);
      ref.current.addEventListener("touchend", endPan);
      ref.current.addEventListener("touchcancel", endPan);

      lastPointRef.current = {
        x: e.changedTouches[0].pageX,
        y: e.changedTouches[0].pageY,
      };
    },
    [endPan, pan, ref]
  );

  const endSwipe = React.useCallback(() => {
    if (!ref.current) return;
    ref.current.removeEventListener("touchmove", pan);
    ref.current.removeEventListener("touchend", endSwipe);
    ref.current.removeEventListener("touchstart", startSwipe);
  }, [pan, ref, startSwipe]);

  const startPan = React.useCallback(
    (event: React.PointerEvent<Element>) => {
      if (!ref.current) return;

      document.addEventListener("mousemove", pan);
      document.addEventListener("mouseup", endPan);

      ref.current.addEventListener("touchstart", startSwipe, { passive: true });
      ref.current.addEventListener("touchend", endSwipe);

      if (isTouchEvent(event)) {
        lastPointRef.current = {
          x: event.touches[0].pageX,
          y: event.touches[0].pageY,
        };
      } else {
        lastPointRef.current = { x: event.pageX, y: event.pageY };
      }
    },
    [endPan, endSwipe, pan, ref, startSwipe]
  );

  return [panState, startPan];
}
